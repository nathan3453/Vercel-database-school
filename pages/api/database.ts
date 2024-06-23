import type { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';

interface User {
  id: number;
  username: string;
  email: string;
}

interface Data {
  data: User[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST!,
      user: process.env.DATABASE_USER!,
      password: process.env.DATABASE_PASSWORD!,
      database: process.env.DATABASE_NAME!,
    });

    // Example SQL query to fetch users from 'users' table
    const [rows] = await connection.execute<User[]>('SELECT * FROM users');

    await connection.end();

    const responseData: Data = { data: rows };

    res.status(200).json(responseData);
  } catch (error: any) {
    const errorMessage = typeof error === 'string' ? error : error.message || 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
}
