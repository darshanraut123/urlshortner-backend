const express = require("express");
const { authenticateToken } = require("./auth");
const router = express.Router();
const UserController = require("./controller");
router.get("/auth", UserController.authenticate);
router.post("/signup", UserController.signup);
router.post("/login", UserController.login);
router.get("/verify/:token", UserController.verify);
router.post("/forgotPassword", UserController.forgotPassword);
router.post("/addUrl", authenticateToken, UserController.addUrl);
router.get("/getUrl/:short", authenticateToken, UserController.getUrl);
router.get("/",UserController.appRunning);
module.exports = router;
