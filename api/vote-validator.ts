import fs from 'fs';
import { Vote } from '../common/types/vote-record.interface';

export interface VoteValidatorConfig {
  validPublicScores: {
    points: number,
    instances?: number
  }[];
}

export class VoteValidator {


  private validatorConfig: VoteValidatorConfig;

  constructor() {
    try {
      this.validatorConfig = JSON.parse(
        fs.readFileSync('conf/vote-validator.conf.json', 'utf-8')
      );
      console.info('[VoteValidator] Read vote validator config:');
      console.info(this.validatorConfig);
    } catch (e) {
      console.error("FAILED TO READ VALIDATOR CONFIG!");
      throw e;
    }

    for (const voteScoreOptions of this.validatorConfig.validPublicScores) {
      if (!voteScoreOptions.instances) {
        voteScoreOptions.instances = 1;
      }
    }
  }

  validateVote(vote: Vote[]): boolean {
    const pointCounts: {[x: number]: number} = {};

    for (const v of vote) {
      if (pointCounts[v.points]) {
        pointCounts[v.points]++;
      } else {
        pointCounts[v.points] = 1;
      }
    }

    for (const pointCount in pointCounts) {
      const score = this.validatorConfig.validPublicScores.find(x => x.points === pointCounts[pointCount]);
      if (!score) {
        return false;
      }
      // we set score.instances in constructor
      if (pointCounts[pointCount] > (score.instances ?? 0)) {
        return false;
      }
    }

    return true;
  }

  getConfig(): any {
    return this.validatorConfig;
  }
}
