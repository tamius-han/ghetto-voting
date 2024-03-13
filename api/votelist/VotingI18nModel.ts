import { Model, prop } from '@rawmodel/core';

export class VotingI18nModel {
  static DB_TABLE: 'voting_i18n_data';

  public voting_id: number;

  public language: string;

  public title: string

  public description?: string;

  constructor(data: VotingI18nModel) {
    this.voting_id = data.voting_id;
    this.language = data.language;
    this.title = data.title;
    this.description = data.description;
  }
}
