const express = require('express');
const router = express.Router();
const controller = require('../controllers/maincontroller');
const {logInLimiter} = require('../middlewares/rateLimiters');
const { isGuest, isLoggedIn } = require('../middlewares/auth');
const {validateSignUp, validateLogIn, validateResult} = require('../middlewares/validator');

//GET /about renders about.ejs page
router.get('/about',controller.about);

//GET /contact renders contact.ejs page
router.get('/contact',controller.contact);

//GET /users/new: send html form for creating a new user account
router.get('/signup', isGuest, controller.signup);

//POST /users: create a new user account
router.post('/signup', isGuest, logInLimiter, validateSignUp, validateResult, controller.create);

//GET /users/login: send html for logging in
router.get('/login', isGuest, controller.getUserLogin);

//POST /users/login: authenticate user's login
router.post('/login', isGuest, logInLimiter, validateLogIn, validateResult, controller.login);

//GET /users/profile: send user's profile page
router.get('/profile', isLoggedIn, controller.profile);

//POST /users/logout: logout a user
router.get('/logout', isLoggedIn, controller.logout);

module.exports = router;