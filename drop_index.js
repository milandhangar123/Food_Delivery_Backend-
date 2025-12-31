// Script to drop problematic indexes from the users collection
// Run this if you get "E11000 duplicate key error" related to indexes

const mongoose = require('mongoose');
require('dotenv').config();

const mongoURL = process.env.MONGO_URI || process.env.MONGO_URL;

if (!mongoURL) {
  console.error('ERROR: MONGO_URI or MONGO_URL environment variable is not set!');
  console.error('Please set MONGO_URI in your .env file.');
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(mongoURL);
    console.log('✅ Connected to MongoDB');
    
    const coll = mongoose.connection.db.collection('users');
    
    // Get all indexes
    const indexes = await coll.indexes();
    console.log('\n📋 Current indexes on users collection:');
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });
    
    // Drop problematic indexes
    const problematicIndexes = ['name_1', 'name_-1']; // Add any other problematic index names here
    
    for (const indexName of problematicIndexes) {
      const hasIndex = indexes.some((i) => i.name === indexName);
      if (hasIndex) {
        try {
          await coll.dropIndex(indexName);
          console.log(`✅ Dropped index: ${indexName}`);
        } catch (err) {
          if (err.code === 27) {
            console.log(`ℹ️  Index ${indexName} doesn't exist (might have been dropped already)`);
          } else {
            console.error(`❌ Error dropping index ${indexName}:`, err.message);
          }
        }
      } else {
        console.log(`ℹ️  Index ${indexName} not found`);
      }
    }
    
    console.log('\n✅ Index cleanup complete!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error in drop_index script:', err.message);
    process.exit(1);
  }
};

run();
