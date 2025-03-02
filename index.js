const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const app = express();
const server = http.createServer(app);
const PORT = 3000;

// Dependencies
const io = new Server(server);
const userroutes = require("./routes/userroutes");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const chatmodel = require("./models/chatmodel");
require("dotenv").config();
const upload = multer({ storage: multer.memoryStorage() }); // Memory storage for file uploads

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

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
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinRoom", (chatId) => {
    socket.join(chatId);
    console.log(`User joined room: ${chatId}`);
  });

  socket.on("chat message", async ({ chatId, message, senderId }) => {
    console.log("Received data:", { chatId, message, senderId });

    // Find the chat by chatId
    const chat = await chatmodel.findById(chatId);

    if (!chat) {
      console.error("Chat not found!");
      return;
    }

    // Create a new message object
    const newMessage = {
      senderId: senderId,
      content: message,
    };

    // Push the new message to the messages array in the chat
    chat.messages.push(newMessage);

    // Save the chat document
    await chat.save();

    console.log(`Message saved to room ${chatId}: ${message}`);

    // Emit the message to the room, including senderId
    // Emit the message to the room, including senderId
    const messageToSend = {
      content: message,
      senderId: senderId,
    };
    console.log("Emitting message:", messageToSend); // Add this line
    io.to(chatId).emit("message", messageToSend);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});

module.exports=server;