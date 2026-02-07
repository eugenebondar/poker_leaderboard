import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongooseCache {
  conn: mongoose.Mongoose | null;
  promise: Promise<mongoose.Mongoose> | null;
}

const globalAny = global as unknown as { mongoose?: MongooseCache };
const cached: MongooseCache = globalAny.mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose: mongoose.Mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  globalAny.mongoose = cached;
  return cached.conn;
}
