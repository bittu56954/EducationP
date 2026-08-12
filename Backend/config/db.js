import mongoose from 'mongoose';
import dns from 'dns';

// Fix for DNS SRV resolution error (querySrv ECONNREFUSED) with MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS cannot be set
}

const DEFAULT_MONGO_URI = 'mongodb+srv://krbittu803110_db_user:wWOWgNzccfVgJt8C@cluster0.ywlp4gj.mongodb.net/india';

// Global cache to maintain a single MongoDB connection across serverless function invocations
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let mongoMemoryServer = null;

export const connectDB = async () => {
  mongoose.set('strictQuery', false);

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const mongoUri = process.env.MONGO_URI || DEFAULT_MONGO_URI;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    };

    cached.promise = (async () => {
      // 1. Try Cloud Atlas Database
      if (mongoUri) {
        try {
          console.log('📡 Connecting to MongoDB Atlas Cloud Database...');
          const conn = await mongoose.connect(mongoUri, opts);
          console.log('✅ Connected to MongoDB Atlas Cloud Database successfully!');
          return conn;
        } catch (err) {
          console.warn('⚠️  MongoDB Atlas Connection Failed:', err.message);
          console.log('🔄 Trying local/in-memory fallback database...');
        }
      }

      // 2. Try local MongoDB if running locally
      if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
        try {
          console.log('📡 Attempting to connect to local MongoDB (mongodb://127.0.0.1:27017/online_class)...');
          const conn = await mongoose.connect('mongodb://127.0.0.1:27017/online_class', {
            serverSelectionTimeoutMS: 2000,
            connectTimeoutMS: 2000,
          });
          console.log('✅ Connected to local MongoDB successfully!');
          return conn;
        } catch (localErr) {
          // Local MongoDB not running
        }

        // 3. Fallback to MongoMemoryServer (Dynamic import to avoid crashing Vercel serverless bundle)
        try {
          console.log('⚡ Starting In-Memory MongoDB Server (Offline Mode)...');
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          mongoMemoryServer = await MongoMemoryServer.create({
            binary: { version: '4.4.29' }
          });
          const uri = mongoMemoryServer.getUri();
          const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
          console.log('✅ Connected to In-Memory MongoDB successfully!');
          return conn;
        } catch (memErr) {
          console.error('❌ Database connection fallback failed:', memErr.message);
        }
      }

      throw new Error('Database connection could not be established');
    })();
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
};




