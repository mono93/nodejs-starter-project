const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { read } = require('fs');
const config = require('../config.json');
const User = require('../models/user');
const { validationResult } = require('express-validator');

module.exports = {
    getLogin(req, res, next) {
        let message = req.flash('error');
        if (message.length > 0) {
            message = message[0];
        } else {
            message = null;
        }
        res.render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            isAuthenticated: false,
            errorMessage: message,
            oldInput: {
                email: '',
                password: ''
            },
            validationErrors: []
        });
    },

    postLogin(req, res, next) {
        const email = req.body.email;
        const password = req.body.password;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render('auth/login', {
                path: '/login',
                pageTitle: 'Login',
                errorMessage: errors.array()[0].msg,
                oldInput: {
                    email: email,
                    password: password
                },
                validationErrors: errors.array()
            });
        }

        User.findOne({ email: email })
            .then(user => {
                if (!user) {
                    return res.status(422).render('auth/login', {
                        path: '/login',
                        pageTitle: 'Login',
                        errorMessage: 'Invalid email or password.',
                        oldInput: {
                            email: email,
                            password: password
                        },
                        validationErrors: []
                    });
                }

                bcrypt.compare(password, user.password)
                    .then((doMatch) => {
                        if (doMatch) {
                            req.session.isLoggedIn = true
                            req.session.user = user;
                            return req.session.save(err => {
                                res.redirect('/');
                            });
                        }
                        return res.status(422).render('auth/login', {
                            path: '/login',
                            pageTitle: 'Login',
                            errorMessage: 'Invalid email or password.',
                            oldInput: {
                                email: email,
                                password: password
                            },
                            validationErrors: []
                        });
                    })
                    .catch(() => { res.redirect('/login') })

            })
            .catch(err => console.log(err));
    },

    postLogout(req, res, next) {
        req.session.destroy((err) => {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/');
            }
        })
    },

    getSignup(req, res, next) {
        let message = req.flash('error');
        if (message.length > 0) {
            message = message[0];
        } else {
            message = null;
        }
        res.render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            isAuthenticated: false,
            errorMessage: message,
            oldInput: {
                email: '',
                password: '',
                confirmPassword: ''
            },
            validationErrors: []
        });
    },

    postSignup(req, res, next) {
        const email = req.body.email;
        const password = req.body.password;
        const errors = validationResult(req);

        console.log(errors.array())

        if (!errors.isEmpty()) {
            return res.status(422).render('auth/signup', {
                path: '/signup',
                pageTitle: 'Signup',
                errorMessage: errors.array()[0].msg,
                oldInput: {
                    email: email,
                    password: password,
                    confirmPassword: req.body.confirmPassword
                },
                validationErrors: errors.array()
            });
        }

        bcrypt
            .hash(password, 12)
            .then(hashedPassword => {
                const user = new User({
                    email: email,
                    password: hashedPassword,
                    cart: { items: [] }
                });

                return user.save();
            })
            .then(result => {
                res.redirect('/login');
            })
            .catch(err => console.log(err));
    },

    getReset(req, res, next) {
        let message = req.flash('error');
        if (message.length > 0) {
            message = message[0];
        } else {
            message = null;
        }
        res.render('auth/reset', {
            path: '/reset',
            pageTitle: 'Reset Password',
            errorMessage: message
        });
    },

    postReset(req, res, next) {
        crypto.randomBytes(32, (err, buffer) => {
            if (err) {
                console.log(err);
                return res.redirect('/reset');
            }
            const token = buffer.toString('hex');
            User.findOne({ email: req.body.email })
                .then(user => {
                    if (!user) {
                        req.flash('error', 'No account with that email found.');
                        return res.redirect('/reset');
                    }
                    user.resetToken = token;
                    user.resetTokenExpiration = Date.now() + 3600000;
                    return user.save();
                })
                .then(result => {
                    // res.redirect('/');
                    res.redirect(`/reset/${token}`); // since no mail service implemented so far
                })
                .catch(err => {
                    console.log(err);
                });
        });
    },

    getNewPassword(req, res, next) {
        const token = req.params.token;
        User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
            .then(user => {
                let message = req.flash('error');
                if (message.length > 0) {
                    message = message[0];
                } else {
                    message = null;
                }
                res.render('auth/new-password', {
                    path: '/new-password',
                    pageTitle: 'New Password',
                    errorMessage: message,
                    userId: user._id.toString(),
                    passwordToken: token
                });
            })
            .catch(err => {
                console.log(err);
            });
    },  

    postNewPassword(req, res, next) {
        const newPassword = req.body.password;
        const userId = req.body.userId;
        const passwordToken = req.body.passwordToken;
        let resetUser;

        User.findOne({
            resetToken: passwordToken,
            resetTokenExpiration: { $gt: Date.now() },
            _id: userId
        })
            .then(user => {
                resetUser = user;
                return bcrypt.hash(newPassword, config.hashSalt);
            })
            .then(hashedPassword => {
                resetUser.password = hashedPassword;
                resetUser.resetToken = undefined;
                resetUser.resetTokenExpiration = undefined;
                return resetUser.save();
            })
            .then(result => {
                res.redirect('/login');
            })
            .catch(err => {
                console.log(err);
            });
    }

}