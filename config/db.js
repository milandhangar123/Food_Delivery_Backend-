const mongoose = require('mongoose');

const connectDB = async () => {
  // Get MongoDB connection string from environment variables
  // NEVER hardcode credentials in production!
  const mongoURL = process.env.MONGO_URI || process.env.MONGO_URL;

  if (!mongoURL) {
    console.error('ERROR: MONGO_URI or MONGO_URL environment variable is not set!');
    console.error('Please set MONGO_URI in your .env file or environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURL, {
      // Recommended connection options
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    // Don't exit in production - let the process manager handle it
    if (process.env.NODE_ENV === 'development') {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;




  
// add your mongoDB connection string above.
// Do not use '@' symbol in your databse user's password else it will show an error.