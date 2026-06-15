import { pool } from "../database/pool.js";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  birth_date: string;
  password_hash?: string;
};

export const userRepository = {
  async findByEmail(email: string) {
    const result = await pool.query<UserRecord>(
      `SELECT id, name, email, birth_date, password_hash
       FROM users
       WHERE email = $1`,
      [email]
    );

    return result.rows[0] ?? null;
  },

  async findById(id: string) {
    const result = await pool.query<UserRecord>(
      "SELECT id, name, email, birth_date FROM users WHERE id = $1",
      [id]
    );

    return result.rows[0] ?? null;
  },

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    birthDate: string;
  }) {
    const result = await pool.query<UserRecord>(
      `INSERT INTO users (name, email, password_hash, birth_date)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, birth_date`,
      [data.name, data.email, data.passwordHash, data.birthDate]
    );

    return result.rows[0];
  },
};
