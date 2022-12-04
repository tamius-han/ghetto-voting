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

  ghettoConf = {
    publicVoteWeight: 1,
    juryVoteWeight: 1
  };

  constructor() {
    this.voteRecords = new Map<string, VoteRecord>();
    this.voteValidatorService = new VoteValidator();

    this.reloadContestEntries();

    fs.ensureDirSync('data');
    if (fs.existsSync('data/voter-list.json')) {
      this.voters = JSON.parse(fs.readFileSync('data/voter-list.json', 'utf8'));
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
      fs.writeFileSync(
        'data/votes.json',
        JSON.stringify(
          Object.fromEntries(this.voteRecords)
        )
      );
    }, 30000);
  }

  private reloadContestEntries() {
    this.voteCandidates = JSON.parse(
      fs.readFileSync('conf/contest-entries.conf.json', 'utf8')
    );
    this.processedVoteCandidates = {};
    for (const candidate of this.voteCandidates) {
      this.processedVoteCandidates[candidate.id] = candidate;
    }
  }

  /**
   * Generates random and unique ID
   * @returns
   */
  generateVoterId() {
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
      fs.writeFileSync('data/voter-list.json', JSON.stringify(this.voters));
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
    // if (!this.voters.includes(voterId)) {
    //   throw new Error('NAUGHTY!');
    // }
    if (!this.voteValidatorService.validateVote(vote)) {
      throw new Error('INVALID_VOTE');
    }

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
        if (this.processedVoteCandidates[+vote.candidateId]) {
          this.processedVoteCandidates[+vote.candidateId].votes! += vote.points;
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

  getContestants() {
    return this.processedVoteCandidates;
  }

  private saveContestants() {
    fs.writeFileSync('conf/contest-entries.conf.json', JSON.stringify(this.voteCandidates));
  }

  addContestant(contestantData: VoteCandidate) {
    const nextId = this.voteCandidates.length;
    this.voteCandidates.push({...contestantData, id: nextId});
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

  addContestantImage(contestantId: number, image: any) {
    console.log('adding contestant image. data:', image, image.data);
    sharp(image.data)
      .resize(1080)
      .webp({
        quality: 80,
        effort: 6
      })
      .toFile(`data/images/${contestantId}.webp`);
  }

  deleteContestant(contestantId: number) {
    // correct contestant images, because removing contestant will change IDs
    for (let i = contestantId + 1; i < this.voteCandidates.length; i++) {
      if (fs.existsSync(`data/images/${i}.webp`)) {
        fs.moveSync(`data/images/${i}.webp`, `data/images/${i - 1}.webp`, { overwrite: true });
      }
    }

    const deletedEntry = this.voteCandidates.splice(contestantId, 1);
    console.log('deleted contestant:', deletedEntry);
    this.saveContestants();
    this.reloadContestEntries();
  }
}
