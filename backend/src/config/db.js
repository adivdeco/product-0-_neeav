
const mongoose = require('mongoose');

async function main() {
    await mongoose.connect(process.env.DB_URL, {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    })
}

module.exports = main;