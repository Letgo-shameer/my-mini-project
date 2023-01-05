const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Product = require("../models/productModel");
const Banner = require("../models/bannerModel");
const Category = require("../models/categoryModel");
const Orders = require("../models/orderModel");
const Coupon = require("../models/couponModel");
const { ObjectId } = require("mongodb");
const fast2sms = require("fast-two-sms");
const Razorpay = require("razorpay");
const { validationResult } = require("express-validator");

// HTML to PDF requirements-------------
const ejs = require("ejs");
const pdf = require("html-pdf");
const fs = require("fs");
const path = require("path");

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
};

let newUser;
let newOtp;

const sendMessage = function (mobile, res) {
  let randomOTP = Math.floor(Math.random() * 10000);
  var options = {
    authorization:
      "MSOj0bTnaP8phCARmWqtzkgEV4ZN2Ff9eUxXI7iJQ5HcDBKsL1vYiamnRcMxrsjDJboyFEXl0Sk37pZq",
    message: `your OTP verification code is ${randomOTP}`,
    numbers: [mobile],
  };
  //send this message
  fast2sms
    .sendMessage(options)
    .then((response) => {
      console.log("otp sent successfully");
    })
    .catch((error) => {
      console.log(error);
    });
  return randomOTP;
};

const loadOtp = async (req, res) => {
    try {
      const userData = await User.findById({ _id: newUser });
      const otp = sendMessage(userData.mobile, res);
      newOtp = otp;
      console.log("otp:", otp);
      res.render("user/otpVerify", { otp: otp, user: newUser,userData });
    } catch (error) {
      console.log(error.message);
    }
  };
  const verifyOtp = async (req, res) => {
    try {
      const otp = newOtp;
      const userData = await User.findById({ _id: req.body.user });
      if (otp == req.body.otp) {
        userData.isVerified = 1;
        const user = await userData.save();
        if (user) {
          res.redirect("/login");
        }
      } else {
        res.render("otpVerify", { message: "Invalid OTP" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

// Register--------------------

const getRegister = async (req, res) => {
    try {
        const userData = [];
        const categoryData = await Category.find();
        res.render("user/register", { categoryData, userData });
    } catch (error) {
        console.log(error.message);
    }
};

const postRegister = async (req, res) => {
    const errors = validationResult(req);
    var error1 = errors.errors.find((item) => item.param === "name") || "";
    var error2 = errors.errors.find((item) => item.param === "email") || "";
    var error3 = errors.errors.find((item) => item.param === "password") || "";
    if (req.body.password === req.body.password2) {
        if (!errors.isEmpty()) {
            const userData = [];
            res.render("user/register", { nameMsg: error1.msg, usernameMsg: error2.msg, pwdMsg: error3.msg, userData });
        } else {
            try {
                const email = req.body.email;
                const Udata = await User.findOne({ email: email });
                if (Udata) {
                    const userData = [];
                    res.render("user/register", { emessage: "User Already Exist", userData });
                }
                const spassword = await securePassword(req.body.password);
                const user = new User({
                    name: req.body.name,
                    email: req.body.email,
                    mobile: req.body.mobile,
                    password: spassword,
                    is_admin: 0,
                });
                const userData = await user.save();
                newUser = userData._id
                if (userData) {
                    res.redirect("/verifyOtp");
                } else {
                    const userData = [];
                    res.render("user/register", {
                        nameMsg: error1.msg,
                        usernameMsg: error2.msg,
                        pwdMsg: error3.msg,
                        userData,
                    });
                }
            } catch (error) {
                console.log(error.message);
            }
        }
    } else {
        const userData = [];
        res.render("user/register", { message: "Password Must Be Same", userData });
    }
};

//user login ----------------

const getLogin = async (req, res) => {
    try {
        const userData = [];
        const categoryData = await Category.find();
        res.render("user/login", { categoryData, userData });
    } catch (error) {
        console.log(error.message);
    }
};

const postLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.isVerified === 1) {
                    req.session.user = userData._id;
                    return res.redirect("/");
                } else {
                    const userData = [];
                    res.render("user/login", { message: "You Are Blocked", userData });
                }
            } else {
                const userData = [];
                res.render("user/login", { message: "Password Incorrect", userData });
            }
        } else {
            const userData = [];
            res.render("user/login", { message: "Email Incorrect", userData });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const getHome = async (req, res) => {
    try {
        const productData = await Product.find().limit(6);
        const categoryData = await Category.find();
        const banner = await Banner.find({ active: 1 });
        if (req.session.user) {
            const userId = req.session.user;
            const userData = await User.find({ _id: userId });
            res.render("user/home", { products: productData, banner, categoryData, userData });
        } else {
            const userData = [];
            res.render("user/home", { products: productData, banner, categoryData, userData });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const userLogout = async (req, res) => {
    try {
        req.session.user = null;
        res.redirect("/");
    } catch (error) {
        console.log(error.message);
    }
};

const getShop = async (req, res) => {
    try {
        const userId = req.session.user;
        const userData = await User.find({ _id: userId });
        const categoryData = await Category.find();
        const productData = await Product.find();
        res.render("user/shop", { products: productData, categoryData, userData });
    } catch (error) {
        console.log(error.message);
    }
};

const getProducts = async (req, res) => {
    try {
        let products = req.body.products.trim();
        let search = await Product.find({ name: { $regex: new RegExp("^" + products + ".*", "i") } }).exec();
        search = search.slice(0, 4);
        res.send({ products: search });
    } catch (error) {
        console.log(error.message);
    }
};

const getCategoryProduct = async (req, res) => {
    try {
        const userId = req.session.user;
        const userData = await User.find({ _id: userId });
        const category = req.query.category;
        const categoryData = await Category.find();
        const products = await Product.find({ category: category });
        res.render("user/categoryProduct", { categoryData, products, category, userData });
    } catch (error) {
        console.log(error.message);
    }
};

const getSingleProduct = async (req, res) => {
    try {
        const userId = req.session.user;
        const userData = await User.find({ _id: userId });
        const id = req.query.id;
        const singleProduct = await Product.findById({ _id: id });
        const categoryData = await Category.find();
        res.render("user/singleProduct", { product: singleProduct, categoryData, userData, message: req.flash("message") });
    } catch (error) {
        console.log(error.message);
    }
};

// Wishlist----------------------------------------------------

const getWishList = async (req, res) => {
    try {
        const userData = await User.find({ _id: req.session.user });
        const categoryData = await Category.find();
        const populatedData = await userData[0].populate("wishlist.item.productId");
        res.render("user/wishlist", { userData, categoryData, a: populatedData.wishlist });
    } catch (error) {
        console.log(error.message);
    }
};

const addToWishlist = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.user });
        const add = await userData.addToWishlist(req.query.id);
        if (add) {
            userData.removefromCart(req.query.id);
            res.redirect("/wishlist");
        }
    } catch (error) {
        console.log(error.message);
    }
};

const deleteWishlist = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.user });
        userData.removeFromWishlist(req.query.id);
        setTimeout(() => {
            res.redirect("/wishlist");
        }, 1000);
    } catch (error) {
        console.log(error.message);
    }
};

