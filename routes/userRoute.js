const express = require("express");
const user = express();
const { check } = require("express-validator");
const userAuth = require("../auth/userAuth");
const userController = require("../controllers/userController");

//Routing----------------------

user.get("/", userController.getHome);
user.get("/userLogout", userController.userLogout);

user.get("/register", userAuth.isLogout, userController.getRegister);
user.post(
    "/register",
    check("name").notEmpty().withMessage("Please enter a Name"),
    check("email").notEmpty().withMessage("Invalid Email"),
    check("email")
        .matches(/^\w+([\._]?\w+)?@\w+(\.\w{2,3})(\.\w{2})?$/)
        .withMessage("Enter a valid email id"),
    check("password")
        .matches(/[\w\d!@#$%^&*?]{8,}/)
        .withMessage("Password must contain at least eight characters"),
    check("password").matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter"),
    check("password").matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter"),
    check("password").matches(/\d/).withMessage("Password must contain at least one number"),
    check("password")
        .matches(/[!@#$%^&*?]/)
        .withMessage("Password must contain at least one special character"),
    userController.postRegister
);
user.get('/verifyOtp', userController.loadOtp)
user.post('/verifyOtp', userController.verifyOtp) 

user.get("/login", userAuth.isLogout, userController.getLogin);
user.post("/login", userController.postLogin);

user.get("/shop", userController.getShop);
user.post("/getProducts", userController.getProducts);
user.get("/categoryProduct", userController.getCategoryProduct);
user.get("/singleProduct", userController.getSingleProduct);

user.get("/cart", userAuth.isLoggin, userController.getCart);
user.get("/addToCart", userController.addToCart);
user.post("/addToCartFrom",userController.addToCartFrom)
user.get("/deleteCart", userController.deleteCart);
user.post("/changeProductQnty",userController.changeProductQnty)

user.get("/wishlist",userController.getWishList);
user.get("/addToWishlist",userController.addToWishlist)
user.get("/deletewishlist",userController.deleteWishlist)

user.get("/checkout",userAuth.isLoggin,userController.getCheckout); 
user.post("/coupenApply",userController.coupenApply)
user.post('/placeOrder', userController.createOrder)
user.get("/orderSuccess",userController.orderSuccess)
user.get('/razorpay',userAuth.isLoggin,userController.loadRazorpay)
user.post('/razorpay',userAuth.isLoggin,userController.razorpayCheckout)

user.post("/saveUserDetails",userController.saveUserDetails)
user.get("/userProfile", userAuth.isLoggin, userController.getUserProfile);
user.get("/userOrders", userAuth.isLoggin, userController.getUserOrders)
user.get("/singleOrderView",userAuth.isLoggin,userController.getSingleOrderView)
user.get("/exportInvoice",userController.exportInvoice)
user.get("/cancelOrder",userController.cancelOrder)


module.exports = user;
