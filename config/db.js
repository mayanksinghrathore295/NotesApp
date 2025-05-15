// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('📊 MongoDB Connected to Database');
});

mongoose.connection.on('error', (err) => {
  console.error('⚠️ MongoDB Connection Error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB Disconnected');
});

// Close connection on process termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('⏏️ MongoDB Connection Closed Due to App Termination');
  process.exit(0);
});

module.exports = connectDB;