import type { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';

type Data = {
  message: string; // Ensure 'message' property is always present
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST!,
      user: process.env.DATABASE_USER!,
      password: process.env.DATABASE_PASSWORD!,
      database: process.env.DATABASE_NAME!,
    });

    const [rows] = await connection.execute('SELECT * FROM your_table');
    await connection.end();

    res.status(200).json({ data: rows });
  } catch (error: any) {
    const errorMessage = typeof error === 'string' ? error : error.message || 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
}
