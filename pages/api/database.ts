import type { NextApiRequest, NextApiResponse } from 'next';
import mysql, { RowDataPacket } from 'mysql2/promise';

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
    const [rows] = await connection.execute<RowDataPacket[]>('SELECT * FROM users');

    await connection.end();

    // Transform RowDataPacket[] to User[]
    const users: User[] = rows.map((row: RowDataPacket) => ({
      id: row.id,
      username: row.username,
      email: row.email,
    }));

    const responseData: Data = { data: users };

    res.status(200).json(responseData);
  } catch (error: any) {
    const errorMessage = typeof error === 'string' ? error : error.message || 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
}
