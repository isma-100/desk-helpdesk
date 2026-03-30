const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI environment variable is not set!');
    console.error('   Go to Railway → your service → Variables tab');
    console.error('   Add variable: MONGO_URI = your MongoDB Atlas connection string');
    return; // Don't crash - let health check still work
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('   Check your MONGO_URI variable in Railway settings');
    // Retry after 5 seconds instead of killing the process
    console.log('   Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
