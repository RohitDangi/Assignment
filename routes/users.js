'use strict';

var express = require('express');
const { user } = require('.');
var router = express.Router();
var auth = require('../controllers/user.auth.server.controllers');

var users = require('../controllers/users.server.controller');

router.route('/signup')
    .post(users.signup);
router.route('/login')
    .post(users.login);
router.route('/users')
    .get(auth.hasAuthentcation, users.getAllUsers);
router.route('/user/:id')
    .get(auth.hasAuthentcation, users.getParticularUser);
router.route('/user/:id')
    .patch(auth.hasAuthentcation, users.editUser);
router.route('/user/:id')
	  .delete(auth.hasAuthentcation, users.deleteUser);
module.exports = router;
