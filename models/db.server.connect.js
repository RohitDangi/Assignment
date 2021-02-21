"use strict";

let mongoose = require("mongoose");
var url = "mongodb://localhost:27017/assignment";

mongoose.connect(
  url,
  {
    //  useMongoClient: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  (error) => {
    console.log("connection error", error);
  }
);

let timestamps = require("mongoose-timestamp");

mongoose.plugin(timestamps, {
  createdAt: "created_at",
  updatedAt: "modified_at",
});

module.exports = mongoose;
