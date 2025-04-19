import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please Define MONGODB URI in env file");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
    // If there is already an established connection, just return it.
    if (cached.conn) {
        return cached.conn;
    }
    
    // If there is no promise, create a PROMISE
  if (!cached.promise) {
    const opts = {
      bufferCommands: true, // Queue operations until MongoDB connection is established like User.find() will execute as soon as the connection is establish.
      maxPoolSize: 10, // Max no. of Socket Connection allowed
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then(() => mongoose.connection);
  }

  // If there is already a promise, just wait and let try catch handle it
  try {
    cached.conn = await cached.promise
  } catch (dinasour) {
    cached.promise = null;
    throw dinasour
  }

  return cached.conn;
}
