const express=require("express");
const usercontroller=require("../controllers/usercontrollers");
const router=express.Router();

router.get("/",usercontroller.hello);
router.get("/checkcookie",usercontroller.checkcookie);

module.exports=router;
