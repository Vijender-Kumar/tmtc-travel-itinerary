'use strict';

// Load environment variables
require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const redis = require('redis');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Connect to MongoDB
async function connectDB() {
  try {
    mongoose.connect(process.env.DB_URI);
    console.log(`Connected to ${process.env.ENVIRONMENT} database`);
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}
connectDB();

// Create Redis client
// const client = redis.createClient({
//   url: 'redis://127.0.0.1:6379'
// });

//For DockerFile Connectionf of REDIS
// const client = redis.createClient({
//   url: 'redis://redis:6379'
// });
const client = redis.createClient({
  url: process.env.REDIS_URL
});


// Connect Redis
client.connect()
  .then(() => console.log('Redis connected'))
  .catch(err => console.error('Redis connection error:', err));

// Graceful shutdown
const shutdown = async () => {
  try {
    console.log('Closing Redis connection...');
    await client.quit();
    console.log('Redis connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error closing Redis:', err);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('exit', shutdown);

// Export Redis client for use in routes/controllers
module.exports = {
  redisClient: client
};;

// Load Routes
require('./routes/index')(app, passport);

// Start server
const PORT = process.env.PORT || 4001;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});