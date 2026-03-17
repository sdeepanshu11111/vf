import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in environment variables");
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = global._mongoClientPromise;

if (!cached) {
  const client = new MongoClient(MONGODB_URI);
  cached = global._mongoClientPromise = client.connect();
}

const clientPromise = cached;

export default clientPromise;

export async function getDb() {
  const client = await clientPromise;
  return client.db();
}
