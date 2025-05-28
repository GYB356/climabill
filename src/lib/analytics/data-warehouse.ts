import { Pool, QueryResult } from 'pg';
import { DATA_WAREHOUSE_CONFIG } from '../ai/config';

/**
 * Client for connecting to and querying the data warehouse
 */
export class DataWarehouseClient {
  private pool: Pool;
  private static instance: DataWarehouseClient;

  private constructor() {
    this.pool = new Pool({
      host: DATA_WAREHOUSE_CONFIG.host,
      database: DATA_WAREHOUSE_CONFIG.database,
      user: DATA_WAREHOUSE_CONFIG.user,
      password: DATA_WAREHOUSE_CONFIG.password,
      port: DATA_WAREHOUSE_CONFIG.port,
      ssl: process.env.NODE_ENV === 'production',
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    });

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  /**
   * Get singleton instance of the data warehouse client
   * @returns DataWarehouseClient instance
   */
  public static getInstance(): DataWarehouseClient {
    if (!DataWarehouseClient.instance) {
      DataWarehouseClient.instance = new DataWarehouseClient();
    }
    return DataWarehouseClient.instance;
  }

  /**
   * Execute a query on the data warehouse
   * @param query SQL query to execute
   * @param params Query parameters
   * @returns Query result
   */
  async query<T = any>(query: string, params?: any[]): Promise<T[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(query, params);
      return result.rows as T[];
    } finally {
      client.release();
    }
  }

  /**
   * Execute a parameterized query on the data warehouse
   * @param query SQL query to execute
   * @param params Named parameters object
   * @returns Query result
   */
  async paramQuery<T = any>(query: string, params: Record<string, any>): Promise<T[]> {
    // Convert named parameters to positional parameters
    const paramNames = Object.keys(params);
    const positionalQuery = paramNames.reduce((q, name, index) => {
      return q.replace(new RegExp(`:${name}\\b`, 'g'), `$${index + 1}`);
    }, query);

    const positionalParams = paramNames.map(name => params[name]);
    return this.query<T>(positionalQuery, positionalParams);
  }

  /**
   * Get a single row from a query
   * @param query SQL query to execute
   * @param params Query parameters
   * @returns Single row or null if not found
   */
  async queryOne<T = any>(query: string, params?: any[]): Promise<T | null> {
    const rows = await this.query<T>(query, params);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Execute a transaction with multiple queries
   * @param callback Function that executes queries within the transaction
   * @returns Result of the callback function
   */
  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * Close the connection pool
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}
