const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/randommovie';

async function updateMovies() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const result = await mongoose.connection.db.collection('movies').updateMany(
      { watched: { $exists: false } },
      { $set: { watched: false } }
    );
    
    console.log(`Updated ${result.modifiedCount} movies`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateMovies();
