const path = require('path');
const express = require('express');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const router = express.Router();
const { check } = require('express-validator');


router.get('/add-product', isAuth, adminController.getAddProduct);
router.get('/products', isAuth, adminController.getProducts);
router.post('/add-product', [
    check('title')
        .isString()
        .isLength({ min: 4 })
        .trim(),
    check('imageUrl')
        .isURL(),
    check('price')
        .isFloat(),
    check('description')
        .isLength({ min: 5, max: 400 })
        .trim()
], isAuth, adminController.postAddProduct);
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post('/edit-product', [
    check('title')
        .isString()
        .isLength({ min: 4 })
        .trim(),
    check('imageUrl')
        .isURL(),
    check('price')
        .isFloat(),
    check('description')
        .isLength({ min: 5, max: 400 })
        .trim()
], isAuth, adminController.postEditProduct);
router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
