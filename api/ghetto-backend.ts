import { VoteCandidate } from './../common/types/vote-candidate.interface';
import { Vote, VoteRecord } from '../common/types/vote-record.interface';
import { VoteValidator } from './vote-validator';
import fs from 'fs-extra';

export class GhettoBackend {
  voteRecords: Map<string, VoteRecord>;

  voteValidatorService: VoteValidator;
  voteCandidates: {[x: string]: VoteCandidate} = {};
  voters: string[] = [];

  ghettoConf = {
    publicVoteWeight: 1,
    juryVoteWeight: 1
  };

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
      this.voters.push(idCandidate);
      return idCandidate;
    }
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
