import { MongoClient, Db } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

const mongoUrl = process.env.MONGO_URI || '';
const dbName = process.env.DB_NAME || 'swift_assignment';

let db: Db | null = null;

export async function connectToMongo(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    console.log('Connected successfully to MongoDB');
    db = client.db(dbName);
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectToMongo() first.');
  }
  return db;
}
