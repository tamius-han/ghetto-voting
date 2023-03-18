/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { VoteCandidate } from './../common/types/vote-candidate.interface';
import { Vote, VoteRecord } from '../common/types/vote-record.interface';
import { VoteValidator } from './vote-validator';
import fs from 'fs-extra';
import sharp from 'sharp';

export class GhettoBackend {
  voteRecords: Map<string, VoteRecord>;

  voteValidatorService: VoteValidator;
  voteCandidates: VoteCandidate[] = [];
  processedVoteCandidates: {[x: number]: VoteCandidate} = {};
  voters: string[] = [];
  voteStart: Date = new Date();
  voteEndTime?: Date;
  votingStarted = false;
  votingEnded = false;
  lastPublicVoteTime?: number;

  ghettoConf = {
    publicVoteWeight: 1,
    juryVoteWeight: 1
  };

  constructor() {
    this.voteRecords = new Map<string, VoteRecord>();
    this.voteValidatorService = new VoteValidator();

    this.reloadContestEntries();

    fs.ensureDirSync('data');
    fs.ensureDirSync('data/images');
    fs.ensureDirSync('conf');

    if (fs.existsSync('data/voter-list.json')) {
      const {voters, start} = JSON.parse(fs.readFileSync('data/voter-list.json', 'utf8'));

      if (!voters || !start) {
        this.resetVoting();
      } else {
        this.voters = voters;
        this.voteStart = start;
      }
    }
    if (fs.existsSync('data/votes.json')) {
      this.voteRecords = new Map(
        Object.entries(
          JSON.parse(
            fs.readFileSync('data/votes.json', 'utf8')
          )
        )
      );
    }

    // save votes every 30 seconds
    setInterval(() => {
      console.log('writing vote data to file!');
      fs.writeFileSync(
        'data/votes.json',
        JSON.stringify(
          Object.fromEntries(this.voteRecords)
        )
      );
    }, 30000);
  }

  private reloadContestEntries() {
    if (fs.existsSync('conf/contest-entries.conf.json')) {
      this.voteCandidates = JSON.parse(
        fs.readFileSync('conf/contest-entries.conf.json', 'utf8')
      );
    }
    this.processedVoteCandidates = {};
    for (const candidate of this.voteCandidates) {
      this.processedVoteCandidates[candidate.id] = candidate;
    }
  }

  // resets vote counts _and_ voter list
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  resetVoting() {
    this.voters = [];
    this.voteStart = new Date();
    this.votingStarted = false;
    this.voteEndTime = undefined;
    this.lastPublicVoteTime = undefined;

    this.saveVoters();

    this.voteRecords = new Map();
    fs.writeFileSync(
      'data/votes.json',
      JSON.stringify(
        Object.fromEntries(this.voteRecords)
      )
    );
  }

  startVoting() {
    this.votingStarted = true;
    this.votingEnded = false;
    this.voteEndTime = undefined;
  }

  stopVoting(endTime?: Date) {
    this.votingEnded = true;

    if (endTime && endTime > new Date()) {
      this.voteEndTime = endTime;
      setTimeout(() => {
        this.votingStarted = false;
        this.voteEndTime = new Date(+new Date() + 30000); // grace period when voting gets closed
      }, +endTime - +new Date());
    } else {
      this.votingStarted = false;
      this.voteEndTime = new Date(+new Date() + 30000); // stop accepting votes 30 seconds from now
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  getVoteCount() {
    const voters = this.voters.length;
    const submittedVoteCount = this.getJuryVote() ? this.voteRecords.size - 1 : this.voteRecords.size;

    return {
      voters: voters,
      submittedVotes: submittedVoteCount
    };
  }

  getVoteStart() {
    return {
      voteStart: +this.voteStart,
    }
  }

  /**
   * Generates random and unique ID
   * @returns
   */
  generateVoterId() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const idCandidate = (Math.random() + 1).toString(36);
      if (idCandidate === 'jury') {
        continue;
      }
      if (this.voters.includes(idCandidate)) {
        continue;
      }

      // update and save voter list
      this.voters.push(idCandidate);
      this.saveVoters();
      console.log('new voter ID requested:', idCandidate);
      return idCandidate;
    }
  }

  registerCandidateImage(contestantId: string, pictureFileName: string): void {
    console.log('registering image — contestant/image', contestantId, pictureFileName);
    this.processedVoteCandidates[+contestantId].image = pictureFileName;

    const entriesArray: any[] = [];
    for (const vc in this.processedVoteCandidates) {
      entriesArray.push(this.processedVoteCandidates[vc]);
    }

    fs.writeFileSync('conf/contest-entries.conf.json', JSON.stringify(entriesArray, null, 2));
  }

  /**
   * Returns configuration that frontend will use
   */
  getVotingConfig() {
    const validatorConf = this.voteValidatorService.getConfig();

    return {
      availableScores: validatorConf.validPublicScores
    }
  }

  /**
   * Gets voting options for current voter ID
   */
  getPublicVote(voterId: string): VoteRecord {
    return this.voteRecords.get(voterId) ?? {voterId, votes: []};
  }

