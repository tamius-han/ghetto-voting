import {Pool, PoolConnection} from 'mysql2';

export default class MySQLUtil {
  static async getConnection(pool: Pool): Promise<PoolConnection> {
    return new Promise( (resolve, reject) => {
      pool.getConnection( (err, conn) => {
        if (err) {
          reject(err);
        }
        resolve(conn);
      })
    });
  }

  static async beginTransaction(connection: PoolConnection): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      connection.beginTransaction( (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      })
    });
  }

  static async query(query: string, data: any, connection: PoolConnection): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      connection.query(query, data, (err, results) => {
        if (err) {
          reject(err);
        }
        resolve(results);
      })
    });
  }

  static async commit(connection: PoolConnection): Promise<void> {
    return new Promise( (resolve, reject) => {
      connection.commit( (err) => {
        if (err) {
          reject(err);
        }
        resolve()
      })
    });
  }

  static async rollback(connection: PoolConnection): Promise<void> {
    return new Promise( (resolve, reject) => {
      connection.rollback( (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }
}
