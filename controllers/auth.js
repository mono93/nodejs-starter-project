const User = require('../models/user');

module.exports = {
    getLogin(req, res, next) {
        res.render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            isAuthenticated: false
        });
    },

    postLogin(req, res, next) {
        User.findById('5fcc7dc42f3fad35244ee33e')
            .then(user => {
                req.session.isLoggedIn = true
                req.session.user = user;
                req.session.save(err => {
                    res.redirect('/');
                });
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
    }

}