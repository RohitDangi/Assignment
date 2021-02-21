let   errorHandler = require('./errors.server.controller'), 
      universalFunctions = require('../utils/universalFunctions'),
      responseMessages = require('../resources/response.json'),
      Boom=  require('boom'),
      fs=  require('fs'),
      Config = require("../config.server"),

      multer=  require('multer')

let upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname); //use Date.now() for unique file keys
    },
  }),
  limits: {
    fileSize: "50mb",
  },
}).array("files");

module.exports = {
  Upload: async (req, res) => {
      console.log("here");
    try {
      await upload(req, res, (error, files) => {
        if (error) {
          return universalFunctions.sendError(error, res);
        }
        console.log("req.files",req.files);
        if (req.files.length <= 0) {
          throw Boom.badRequest(responseMessages.UPLOAD_FILE);
        }
        req.files &&
          req.files.map((val) => {
            val.path = `${Config.serverUrl}/${val.path}`;
          });
        return universalFunctions.sendSuccess(
          {
            statusCode: 200,
            message: responseMessages.FILES_UPLOAD_SUCCESSFULL,
            data: req.files,
          },
          res
        );
      });
    } catch (error) {
      return universalFunctions.sendError(error, res);
    }
  },

  removeUpload: async (req, res) => {
    try {
      if (!req.body.filePath) {
        throw Boom.badRequest(responseMessages.FILEPATH_REQUIRED);
      } else {
        let file =
          req.body.filePath &&
          req.body.filePath.replace(`${Config.serverUrl}`, "");
        if (fs.existsSync(file)) {
          await fs.unlinkSync(file);
          return universalFunctions.sendSuccess(
            {
              statusCode: 200,
              message: responseMessages.FILE_DELETE_SUCCESSFULL,
            },
            res
          );
        } else {
          throw Boom.badRequest(responseMessages.FILE_NOT_FOUND);
        }
      }
    } catch (error) {
      return universalFunctions.sendError(error, res);
    }
  },
};
