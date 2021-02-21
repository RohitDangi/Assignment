"use strict";

var user = require("./users"),
  uploadFile = require("./uploadFiles.routes"),
  routes = {
    user,
    uploadFile,
  };
module.exports = routes;
