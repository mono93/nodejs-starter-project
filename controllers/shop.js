const Product = require('../models/product');
const Order = require('../models/order');

module.exports = {
  getProducts(req, res) {
    Product.find()
      .then(products => {
        console.log(products);
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
    Product.find()
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
  }

}



