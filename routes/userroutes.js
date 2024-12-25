const express = require("express");
const usercontroller = require("../controllers/usercontrollers");
const router = express.Router();
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() }); // Move upload middleware here

router.get("/", usercontroller.hello);
router.get("/checkcookie", usercontroller.checkcookie);
router.get("/register", usercontroller.registerpage);
router.post("/register", upload.single("profile_pic"), usercontroller.createUser); // Use multer middleware

module.exports = router;
