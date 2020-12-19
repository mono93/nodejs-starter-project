const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { check } = require('express-validator');
const User = require('../models/user');

router.get('/login', authController.getLogin);
router.post(
    '/login',
    [
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email address.')
            .normalizeEmail(),
        check('password', 'Password has to be valid.')
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim()
    ], authController.postLogin);
router.post('/logout', authController.postLogout);
router.get('/signup', authController.getSignup);
router.post(
    '/signup',
    [
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email')
            .custom((value, { req }) => {
                return User.findOne({ email: value })
                    .then(userDoc => {
                        if (userDoc) {
                            return Promise.reject('Email already exist, please pick a different one');
                        }
                    })
            })
            .normalizeEmail()
        ,
        check('password', 'Incorrect Password')
            .isLength({ min: 5, max: 9 })
            .isAlphanumeric()
            .trim()
        ,
        check('confirmPassword')
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.confirmPassword) {
                    throw new Error('Password does not match with confirm password')
                }
                return true;
            })
    ],
    authController.postSignup);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router