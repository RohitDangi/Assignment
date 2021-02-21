"use strict";

const express = require("express");
const router = express.Router();
var auth = require('../controllers/user.auth.server.controllers');
const uploads = require("../controllers/uploadFiles.controller");

router.route("/").post( uploads.Upload);
router.route("/").get((err,res)=>{
    console.log("res");
    res.send({hello:"hi"})
});

module.exports = router;
