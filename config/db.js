const mongoose = require('mongoose');
const DB_SECRET = require('./dbSecret')

// connect to database
const connectToDB = async () => {
     try {
    await mongoose.connect(DB_SECRET, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    console.log("Connected to MongoDB...");
  } catch (err) {
    console.error(err.message);
    // Terminate the application
    process.exit(1);
  }
  
};

module.exports = connectToDB;
