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

// Create a reusable database connection pool
// This improves performance by reusing connections
let connectionPool: mysql.Pool | null = null;

const getConnectionPool = async () => {
  if (!connectionPool) {
    connectionPool = mysql.createPool({
      host: process.env.DATABASE_HOST!,
      user: process.env.DATABASE_USER!,
      password: process.env.DATABASE_PASSWORD!,
      database: process.env.DATABASE_NAME!,
      // Add pool configuration options for better resource management:
      connectionLimit: 10, // Limit the number of connections in the pool
      waitForConnections: true, // Wait for a connection to become available
      queueLimit: 0, // Unlimited queue size (default)
    });
  }
  return connectionPool;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const pool = await getConnectionPool();
    const connection = await pool.getConnection(); // Get a connection from the pool

    try {
      // Example SQL query to fetch users from 'users' table
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM users'
      );

      // Transform RowDataPacket[] to User[]
      const users: User[] = rows.map((row: RowDataPacket) => ({
        id: row.id,
        username: row.username,
        email: row.email,
      }));

      const responseData: Data = { data: users };

      res.status(200).json(responseData);
    } finally {
      // Always release the connection back to the pool
      connection.release(); 
    }
  } catch (error: any) {
    const errorMessage =
      typeof error === 'string' ? error : error.message || 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
}
