const express = require("express");
const app = express();
const PORT = 3000;

// Dependencies
const userroutes = require("./routes/userroutes");
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
require("dotenv").config();
const upload = multer({ storage: multer.memoryStorage() }); // Memory storage for file uploads

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

module.exports = mongoose;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(userroutes); // Routes (ensure this is after middleware)

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});
