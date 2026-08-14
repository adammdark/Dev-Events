import mongoose, { type Mongoose } from "mongoose";

type MongooseCache = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

declare global {
  // Store the MongoDB connection on the global object so Next.js hot reloading
  // does not create a fresh connection on every request during development.
  var mongooseCache: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable.");
}

const mongoUri: string = MONGODB_URI;

// Reuse the same cached connection across requests and module reloads.
const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

async function connectToDatabase(): Promise<Mongoose> {
  // Return the existing connection if it is already established.
  if (cached.conn) {
    return cached.conn;
  }

  // Establish a single connection and cache the promise to avoid race conditions
  // when multiple requests try to connect at the same time.
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri, {
        dbName: process.env.MONGODB_DB_NAME,
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset the cached promise so the next attempt can retry cleanly.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
