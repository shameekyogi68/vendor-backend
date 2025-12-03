/**
 * Script to drop the problematic vendorId index from the vendors collection
 * Run this once to fix the duplicate key error
 */

const mongoose = require('mongoose');

async function dropVendorIdIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('vendors');

    // List all indexes
    console.log('\nCurrent indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(idx => console.log(` - ${idx.name}:`, JSON.stringify(idx.key)));

    // Drop vendorId_1 index if it exists
    try {
      await collection.dropIndex('vendorId_1');
      console.log('\n✅ Successfully dropped vendorId_1 index');
    } catch (error) {
      if (error.code === 27 || error.message.includes('index not found')) {
        console.log('\n✅ vendorId_1 index does not exist (already removed)');
      } else {
        throw error;
      }
    }

    // List indexes after dropping
    console.log('\nIndexes after cleanup:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(idx => console.log(` - ${idx.name}:`, JSON.stringify(idx.key)));

    console.log('\n✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed');
  }
}

dropVendorIdIndex();
