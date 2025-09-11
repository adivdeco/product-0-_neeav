
const mongoose = require('mongoose');

async function main() {
    await mongoose.connect(process.env.Db_URL)
}

module.exports = main;