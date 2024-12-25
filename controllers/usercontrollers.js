const user = require('../models/usermodel'); // Adjust the path as necessary
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;

exports.hello = function (req, res) {
    res.cookie("password", "123");
    res.render("register.ejs");
    // res.cookie("password1","1234");  
}

exports.checkcookie = (req, res) => {
    console.log(req.cookies);
    res.json(req.cookies);
}

exports.registerpage=(req,res)=>{
    res.render("register.ejs");
}

exports.createUser = async (req, res) => {
    try {
        console.log("Request body:", req.body); // Log form data
        console.log("Uploaded file:", req.file); // Log uploaded file details

        const { name, username, phone_number, password } = req.body;

        if (!name || !username || !phone_number || !password) {
            return res.status(400).send({ message: 'All fields are required' });
        }

        if (!req.file) {
            return res.status(400).send({ message: 'Profile picture is required' });
        }

        const existingUser = await user.findOne({ username, phone_number });
        if (existingUser) {
            return res.status(400).send({ message: "User already exists with the same username or phone number" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Handle profile picture upload to Cloudinary
        const profilePicUrl = await exports.upload(req.file.buffer);

        const newUser = await user.create({
            name,
            username,
            phone_number,
            password: hashedPassword,
            profile_pic: profilePicUrl,
        });

        res.status(201).send({ message: 'User created successfully', user: newUser });
    } catch (err) {
        console.error("Error during user creation:", err);
        res.status(500).send({ error: 'Internal server error' });
    }
};


exports.upload = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: 'uploads' },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error); // Log the error
                    reject(new Error('Upload failed'));
                } else {
                    resolve(result.secure_url);
                }
            }
        ).end(fileBuffer);
    });
};


