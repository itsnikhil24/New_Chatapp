const mongoose = require("mongoose");



const userschema = mongoose.Schema({
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    phone_number: { 
        type: String, 
        required: true, 
        trim: true, 
        
    },
    profile_pic: [
        {
            type: String,
           
        }
    ]
}); // Automatically adds createdAt and updatedAt fields



module.exports = mongoose.model("user", userschema);