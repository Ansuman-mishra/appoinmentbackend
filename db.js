require("dotenv").config();
const mongoose = require("mongoose");

const dbUrl = process.env.MONGO_URI || "";
const connectDB = async () => {
    try {
        await mongoose.connect(dbUrl).then((data) => {
            console.log(`Database connected with ${data.connection.host}`);
        });
    } catch (err) {
        console.log("mongodb connection failed!", err.message);
        setTimeout(connectDB, 5000);
    }
};
module.exports = connectDB;
