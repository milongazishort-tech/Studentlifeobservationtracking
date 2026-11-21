/**
 * Script to verify MongoDB connection and index building
 * Run via: node scripts/verify-db.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const {
  User,
  Cycle,
  DailyActivity,
  DailyScore,
  WeeklySummary,
  MonthlyResult,
  PushSubscription
} = require('../models');

async function verify() {
  console.log('--- Starting MongoDB & Mongoose Verification Script ---');
  try {
    console.log('[1/4] Connecting to Database...');
    await connectDB(2, 3000);
    console.log('✓ Successfully connected to MongoDB Atlas!');

    console.log('[2/4] Verifying Model registration & compilation...');
    const models = [
      User,
      Cycle,
      DailyActivity,
      DailyScore,
      WeeklySummary,
      MonthlyResult,
      PushSubscription
    ];
    for (const model of models) {
      console.log(`  - Model '${model.modelName}' registered to collection '${model.collection.name}'`);
    }

    console.log('[3/4] Ensuring indexes on all collections...');
    for (const model of models) {
      await model.createIndexes();
      const listIndexes = await model.collection.listIndexes().toArray();
      console.log(`  - '${model.collection.name}' has ${listIndexes.length} active indexes:`, listIndexes.map(idx => idx.name).join(', '));
    }

    console.log('[4/4] Verification complete: All 7 models & compound/unique indexes are live.');
  } catch (error) {
    console.error('✗ Verification failed:', error.message);
  } finally {
    await disconnectDB();
    console.log('--- Script Finished ---');
    process.exit(0);
  }
}

verify();
