const express = require('express');
const app = express();
const connectToDB = require('./config/db')

// accept incoming requests
app.use(express.json({ extended: false }));

// connect to database
connectToDB();

// Routes
app.use('/api/auth', require('./routes/api/auth'));

// run server
const PORT = 8080;
app.listen(PORT, () => console.log(`Server Running at port ${PORT}`))