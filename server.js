const express = require('express');
const app = express();
const connectToDB = require('./config/db')

// accept incoming requests
app.use(express.json({ extended: false }));

// connect to database
connectToDB();

app.listen(5000, () => console.log('Server Running at port 5000'))