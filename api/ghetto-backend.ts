import { VoteCandidate } from './../common/types/vote-candidate.interface';
import { Vote, VoteRecord } from '../common/types/vote-record.interface';
import { VoteValidator } from './vote-validator';
import fs from 'fs-extra';
import WebSocket, {WebSocketServer} from 'ws';

export class GhettoBackend {
  voteRecords: Map<string, VoteRecord>;

  voteValidatorService: VoteValidator;
  voteCandidates: {[x: string]: VoteCandidate} = {};
  voters: string[] = [];

  ghettoConf = {
    publicVoteWeight: 1,
    juryVoteWeight: 1
  };

  wsServer: WebSocketServer;
  sockets: WebSocket[] = [];

  constructor() {
    this.voteRecords = new Map<string, VoteRecord>();
    this.voteValidatorService = new VoteValidator();

    const voteCandidates: VoteCandidate[] = JSON.parse(
      fs.readFileSync('conf/contest-entries.conf.json', 'utf8')
    );
    for (const candidate of voteCandidates) {
      this.voteCandidates[candidate.id] = candidate;
    }

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

    this.wsServer = new WebSocketServer({port: 8888});
    this.wsServer.on('connection', (ws) => {
      ws.on('message', (data) => {
        console.log('got data', data);
      })
      this.sockets.push(ws);
    })
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
    this.voteCandidates[contestantId].image = pictureFileName;

    for (const s of this.sockets) {
      s.send(JSON.stringify({
        cmd: 'set-image',
        candidateId: contestantId,
        image: pictureFileName
      }));
    }

    const entriesArray: any[] = [];
    for (const vc in this.voteCandidates) {
      entriesArray.push(this.voteCandidates[vc]);
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
      throw new Error('NAUGHTY!');
    }
    if (!this.voteValidatorService.validateVote(vote)) {
      throw new Error('INVALID_VOTE');
    }

    this.voteRecords.set(voterId, {voterId, votes: vote});
    fs.writeFileSync(
      'data/votes.json',
      JSON.stringify(
        Object.fromEntries(this.voteRecords)
      )
    );
  }

  setJuryVote(vote: Vote[]): void {
    this.voteRecords.set('jury', {voterId: 'jury', votes: vote});
  }

  getJuryVote() {
    return this.voteRecords.get('jury');
  }

  getVotingResults() {
    // initialize vote counts
    for (const cid in this.voteCandidates) {
      this.voteCandidates[cid].votes = 0;
      this.voteCandidates[cid].juryVotes = 0;
    }

    // count public votes
    const voteRecordsArray = this.voteRecords.values();
    for (const voteRecord of voteRecordsArray) {
      for (const vote of voteRecord.votes) {

        // filter out cheeky twats
        if (this.voteCandidates[vote.candidateId]) {
          this.voteCandidates[vote.candidateId].votes! += vote.points;
        }
      }
    }

    // TODO: JURY VOTES

    const candidateArray = [];
    for (const cid in this.voteCandidates) {
      candidateArray.push(this.voteCandidates[cid]);
    }

    // normalize votes between public and jury
    let publicPoints = 0;
    let juryPoints = 0;
    for (const candidate of candidateArray) {
      publicPoints += candidate.votes ?? 0;
      juryPoints += candidate.juryVotes ?? 0;
    }

    // let's say 72 pub, 32 jur
    // multiplier is x2.25. jury * multiplier gives 72 pub.

    // then if public vote weighs 1 and jury vote weighs 2, we need to multiply that with 2 / 1 = 2

    const juryScoreMultiplier =
      (publicPoints / juryPoints)
      * (this.ghettoConf.juryVoteWeight / this.ghettoConf.publicVoteWeight);

    for (const candidate of candidateArray) {
      candidate.juryVotes = (candidate.juryVotes ?? 0) * juryScoreMultiplier;
      candidate.combinedVotes = (candidate.votes ?? 0) + candidate.juryVotes;
    }

    // sort on frontend pls
    return candidateArray;
  }

  getContestants() {
    return this.voteCandidates;
  }
}
