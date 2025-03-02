const user = require('../models/usermodel'); // Adjust the path as necessary
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
var jwt = require('jsonwebtoken');
const chatmodel = require('../models/chatmodel');



exports.hello = function (req, res) {
  res.cookie("password", "123");
  res.render("register.ejs");
  // res.cookie("password1","1234");  
}

exports.checkcookie = (req, res) => {
  res.json(req.cookies);
}

exports.registerpage = (req, res) => {
  res.render("register.ejs");
}
exports.loginpage = (req, res) => {
  res.render("login.ejs");
}
exports.chatroom = async (req, res) => {
  try {
    const chatId = req.params.chatid;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, "secretKey"); // Verify the token
    const userId = decoded.id;
    
    req.params.id = chatId;
    const chat = await loadchats(req);

    // Find the recipient (the user being chatted with)
    const recipientId = chat.participants.find(id => id != userId); // Get the other user
    const recipient = await user.findById(recipientId).select("name profile_pic");

    res.render("chat.ejs", { 
      chatId, 
      id: userId, 
      chat, 
      recipient // Pass recipient data to EJS
    });

  } catch (error) {
    console.error("Error loading chat:", error);
    res.status(500).send("Internal Server Error");
  }
};
exports.dashboard = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, "secretKey"); // Verify token
    const userId = decoded.id;

    // Fetch chats where user is a participant
    const chats = await chatmodel
      .find({ participants: userId })
      .populate("participants", "name profile_pic");

    // Extract the list of chat participants (excluding the logged-in user)
    const users = [];
    chats.forEach(chat => {
      chat.participants.forEach(participant => {
        if (participant._id.toString() !== userId) {
          users.push({
            _id: participant._id,
            name: participant.name,
            profile_pic: participant.profile_pic
          });
        }
      });
    });

    // console.log(users);

    res.render("dashboard", { chats, users });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};


exports.createUser = async (req, res) => {
  try {


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

exports.login = async (req, res) => {
  try {



    const userfind = await user.findOne({ username: req.body.username });
    if (!userfind) {
      return res.status(400).send("User not found");
    }


    const isPasswordMatch = await bcrypt.compare(req.body.password, userfind.password);
    if (!isPasswordMatch) {
      return res.status(400).send("Incorrect Password");
    }


    const token = jwt.sign({ username: userfind.username, id: userfind._id }, "secretKey");


    res.cookie("token", token, { httpOnly: true, secure: true, maxAge: 3600000 }); // Secure cookies are recommended in production

    // Redirect the user or send a success response
    return res.status(200).redirect("/dashboard"); // Change "/dashboard" to your desired redirect path
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).send("An internal error occurred");
  }
};
exports.explore = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send("Unauthorized: No token provided");
    }

    const decoded = jwt.verify(token, "secretKey");
    const userId = decoded.id;

    // Find all users except the logged-in user
    const users = await user.find({ _id: { $ne: userId } });

    // Pass the users to the explore.ejs template
    res.render("explore.ejs", { users, userId });
  } catch (error) {
    console.error("Error in explore route:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

exports.logout = (req, res) => {
  try {
    // Clear the authentication cookie
    res.clearCookie("token", { httpOnly: true, secure: true });

    // Redirect the user to the login page or home page
    return res.status(200).redirect("/login");
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).send("An error occurred during logout");
  }
};
exports.chat = async (req, res) => {

  const receiverId = req.params.id;
  const token = req.cookies.token;
  const decoded = jwt.verify(token, "secretKey");
  const senderId = decoded.id;

  if (!senderId) {
    return res.redirect('/login'); // Redirect to login if not logged in
  }

  try {
    let chat = await chatmodel.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    
    if (!chat) {
      chat = new chatmodel({
        participants: [senderId, receiverId],
        messages: [],
      });
      await chat.save();
     
    }
    res.redirect(`/chatroom/${chat._id}`);

  }

 
  catch {
    console.error(err);
    res.status(500).send('Server error');


  }

}

async function loadchats(req){
  const token = req.cookies.token;
    if (!token) {
      return res.status(401).send("Unauthorized: No token provided");
    }

    const decoded = jwt.verify(token, "secretKey");
    const userId = decoded.id;
    const chatid_to_load=req.params.id;
   
    const chat=await chatmodel.findOne({_id:chatid_to_load});
    const chat_participants=chat.participants;

    const isParticipant= chat_participants.some(participant => participant.equals(userId));

    if(isParticipant===true){
    
    }
    else{
    
    }

    return chat;
    


}






