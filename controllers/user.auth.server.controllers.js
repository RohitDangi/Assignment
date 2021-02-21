"use strict";
var config = require("../config.server"),
    models = require("../models"),
    jwt = require("jsonwebtoken");


exports.hasAuthentcation = function (req, res, next) {
  const token = req.headers["x-access-token"] || req.query["x-access-token"];
    if (token) {
      jwt.verify(token, config.secret, async function (err, decoded) {
        try {
          if (err) {
            res.status(403).json({
              success: false,
              message: "Wrong Token",
            });
          } else {
            console.log("user",decoded);
            let user = await models.UserSchema.findOne({ _id: decoded.data });
  
            if (!user) {
              res.status(403).json({
                success: false,
                message: "Oops!!! You are not Authorized Please Contact Admin.",
              });
            }
            user = user.toJSON();
  
            let userInfo = {
              id: user._id,
              name: user.name,
              email: user.email ? user.email : "",
              phoneNumber: user.phoneNumber ? user.phoneNumber : "",
            };
  
            req.user = userInfo;
            next();
          }
        } catch (error) {
          return Utils.universalFunctions.sendError(error, res);
        }
      });
    } else {
      res.status(403).json({
        success: false,
        message: "No Token",
      });
    }
};

