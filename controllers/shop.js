const Product = require('../models/product');
const Order = require('../models/order');

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const config = require('../config.json');

module.exports = {
  getProducts(req, res) {
    const page =  +req.query.page || 1;
    let totalItems;
    Product
      .find()
      .countDocuments()
      .then(numProducts => {
        totalItems = numProducts
        return Product.find()
          .skip((page - 1) * config.itemsPerPage)
          .limit(config.itemsPerPage)
      })
      .then(products => {
        console.log(products);
        res.render('shop/product-list', {
          prods: products,
          pageTitle: 'All Products',
          path: '/products',
          currentPage: page,
          totalProducts: totalItems,
          hasNextPage: config.itemsPerPage * page < totalItems,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / config.itemsPerPage)
        });
      })
      .catch(err => {
        console.log(err);
      });
  },

  getProduct(req, res) {
    const prodId = req.params.productId;
    Product.findById(prodId)
      .then(product => {
        res.render('shop/product-detail', {
          product: product,
          pageTitle: product.title,
          path: '/products'
        });
      })
      .catch(err => console.log(err));
  },

  getIndex(req, res) {
    const page =  +req.query.page || 1;
    let totalItems;
    Product
      .find()
      .countDocuments()
      .then(numProducts => {
        totalItems = numProducts
        return Product.find()
          .skip((page - 1) * config.itemsPerPage)
          .limit(config.itemsPerPage)
      })
      .then(products => {
        res.render('shop/index', {
          prods: products,
          pageTitle: 'Shop',
          path: '/',
          currentPage: page,
          totalProducts: totalItems,
          hasNextPage: config.itemsPerPage * page < totalItems,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / config.itemsPerPage)
        });
      })
      .catch(err => {
        console.log(err);
      });
  },

  getCart(req, res) {
    req.user
      .populate('cart.items.productId')
      .execPopulate()
      .then(user => {
        const products = user.cart.items;
        res.render('shop/cart', {
          path: '/cart',
          pageTitle: 'Your Cart',
          products: products
        });
      })
      .catch(err => console.log(err));
  },

  postCart(req, res) {
    const prodId = req.body.productId;
    Product.findById(prodId)
      .then(product => {
        return req.user.addToCart(product);
      })
      .then(result => {
        console.log(result);
        res.redirect('/cart');
      });
  },

  postCartDeleteProduct(req, res) {
    const prodId = req.body.productId;
    req.user
      .removeFromCart(prodId)
      .then(result => {
        res.redirect('/cart');
      })
      .catch(err => console.log(err));
  },

  postOrder(req, res) {
    req.user
      .populate('cart.items.productId')
      .execPopulate()
      .then(user => {
        const products = user.cart.items.map(i => {
          return { quantity: i.quantity, product: { ...i.productId._doc } };
        });
        const order = new Order({
          user: {
            email: req.user.email,
            userId: req.user
          },
          products: products
        });
        return order.save();
      })
      .then(result => {
        return req.user.clearCart();
      })
      .then(() => {
        res.redirect('/orders');
      })
      .catch(err => console.log(err));
  },

  getOrders(req, res) {
    Order.find({ 'user.userId': req.user._id })
      .then(orders => {
        res.render('shop/orders', {
          path: '/orders',
          pageTitle: 'Your Orders',
          orders: orders,

        });
      })
      .catch(err => console.log(err));
  },

  getInvoice(req, res) {
    const orderId = req.params.orderId;
    Order.findById(orderId)
      .then(order => {
        if (!order) {
          return next(new Error('No order found.'));
        }
        if (order.user.userId.toString() !== req.user._id.toString()) {
          return next(new Error('Unauthorized'));
        }
        const invoiceName = 'invoice-' + orderId + '.pdf';
        const invoicePath = path.join('data', 'invoices', invoiceName);

        const pdfDoc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          'attachement',
          'inline; filename="' + invoiceName + '"'
        );
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);

        pdfDoc.fontSize(26).text('Invoice', {
          underline: true
        });
        pdfDoc.text('-----------------------');
        let totalPrice = 0;
        order.products.forEach(prod => {
          totalPrice += prod.quantity * prod.product.price;
          pdfDoc
            .fontSize(14)
            .text(
              prod.product.title +
              ' - ' +
              prod.quantity +
              ' x ' +
              '$' +
              prod.product.price
            );
        });
        pdfDoc.text('---');
        pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);
        pdfDoc.end();

      })
      .catch(err => next(err));
  }
}



