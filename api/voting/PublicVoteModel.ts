export type ContestantPublicScore = {
  contestant_id: number,
  score: number
};

export class VoteModel {
  voting_id: number;
  voter_id: number;
  contestant_id: number;
  points: number;


}

export class PublicVoteModel {
  static DB_TABLE: 'public_vote';

  public voting_id: number,
  public voter_id; number,
  public contestant_id: number,
  public points: number,
  public isValid: boolean,
  public createdAt: number

}