  /**
   * Sets voting options for current voter ID
   * @param voterId
   * @param vote
   */
  setPublicVote(voterId: string, vote: Vote[]): void {
    if (!this.voters.includes(voterId)) {
      console.warn('User is not on the voter ID list. This means user\'s frontend may be out of date — we will return an error. Frontend should reset and request new ID.');
      throw new Error('NAUGHTY!');
    }
    if (!this.voteValidatorService.validateVote(vote)) {
      throw new Error('INVALID_VOTE');
    }
    if (this.voteEndTime && new Date() > this.voteEndTime) {
      throw new Error('VOTE_AFTER_GRACE');
    }

    this.lastPublicVoteTime = +new Date();
    this.voteRecords.set(voterId, {voterId, votes: vote});
  }

  setJuryVote(vote: Vote[]): void {
    this.voteRecords.set('jury', {voterId: 'jury', votes: vote});
  }

  getJuryVote() {
    return this.voteRecords.get('jury');
  }

  getVotingResults() {
    // initialize vote counts
    for (const cid in this.processedVoteCandidates) {
      this.processedVoteCandidates[cid].votes = 0;
      this.processedVoteCandidates[cid].juryVotes = 0;
    }

    // count public votes
    const voteRecordsArray = this.voteRecords.values();
    for (const voteRecord of voteRecordsArray) {
      for (const vote of voteRecord.votes) {

        // this is jury vote
        if (!vote.points) {
          continue;
        }

        // filter out cheeky twats
        if (this.processedVoteCandidates[+vote.candidateId] !== undefined) {
          if (this.processedVoteCandidates[+vote.candidateId].votes !== undefined) {
            this.processedVoteCandidates[+vote.candidateId].votes! += vote.points;
          } else {
            this.processedVoteCandidates[+vote.candidateId].votes = 0;
          }
        }
      }
    }

    // count public votes
    const juryVotes = this.voteRecords.get('jury') as unknown as any;
    if (juryVotes) {
      for (let i = 0; i < juryVotes.votes.length; i++) {
        let sum = 0;
        for (const v of juryVotes.votes[i]) {
          sum += +v;
        }
        this.processedVoteCandidates[i].juryVotes = sum;
      }
    }
    // TODO: JURY VOTES

    const candidateArray = [];
    for (const cid in this.processedVoteCandidates) {
      candidateArray.push(this.processedVoteCandidates[cid]);
    }
    // sort on frontend pls
    return candidateArray;
  }

  resetVoteCandidates() {
    // remove all images
    try {
      for (let i = 0; i < this.voteCandidates.length; i++) {
        if (fs.existsSync(`data/images/${i}.webp`)) {
          fs.removeSync(`data/images/${i}.webp`);
          fs.removeSync(`data/images/${i}-full.webp`);
          console.log(`removed data/images/${i}.webp`);
        }
      }
      console.log('images removed.');
    } catch (e) {
      console.error('failed to remove images.');
    }

    this.voteCandidates = [];
    this.saveContestants();
    this.reloadContestEntries();
  }

  getContestants() {
    return this.processedVoteCandidates;
  }

  private saveContestants() {
    fs.writeFileSync('conf/contest-entries.conf.json', JSON.stringify(this.voteCandidates));
  }
  private saveVoters() {
    fs.writeFileSync(
      'data/voter-list.json',
      JSON.stringify({
        voters: this.voters,
        start: this.voteStart
      })
    );
  }

  addContestant(contestantData: VoteCandidate) {
    const nextId = this.voteCandidates.length;
    this.voteCandidates.push({...contestantData, id: nextId, imageUpdate: +new Date()});
    this.saveContestants();
    this.reloadContestEntries();
  }

  updateContestant(contestant: VoteCandidate) {
    const i = this.voteCandidates.findIndex(x => x.id === contestant.id);

    if (i !== -1) {
      throw 'CONTESTANT_DOES_NOT_EXIST';
    }

    this.voteCandidates[i] = contestant;
    this.saveContestants();
    this.reloadContestEntries();
  }

  async addContestantImage(contestantId: number, image: any) {
    console.log('adding contestant image. data:');
    const res = await sharp(image.data)
      .rotate()         // needed for exif
      .resize(1080)
      .webp({
        quality: 80,
        effort: 6
      })
      .toFile(`data/images/${contestantId}.webp`);

    // also convert original image to exif without resizing & with better quality
    await sharp(image.data)
      .rotate()         // needed for exif
      .webp({
        quality: 80,
        effort: 6
      })
      .toFile(`data/images/${contestantId}-full.webp`);

    // for purposes of ghetto caching
    this.voteCandidates[contestantId].imageUpdate = +(new Date());
    this.saveContestants();
    this.reloadContestEntries();
    return res;
  }

  deleteContestant(contestantId: number) {
    // delete image
    fs.removeSync(`data/images/${contestantId}.webp`);
    fs.removeSync(`data/images/${contestantId}-full.webp`);

    // correct contestant images, because removing contestant will change IDs
    for (let i = contestantId + 1; i < this.voteCandidates.length; i++) {
      if (fs.existsSync(`data/images/${i}.webp`)) {
        fs.moveSync(`data/images/${i}.webp`, `data/images/${i - 1}.webp`, { overwrite: true });
        fs.moveSync(`data/images/${i}-full.webp`, `data/images/${i - 1}-full.webp`, { overwrite: true });
      }
    }

    const deletedEntry = this.voteCandidates.splice(contestantId, 1);
    console.log('deleted contestant:', deletedEntry);

    // update imageUpdate for ghetto caching
    for (let i = contestantId; i < this.voteCandidates.length; i++) {
      this.voteCandidates[i].imageUpdate = +(new Date());
    }

    // reload contestant data
    this.saveContestants();
    this.reloadContestEntries();
  }
}