// Wishlist End----------------------------------------------------------
// Cart------------------------------------------------------------------

const getCart = async (req, res) => {
    try {
        const userId = req.session.user;
        const userData = await User.find({ _id: userId });
        const categoryData = await Category.find();
        res.render("user/cart", { categoryData, userData });
    } catch (error) {
        console.log(error.message);
    }
};

const addToCart = async (req, res) => {
    try {
        const productId = req.query.id;
        const userId = req.session.user;
        const userData = await User.findById({ _id: userId });
        const productData = await Product.findById({ _id: productId });
        userData.addToCart(productData);
        setTimeout(() => {
            req.flash("message", "Add To Cart Successfully");
            res.redirect("/singleProduct?id=" + productId);
        }, 1000);
    } catch (error) {
        console.log(error.message);
    }
};

const addToCartFrom = async (req, res) => {
    const productId = req.query.id;
    const quantity = { a: parseInt(req.body.qty) };

    userSession = req.session;
    const userData = await User.findById({ _id: userSession.user });
    const productData = await Product.findById({ _id: productId });
    const add = await userData.addToCart(productData, quantity);
    const cartLength = userData.cart.item.length;
    if (add) {
        userData.removeFromWishlist(productId);
        res.json({ cartLength });
    }
};

const changeProductQnty = async (req, res) => {
    try {
        const id = req.query.id;

        const userData = await User.findById({ _id: req.session.user });

        const foundProduct = userData.cart.item.findIndex((x) => x.productId == id);

        const qty = { a: parseInt(req.body.qty) };
        userData.cart.item[foundProduct].qty = qty.a;
        const price = userData.cart.item[foundProduct].price;
        userData.cart.totalPrice = 0;

        const totalPrice = userData.cart.item.reduce((acc, curr) => {
            return acc + curr.price * curr.qty;
        }, 0);
        userData.cart.totalPrice = totalPrice;
        await userData.save();

        res.json({ totalPrice, price });
    } catch (error) {
        console.log(error.message);
    }
};

