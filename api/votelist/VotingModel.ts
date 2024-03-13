import { Model, prop }   from '@rawmodel/core';
import {VotingI18nModel} from './VotingI18nModel';
import { Pool }          from 'mysql2';
import MySQLUtil         from 'api/middleware/MySQLUtil';

type VotingListOptions = {
  skip?: number,
  limit?: number
}

export class VotingModel {
  static DB_TABLE = `voting`;

  id?: number;

  voteInfo: VotingI18nModel[];

  // current state of the vote:
  allowPublicRegistration: boolean;

  allowPublicVoting: boolean;

  // in case we want to require users to do oauth
  requireOauth?: boolean;

  // scheduled stuff
  openRegistrationsAt?: number;

  closeRegistrationsAt?: number;

  openVotingAt?: number;

  closeVotingAt?: number;

  constructor(data: VotingModel) {
    this.id = data.id;
    this.voteInfo = data.voteInfo;
    this.allowPublicRegistration = data.allowPublicRegistration;
    this.allowPublicVoting = data.allowPublicVoting;
    this.openRegistrationsAt = data.openRegistrationsAt;
    this.closeRegistrationsAt = data.closeRegistrationsAt;
    this.openVotingAt = data.openVotingAt;
    this.closeVotingAt = data.closeVotingAt;
  }

  static processDbResults(results: any[]): VotingModel[] {
    const modelsOut: VotingModel[] = [];
    let lastId = null;
    for (let i = 0; i < results.length; i++) {
      if (results[i].id === lastId) {
        modelsOut[modelsOut.length - 1].voteInfo.push({
          voting_id: lastId,
          language: results[i].language,
          title: results[i].title,
          description: results[i].description
        } as VotingI18nModel)
      } else {
        modelsOut.push({
          id: results[i].id,
          allowPublicRegistration: results[i].allowPublicRegistration,
          allowPublicVoting: results[i].allowPublicVoting,
          openRegistrationsAt: results[i].openRegistrationsAt,
          closeRegistrationsAt: results[i].closeRegistrationsAt,
          openVotingAt: results[i].openVotingAt,
          closeVotingAt: results[i].closeVotingAt,
          requireOauth: results[i].requireOauth,
          voteInfo: [{
            voting_id: results[i].id,
            language: results[i].language,
            title: results[i].title,
            description: results[i].description
          }] as VotingI18nModel[]
        } as VotingModel);
      }

      lastId = results[i].id;
    }


    return modelsOut;
  }


  static async list(pool: Pool, listOptions: VotingListOptions = {}): Promise<VotingModel[]> {
    listOptions.skip = listOptions.skip ?? 0;
    listOptions.limit = Math.min(listOptions.limit ?? 0, 64);

    const conn = await MySQLUtil.getConnection(pool);
    const results = await MySQLUtil.query(
      `SELECT
          v.id, allowPublicRegistration, allowPublicVoting, openRegistrationsAt, closeRegistrationsAt, openVotingAt, closeVotingAt, requireOauth,
          vd.language as language, vd.title as title, vd.description as description
        FROM
          ${VotingModel.DB_TABLE} v
        LEFT JOIN
          ${VotingI18nModel.DB_TABLE} vd ON vd.voting_id = id
        ORDER BY createdAt DESC
        GROUP BY id
        SKIP ? LIMIT ?
      `,
      [listOptions.skip, listOptions.limit],
      conn
    );

    return VotingModel.processDbResults(results)
  }

  static async getById(pool: Pool, id: number): Promise<VotingModel> {
    const conn = await MySQLUtil.getConnection(pool);
    const results = await MySQLUtil.query(
      `SELECT
          v.id as id, allowPublicRegistration, allowPublicVoting, openRegistrationsAt, closeRegistrationsAt, openVotingAt, closeVotingAt, requireOauth,
          vd.language as language, vd.title as title, vd.description as description
        FROM
          ${VotingModel.DB_TABLE} v
        LEFT JOIN
          ${VotingI18nModel.DB_TABLE} vd ON vd.voting_id = id
        WHERE id = ?
        GROUP BY id`,
      [id],
      conn
    );

    return VotingModel.processDbResults(results)[0];
  }


  /**
   *
   * @param data
   */
  async create(pool: Pool): Promise<any> {
    const conn = await MySQLUtil.getConnection(pool);

    if (!this.voteInfo.length) {
      console.error('No vote info provided.')
      throw {
        code: 422,
        message: 'No vote info provided.'
      }
    }

    await MySQLUtil.beginTransaction(conn);

    try {
      // voting needs to exist before data
      const results = await MySQLUtil.query(
        `INSERT INTO ${VotingModel.DB_TABLE} SET ?`,
        {
          allowPublicRegistration: this.allowPublicRegistration,
          allowPublicVoting: this.allowPublicVoting,
          openRegistrationsAt: this.openRegistrationsAt ?? null,
          closeRegistrationsAt: this.closeRegistrationsAt ?? null,
          openVotingAt: this.openVotingAt ?? null,
          closeVotingAt: this.closeVotingAt ?? null
        },
        conn
      );

      // create table for public votes

      // add voteInfo objects
      await MySQLUtil.query(
        `INSERT INTO ${VotingI18nModel.DB_TABLE} SET ?`,
        this.voteInfo.map(
          (x: VotingI18nModel) => {
            return {
              voting_id: results.insertId,
              language: x.language,
              title: x.title,
              description: x.description,
            }
          }
        ),
        conn
      );

      await MySQLUtil.commit(conn);
    } catch (e) {
      await MySQLUtil.rollback(conn);
      throw e;
    }

    return this;
  }

  async update(pool: Pool): Promise<any> {
    const conn = await MySQLUtil.getConnection(pool);

    if (!this.voteInfo.length) {
      console.error('No vote info provided.')
      throw {
        code: 422,
        message: 'No vote info provided.'
      }
    }

    await MySQLUtil.beginTransaction(conn);

    try {
      // voting needs to exist before data
      const results = await MySQLUtil.query(
        `INSERT INTO ${VotingModel.DB_TABLE} SET ? ON DUPLICATE KEY UPDATE`,
        {
          id: this.id,
          allowPublicRegistration: this.allowPublicRegistration,
          allowPublicVoting: this.allowPublicVoting,
          openRegistrationsAt: this.openRegistrationsAt ?? null,
          closeRegistrationsAt: this.closeRegistrationsAt ?? null,
          openVotingAt: this.openVotingAt ?? null,
          closeVotingAt: this.closeVotingAt ?? null
        },
        conn
      );

      // add voteInfo objects
      await MySQLUtil.query(
        `INSERT INTO ${VotingI18nModel.DB_TABLE} SET ? ON DUPLICATE KEY UPDATE`,
        this.voteInfo.map(
          (x: VotingI18nModel) => {
            return {
              voting_id: results.insertId,
              language: x.language,
              title: x.title,
              description: x.description,
            }
          }
        ),
        conn
      );

      await MySQLUtil.commit(conn);
    } catch (e) {
      await MySQLUtil.rollback(conn);
      throw e;
    }

    return this;
  }


  // TODO: delete function. Must delete voting data, votes, contestants,
}
