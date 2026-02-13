import BetterSqlite3 from 'better-sqlite3';
import { join } from 'path';

// 数据库接口，兼容 Cloudflare D1 和本地 SQLite
export interface DB {
  prepare(query: string): Statement;
  exec(query: string): void;
}

export interface Statement {
  bind(...values: any[]): Statement;
  run(): RunResult;
  get(): any;
  all(): any[];
}

export interface RunResult {
  success: boolean;
  meta?: {
    changes: number;
    last_row_id: number;
  };
}

// 本地开发使用 SQLite
class LocalDatabase implements DB {
  private db: BetterSqlite3.Database;

  constructor(dbPath: string) {
    this.db = new BetterSqlite3(dbPath);
    this.db.pragma('journal_mode = WAL');
  }

  prepare(query: string): Statement {
    const stmt = this.db.prepare(query);
    return {
      bind: (...values: any[]) => {
        // SQLite 使用位置参数，直接返回自身
        return {
          bind: () => this as any,
          run: () => {
            const result = stmt.run(...values);
            return {
              success: true,
              meta: {
                changes: result.changes,
                last_row_id: Number(result.lastInsertRowid),
              },
            };
          },
          get: () => stmt.get(...values),
          all: () => stmt.all(...values),
        };
      },
      run: () => {
        const result = stmt.run();
        return {
          success: true,
          meta: {
            changes: result.changes,
            last_row_id: Number(result.lastInsertRowid),
          },
        };
      },
      get: () => stmt.get(),
      all: () => stmt.all(),
    };
  }

  exec(query: string): void {
    this.db.exec(query);
  }
}

// 获取数据库实例
export function getDatabase(env?: any): DB {
  // 生产环境使用 Cloudflare D1
  if (env?.DB) {
    return env.DB as DB;
  }
  
  // 本地开发使用 SQLite
  const dbPath = join(process.cwd(), 'local.db');
  return new LocalDatabase(dbPath);
}

// Database 辅助类
export class Database {
  private db: DB;

  constructor(env?: any) {
    this.db = getDatabase(env);
  }

  async getUserByUsername(username: string): Promise<any> {
    return this.db.prepare('SELECT * FROM users WHERE username = ?').bind(username).get();
  }

  async getUserById(userId: number): Promise<any> {
    return this.db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).get();
  }

  async getUserProfile(userId: number): Promise<any> {
    return this.db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').bind(userId).get();
  }

  async execute(query: string, params: any[] = []): Promise<any> {
    const stmt = this.db.prepare(query);
    const result = stmt.bind(...params).run();
    return {
      lastInsertRowid: result.meta?.last_row_id,
      changes: result.meta?.changes
    };
  }

  async query(query: string, params: any[] = []): Promise<any[]> {
    return this.db.prepare(query).bind(...params).all();
  }

  getRawDB(): DB {
    return this.db;
  }
}
