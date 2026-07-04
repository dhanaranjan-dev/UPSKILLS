const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`🚀 Launch sequence complete — MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`💥 Mission abort — MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
