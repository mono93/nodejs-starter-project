const Product = require('../models/product');

module.exports = {
  getProducts(req, res) {
    Product.fetchAll()
      .then(products => {
        res.render('shop/product-list', {
          prods: products,
          pageTitle: 'All Products',
          path: '/products'
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
    Product.fetchAll()
      .then(products => {
        res.render('shop/index', {
          prods: products,
          pageTitle: 'Shop',
          path: '/'
        });
      })
      .catch(err => {
        console.log(err);
      });
  },

  getCart(req, res) {
    req.user
      .getCart()
      .then(products => {
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
        console.log(product)
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
      .deleteItemFromCart(prodId)
      .then(result => {
        res.redirect('/cart');
      })
      .catch(err => console.log(err));
  },

  postOrder(req, res) {
    let fetchedCart;
    req.user
      .addOrder()
      .then(result => {
        res.redirect('/orders');
      })
      .catch(err => console.log(err));
  },

  getOrders(req, res) {
    req.user
      .getOrders()
      .then(orders => {
        res.render('shop/orders', {
          path: '/orders',
          pageTitle: 'Your Orders',
          orders: orders
        });
      })
      .catch(err => console.log(err));
  }

}



