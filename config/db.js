const mongoose = require('mongoose');
const googleSheetsService = require('../services/googleSheetsService');
const connectDB = async () => {
  try {
    //  const conn = await mongoose.connect(`mongodb+srv://excerpterp:excerpterp2025@cluster0.anwegvj.mongodb.net/ERP`);
    const conn = await mongoose.connect(`mongodb+srv://employee:employee123@cluster0.cq6dqkz.mongodb.net/ExcerptERP`);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
     return googleSheetsService.initialize();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
