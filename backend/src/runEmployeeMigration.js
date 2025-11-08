// runEmployeeMigration.js
const mongoose = require('mongoose');
require('dotenv').config();

const main = require('./config/db');
const createEmployeeRecords = require('./utils/createEmployeeRecords');

async function runMigration() {
    try {
        console.log('🔄 Starting employee records migration...');

        // Connect to database
        await main();

        // Run the migration
        await createEmployeeRecords();

        console.log('✅ Employee records migration completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();



// this is for creating employee