const deleteCart = async (req, res) => {
    try {
        const productId = req.query.id;
        userSession = req.session;
        const userData = await User.findById({ _id: userSession.user });
        userData.removefromCart(productId);
        setTimeout(() => {
            res.redirect("/cart");
        }, 1000);
    } catch (error) {
        console.log(error.message);
    }
};

// Cart End------------------------------------------------------------------------------

const getCheckout = async (req, res) => {
    try {
        const userId = req.session.user;
        const userData = await User.find({ _id: userId });
        res.render("user/checkout", { userData, message: req.flash("message") });
    } catch (error) {
        console.log(error.message);
    }
};
var sellingPrice = 0;
const coupenApply = async (req, res) => {
    try {
        const userId = req.session.user;
        const userData = await User.findById({ _id: userId });
        const coupen = req.query.coupen;
        const couponData = await Coupon.findOne({ code: coupen });
        if (couponData) {
            if (couponData.isActive) {
                var minAmt = couponData.Minimumbill;
                var cartTotal = userData.cart.totalPrice;
                if (cartTotal > minAmt) {
                    const coupenAmount = couponData.amount;
                    sellingPrice = userData.cart.totalPrice - coupenAmount;
                    res.json({ coupenAmount, cartTotal });
                }else{
                    let b=1
                    res.json({ b,cartTotal,minAmt });
                }
                const coupenAmount = couponData.amount;
                sellingPrice = userData.cart.totalPrice - coupenAmount;
                res.json({ coupenAmount, cartTotal });
            } else {
                let a = 1;
                res.json({ a });
            }
        } else {
            console.log("dfg");
            res.json({ message: "Invalid Coupen" });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const createOrder = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.user });
        // await Coupons.updateOne({ value: req.body.value }, { $push: { coustomer: req.session.userid } });

        const populatedData = await userData.populate("cart.item.productId");

        let order;
        if (req.body.currentAddress) {
            const { _id, country, address, city, state, zip, phonenumber, email } = userData;
            order = new Orders({
                userId: _id,
                name: userData.name,
                country,
                address,
                city,
                state,
                zip,
                phone: phonenumber,
                email,
                sellingPrice: sellingPrice,
                products: populatedData.cart,
                payment: req.body.payment,
                sellingPrice: sellingPrice,
            });
        } else if (req.body.address) {
            const { name, country, address, city, state, zip, phone, email, payment } = req.body;
            order = new Orders({
                userId: req.session.user,
                name,
                country,
                address,
                city,
                state,
                zip,
                phone,
                email,
                sellingPrice: sellingPrice,
                products: populatedData.cart,
                payment,
                sellingPrice: sellingPrice,
            });
        } else {
            req.flash("message", "Please Fill The Form");
            return res.redirect("/checkout");
        }
        if (!req.body.payment) {
            req.flash("message", "Please select one of the payment modes");
            return res.redirect("/checkout");
        }
        const orderData = await order.save();

        if (orderData) {
            await User.updateOne({ _id: req.session.user }, { cart: {} });
            afterPrice = 0;
            isApplied = 0;
            console.log(req.body.payment);
            if (req.body.payment == "Cash on delivery") {
                res.redirect("/orderSuccess");
            } else if (req.body.payment == "Razorpay") {
                res.redirect("/razorpay");
            } else if (req.body.payment == "Paypal") {
                res.redirect("/");
            } else {
                res.redirect("/checkout");
            }
        } else {
            res.redirect("/checkout");
        }
    } catch (error) {
        console.log(error.message);
    }
};

// Payment Gateway----------------------

