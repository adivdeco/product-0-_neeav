const express = require('express');
const app = express();
require('dotenv').config({ quiet: true });
const main = require('./config/db')
const cookieParser = require('cookie-parser')

app.use(express.json());
app.use(cookieParser());




main().then(async () => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);

    })
})

module.exports = app;