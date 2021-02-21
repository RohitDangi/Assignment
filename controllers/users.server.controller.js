"use strict";

let models = require("../models"),
    errorHandler = require("./errors.server.controller"),
    responseMessages = require("../resources/response.json"),
    universalFunctions = require("../utils/universalFunctions"),
    jwt = require("jsonwebtoken"),
    config = require("../config.server");

var crud = {
    signup: async function (req, res) {
        try {
            let payload = req.body;
            let userExists = await models.UserSchema.findOne({
                email: payload.email,
            });
            if (userExists) {
                res.status(400).send({
                    success: false,
                    message: responseMessages.USER_EXISTS,
                });
            } else {

                if (
                    !payload.name ||
                    !payload.email ||
                    !payload.phoneNumber ||
                    !payload.dateOfBirth ||
                    !payload.city ||
                    !payload.country ||
                    !payload.pinCode ||
                    !payload.profilePicture ||
                    !payload.password
                ) {
                    return res
                        .status(400)
                        .send({ success: false, message: "Missing Fields" });
                } else {

                    let userInfo = await models.UserSchema.create(payload);
                    var token = jwt.sign({ data: userInfo._id }, config.secret, {
                        expiresIn: config.sessionExpire, // in seconds
                    });
                    let user = {
                        _id: userInfo._id,
                        name: userInfo.name,
                        phoneNumber: userInfo.phoneNumber,
                        email: userInfo.email,
                        token,
                    };
                    return universalFunctions.sendSuccess(
                        {
                            statusCode: 200,
                            message: responseMessages.SIGNUP_SUCCESS,
                            data: user,
                        },
                        res
                    );
                }
            }
        } catch (error) {
            console.log("err", error);
            res.status(400).send({
                success: false,
                message: errorHandler.getErrorMessage(error),
            });
        }
    },
    login: async function (req, res) {
        try {
            if (!req.body.email || !req.body.password) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication failed. Missing credentials.",
                });
            }
            console.log("login payload", req.body);
            var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (regex.test(req.body.email)) {
                let username = req.body.email,
                    criteria =
                        username.indexOf("@") === -1
                            ? { email: username }
                            : { email: username };
                models.UserSchema.findOne(criteria, async function (err, user) {
                    if (err) {
                        return res.status(400).send({
                            success: false,
                            message: errorHandler.getErrorMessage(err),
                        });
                    }

                    if (!user) {
                        return res.status(401).json({
                            success: false,
                            message: "Authentication failed. User not found.",
                        });
                    }
                    if (user.isDeleted === true) {
                        return res.status(401).json({
                            success: false,
                            message: "Authentication failed. User not found.",
                        });
                    } else {
                        if (!user.authenticate(req.body.password)) {
                            return res.status(401).json({
                                success: false,
                                message: "Authentication failed. Passwords did not match.",
                            });
                        }
                        var token = jwt.sign({ data: user._id }, config.secret, {
                            expiresIn: config.sessionExpire, // in seconds
                        });
                        let body = req.body;
                        user = JSON.parse(JSON.stringify(user));

                        delete user["modified_at"];
                        delete user["created_at"];
                        delete user["__v"];
                        delete user["salt"];
                        delete user["isDeleted"];
                        delete user["password"];

                        res.json({
                            success: true,
                            token: token,
                            data: user,
                        });
                    }
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Email.",
                });
            }

        } catch (error) {
            res.status(400).send({
                success: false,
                message: errorHandler.getErrorMessage(error),
            });
        }
    },
    getAllUsers: async function (req, res) {
        try {
            let params = req.query;
            let sortingJSON = {};
            sortingJSON['created_at'] = "desc";
            let filter = {};
            if (params.text) {
                var regx = new RegExp(params.text, 'i');
                if (params.text.length > 0) {
                    filter['$or'] = [{
                        email: regx
                    }, {
                        name: regx
                    }, {
                        phoneNumber: regx
                    }]
                }
            }
            await models.UserSchema.find(filter, function (err, results) {
                if (err) {
                    res.status(400).send({
                        success: false,
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    results = JSON.parse(JSON.stringify(results))
                    results.map((e) => {
                        delete e.isDeleted;
                        delete e.modified_at;
                        delete e.created_at;
                        delete e.__v;
                    })
                    res.status(200).send({
                        success: true,
                        data: results
                    })
                }
            })
        } catch (error) {
            res.status(400).send({
                success: false,
                message: errorHandler.getErrorMessage(error),
            });
        }
    },
    getParticularUser: async function (req, res) {
        try {
            let id = req.params.id;
            if (!id) {
                res.status(400).send({
                    success: false,
                    message: "User Id Required",
                });
            }
            else {
                await models.UserSchema.findOne({ _id: id }, function (err, results) {
                    if (err) {
                        res.status(400).send({
                            success: false,
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        results = JSON.parse(JSON.stringify(results))

                        res.status(200).send({
                            success: true,
                            data: results
                        })
                    }
                })
            }
        } catch (error) {
            res.status(400).send({
                success: false,
                message: errorHandler.getErrorMessage(error),
            });
        }
    },
    editUser: async function (req, res) {
        try {
            let id = req.params.id;
            if (!id) {
                res.status(400).send({
                    success: false,
                    message: "User Id Required",
                });
            }
            else {
                let payload = req.body;

                if (
                    !payload.name ||
                    !payload.email ||
                    !payload.phoneNumber ||
                    !payload.dateOfBirth ||
                    !payload.city ||
                    !payload.country ||
                    !payload.pinCode ||
                    !payload.profilePicture
                ) {
                    return res
                        .status(400)
                        .send({ success: false, message: "Missing Fields" });
                } else {
                    payload.profilePicture = payload.profilePicture
                        ? payload.profilePicture.replace(`${config.serverUrl}+"/`, "")
                        : "";
                    await models.UserSchema.findOneAndUpdate(
                        { _id: id },
                        { $set: payload },
                        async function (err, rs) {
                            if (err) {
                                res.status(400).send({
                                    success: false,
                                    message: errorHandler.getErrorMessage(err),
                                });
                            } else {
                                let results = await models.UserSchema.findOne({ _id: id });
                                results = JSON.parse(JSON.stringify(results));
                                if (results.profilePicture) {
                                    results.profilePicture = results.profilePicture
                                        ? encodeURI(config.serverUrl + "/" + results.profilePicture)
                                        : "";
                                }
                                delete results["modified_at"];
                                delete results["created_at"];
                                delete results["__v"];
                                delete results["salt"];
                                delete results["created_at"];
                                delete results["isDeleted"];
                                delete results["password"];

                                res.status(200).send({
                                    success: true,
                                    data: results,
                                });
                            }
                        }
                    );
                }

            }
        } catch (error) {
            res.status(400).send({
                success: false,
                message: errorHandler.getErrorMessage(error),
            });
        }
    },
    deleteUser: async function (req, res) {
        try {
            let id = req.params.id;
            if (!id) {
                res.status(400).send({
                    success: false,
                    message: "User Id Required",
                });
            }
            else {
                await models.UserSchema.findOneAndDelete(
                    { _id: id }, function (err, resp) {
                        if (err) {
                            console.log("err", err);
                            res.status(400).send({
                                success: false,
                                message: errorHandler.getErrorMessage(err),
                            });
                        } else {
                            res.status(200).send({
                                success: true,
                                message: "User Deleted",
                            });
                        }
                    }
                );
            }
        } catch (error) {
            res.status(400).send({
                success: false,
                message: errorHandler.getErrorMessage(error),
            });
        }
    },
};

module.exports = crud;