const loadRazorpay = async (req, res) => {
    try {
        const userId = req.session.user;
        const userData = await User.find({ _id: userId });
        const categoryData = await Category.find();
        res.render("user/razorpay", { userData, categoryData });
    } catch (error) {
        console.log(error.message);
    }
};

const razorpayCheckout = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.user });
        const completeUser = await userData.populate("cart.item.productId");
        let instance = new Razorpay({ key_id: "rzp_test_6ECQ3wFYlifQi2", key_secret: "akkbAG21AjGFcIfvmYditBnf" });

        let order = await instance.orders.create({
            amount: 300,
            currency: "INR",
            receipt: "receipt#1",
        });
        res.status(201).json({
            success: true,
            order,
        });
    } catch (error) {
        console.log(error.message);
    }
};

const orderSuccess = async (req, res) => {
    try {
        const userId = req.session.user;
        const userData = await User.find({ _id: userId });
        const categoryData = await Category.find();
        res.render("user/orderSuccess", { userData, categoryData });
    } catch (error) {
        console.log(error.message);
    }
};

const saveUserDetails = async (req, res) => {
    try {
        const { name, mobile, address, city, state, zip } = req.body;

        await User.findByIdAndUpdate({ _id: req.session.user }, { $set: { name, mobile, address, city, state, zip } });

        res.redirect("/userProfile");
    } catch (error) {
        console.log(error.message);
    }
};

const getUserProfile = async (req, res) => {
    try {
        const userId = req.session.user;
        const userData = await User.find({ _id: userId });
        const categoryData = await Category.find();
        res.render("user/userProfile", { userData, categoryData });
    } catch (error) {
        console.log(error.message);
    }
};

const getUserOrders = async (req, res) => {
    try {
        const userId = req.session.user;
        const userData = await User.find({ _id: userId });
        const categoryData = await Category.find();
        const orders = await Orders.find({ userId: userId });
        res.render("user/userOrders", { userData, categoryData, orders });
    } catch (error) {
        console.log(error.message);
    }
};

const getSingleOrderView = async (req, res) => {
    try {
        const orderid = req.query.id;
        const userId = req.session.user;
        const userData = await User.find({ _id: userId });
        const categoryData = await Category.find();
        var order = await Orders.findOne({ _id: ObjectId(orderid) });
        const pop = await order.populate("products.item.productId");
        res.render("user/singleOrderView", { userData, categoryData, order, pop });
    } catch (error) {
        console.log(error.message);
    }
};

// HTML to PDF --------
const exportInvoice = async (req, res) => {
    try {
        const orderid = req.query.id;
        var order = await Orders.findOne({ _id: ObjectId(orderid) });
        const data = { order: order };
        const filePathName = path.resolve(__dirname, "../views/user/htmltopdf.ejs");
        const htmlString = fs.readFileSync(filePathName).toString();

        let options = { Format: "Letter" };

        const ejsData = ejs.render(htmlString, data);
        pdf.create(ejsData, options).toFile("invoice.pdf", (err, response) => {
            if (err) console.log(err);

            const filePath = path.resolve(__dirname, "../invoice.pdf");

            fs.readFile(filePath, (err, file) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send("Could not download File");
                }
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", 'attachment;filename="Invoice.pdf"');
                res.send(file);
            });
        });
    } catch (error) {
        console.log(error);
    }
};

const cancelOrder = async (req, res) => {
    try {
        const Id = req.query.id;
        await Orders.findOneAndUpdate({ _id: Id }, { $set: { status: "Canceled" } });
        await Orders.findOneAndUpdate({ _id: Id }, { $set: { isorder: 0 } });
        res.redirect("/userOrders");
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    getHome,
    userLogout,
    getLogin,
    postLogin,
    getRegister,
    postRegister,
    loadOtp,
    verifyOtp,
    getShop,
    getProducts,
    getCategoryProduct,
    getWishList,
    addToWishlist,
    deleteWishlist,
    getCart,
    addToCart,
    changeProductQnty,
    addToCartFrom,
    deleteCart,
    getSingleProduct,
    getCheckout,
    coupenApply,
    createOrder,
    orderSuccess,
    loadRazorpay,
    razorpayCheckout,
    saveUserDetails,
    getUserProfile,
    getUserOrders,
    getSingleOrderView,
    exportInvoice,
    cancelOrder,
};
