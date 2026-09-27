const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hostelhub');
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    console.error(`\n---------------------------------------------------------`);
    console.error(`IMPORTANT: To connect to MongoDB Atlas:`);
    console.error(`1. Open server/.env`);
    console.error(`2. Set MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/hostelhub?retryWrites=true&w=majority`);
    console.error(`3. Or start local MongoDB on mongodb://127.0.0.1:27017/hostelhub`);
    console.error(`---------------------------------------------------------\n`);
    // Exit process with failure in strict environment, but we can also handle graceful retry if needed
    process.exit(1);
  }
};

module.exports = connectDB;
