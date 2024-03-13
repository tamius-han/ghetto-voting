export class PublicParticipantModel {
  static DB_TABLE: 'public_participant';

  public id: number;
  public token: string;
  public hasValidVote: boolean;
  public email?: string; // TODO: if we require oauth

  public isSuspicious?: boolean;
  public isBanned?: boolean;

  constructor(data: PublicParticipantModel) {
    this.id = data.id;
    this.token = data.token;
    this.hasValidVote = data.hasValidVote;
    this.email = data.email;
  }
}
