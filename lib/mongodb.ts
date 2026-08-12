import mongoose, { type Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

const mongoUri: string = MONGODB_URI;

/**
 * Cache the database connection across hot reloads in development.
 * Without this, Next.js can create multiple connections during local development.
 */
type MongooseCache = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Connect to MongoDB using Mongoose and reuse the cached connection when available.
 * This keeps the app efficient and avoids duplicate connection attempts.
 */
async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const mongoOptions: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(mongoUri, mongoOptions).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default dbConnect;
