const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Banner = require("../models/bannerModel");
const Coupon = require("../models/couponModel");
const Orders = require("../models/orderModel")

const getAdminLogin = async (req, res) => {
    try {
        res.render("admin/adminLogin");
    } catch (error) {
        console.log(error.message);
    }
};

const postAdminLogin = async (req, res) => {
    if (req.body.adminname === "admin" && req.body.password === "123") {
        req.session.admin = true;
        res.redirect("/admin/adminHome");
    } else {
        res.render("admin/adminLogin", { message: " Invalid User" });
    }
};
const getAdminHome = async (req, res) => {

    try {
        res.render("admin/adminHome");
    } catch (error) {
        console.log(error.message);
    }
};

const postAdminLogout = async (req, res) => {
    try {
        req.session.admin = null;
        res.redirect("/admin");
    } catch (error) {
        console.log(error.message);
    }
};

const getUserList = async (req, res) => {
    const userData = await User.find({ is_admin: 0 });
    res.render("admin/userList", { users: userData, message: req.flash("message") });
};

const getUsers = async (req, res) => {
    try {
        let users = req.body.users.trim();
        let search = await User.find({ name: { $regex: new RegExp("^" + users + ".*", "i") } }).exec();
        search = search.slice(0, 4);
        res.send({ users: search });
    } catch (error) {
        console.log(error.messaage);
    }
};

const getSingleUser = async (req, res) => {
    try {
        const id = req.query.id;
        const userData = await User.findById({ _id: id });
        res.render("admin/singleUser", { userData });
    } catch (error) {
        console.log(error.messaage);
    }
};

const blockUser = async (req, res) => {
    try {
        const id = req.query.id;
        const userData = await User.findById({ _id: id });
        if (userData.isVerified) {
            await User.findByIdAndUpdate({ _id: id }, { $set: { isVerified: 0 } });
        } else {
            await User.findByIdAndUpdate({ _id: id }, { $set: { isVerified: 1 } });
        }
        res.redirect("/admin/userList");
    } catch (error) {
        console.log(error.message);
    }
};

const getCategory = async (req, res) => {
    try {
        var categoryData = await Category.find();
        res.render("admin/category", { categories: categoryData, message: req.flash("message") });
    } catch (error) {
        console.log(error.message);
    }
};

const postCategory = async (req, res) => {
    try {
        const newCat = req.body.tittle;
        if (newCat) {
            const tittle = await Category.findOne({ tittle: { $regex: new RegExp("^" + newCat.toLowerCase(), "i") } });
            if (tittle) {
                req.flash("message", "Category Already Exist");
                res.redirect("/admin/category");
            } else {
                const category = new Category({
                    tittle: req.body.tittle,  
                });   
                var categoryData = await category.save();
                if (categoryData) {
                    res.redirect("/admin/category");
                }
            }
        } else {
            req.flash("message", "Please fill the field");
            res.redirect("/admin/category");
        }
    } catch (error) {
        console.log(error.messaage);
    }
};

const deleteCategory = async (req, res) => {
    try {
        await Category.deleteOne({ _id: req.query.id });
        res.redirect("/admin/category");
    } catch (error) {
        console.log(error.message);
    }
};

const getproducts = async (req, res) => {
    try {
        const page = +req.query.page || 1;
        const ItemsPerPage = 4;
        const total = await Product.find().countDocuments();
        const productData = await Product.find()
            .skip((page - 1) * ItemsPerPage)
            .limit(ItemsPerPage);
        res.render("admin/products", {
            products: productData,
            totalProducts: total,
            needNextPage: ItemsPerPage * page < total,
            needPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            currentPage: page,
            ItemsPerPage: ItemsPerPage,
        });
    } catch (error) {
        console.log(error.message);
    }
};

const getAddProducts = async (req, res) => {
    try {
        const categoryData = await Category.find();
        res.render("admin/addProducts", { categories: categoryData, message: req.flash("message") });
    } catch (error) {
        console.log(error.message);
    }
};

const postAddProducts = async (req, res) => {
    try {
        const a = req.files;
        if (a.length > 0) {
            const product = new Product({
                name: req.body.name,
                price: req.body.price,
                author: req.body.author,
                stock: req.body.stock,
                offer: req.body.offer,
                description: req.body.description,
                category: req.body.category,
                image: a.map((x) => x.filename),
            });
            await product.save();
            req.flash("message", "Registration Success");
            res.redirect("/admin/addProducts");
        } else {
            req.flash("message", "Fill all the fields");
            res.redirect("/admin/addProducts");
        }
    } catch (error) {
        console.log(error.message);
    }
};

const deleteProduct = async (req, res) => {
    try {
        await Product.deleteOne({ _id: req.query.id });
        res.redirect("/admin/products");
    } catch (error) {
        console.log(error.message);
    }
};

const getUpdateProduct = async (req, res) => {
    try {
        let pid = req.query.id;
        const productData = await Product.find({ _id: pid });
        var categoryData = await Category.find();
        res.render("admin/updateProduct", {
            product: productData,
            categories: categoryData,
            messaage: req.flash("messaage"),
        });
    } catch (error) {
        console.log(error.message);
    }
};

const postUpdateProduct = async (req, res) => {
    let pid = req.query.id;
    try {
        if (req.file) {
            await Product.findByIdAndUpdate(
                { _id: pid },
                {
                    $set: {
                        name: req.body.name,
                        price: req.body.price,
                        author: req.body.author,
                        stock: req.body.stock,
                        offer: req.body.offer,
                        bestseller: req.body.bestseller,
                        description: req.body.description,
                        category: req.body.category,
                        image: req.file.filename,
                    },
                }
            );
            req.flash("message", "Updation Success");
            res.redirect("/admin/products");
        } else {
            await Product.findByIdAndUpdate(
                { _id: pid },
                {
                    $set: {
                        name: req.body.name,
                        price: req.body.price,
                        author: req.body.author,
                        stock: req.body.stock,
                        offer: req.body.offer,
                        bestseller: req.body.bestseller,
                        description: req.body.description,
                        category: req.body.category,
                    },
                }
            );
            req.flash("message", "Updation Success");
            res.redirect("/admin/products");
        }
    } catch (error) {
        console.log(error.messaage);
    }
};

const getBanner = async (req, res) => {
    try {
        const bannerImg = await Banner.find();
        res.render("admin/banner", { bannerImg, message: req.flash("message") });
    } catch (error) {
        console.log(error.message);
    }
};

const postBanner = async (req, res) => {
    try {
        const a = req.files;
        if (a.length > 0) {
            const banner = new Banner({
                bannername: req.body.bannername,
                bannerimage: a.map((x) => x.filename),
            });
            await banner.save();
            req.flash("message", "Upload Success");
            res.redirect("/admin/banner");
        } else {
            req.flash("message", "Fill the Field to Upload");
            res.redirect("/admin/banner");
        }
    } catch (error) {
        console.log(error.messaage);
    }
};

const deleteBanner = async (req, res) => {
    try {
        const id = req.query.id;
        await Banner.findOneAndUpdate({ active: 1 }, { $set: { active: 0 } });
        await Banner.findByIdAndUpdate({ _id: id }, { $set: { active: 1 } });
        res.redirect("/admin/banner");
    } catch (error) {
        console.log(error.message);
    }
};

const getCoupon = async (req, res) => {
    try {
        const couponData = await Coupon.find();
        res.render("admin/coupon", { couponData: couponData, message: req.flash("message") });
    } catch (error) {
        console.log(error.messaage);
    }
};

const postCoupon = async (req, res) => {
    try {
        
        const date = req.body.expirydate;
        const coupon = new Coupon({
            name: req.body.name,
            amount: req.body.value,
            code: req.body.code,
            expirydate: changedateformat(date),
            Minimumbill: req.body.minimumbill,
        });
        couponData = await coupon.save();

        if (couponData) {
            req.flash("message", "Coupon Upload Success");
            res.redirect("/admin/coupon");
        } else {
            req.flash("message", "Upload Failed ");
            res.redirect("/admin/coupon");
        }
    } catch (error) {
        console.log(error.messaage);
    }
};

const deactivateCoupen = async (req,res)=>{
    try {
        const cid = req.query.id
        await Coupon.findByIdAndUpdate({_id:cid},{isActive:0})
        res.redirect("/admin/coupon")
    } catch (error) {
        console.log(error.messaage);
    }
}

const getOrders = async(req,res)=>{
    try {
        const orders = await Orders.find()
        res.render("admin/orders",{orders})
    } catch (error) {
        console.log(error.messaage);
    }
}

const updateOrderStatus = async (req,res)=>{
    try {
     const status = req.body.status
     const oid= req.query.id
     const a = await Orders.findByIdAndUpdate({_id:oid},{$set:{status:status}})
     res.redirect("/admin/orders")
    } catch (error) {
        console.log(error.messaage);
    }
}

const getSalesReport = async (req,res) =>{
    try {
        console.log("jhj");
        const xxx = await Orders.aggregate([
            {
                $group: {
                    _id: { $dayOfWeek: { date: "$createdAt" } },
                    amount: { $sum: "$sellingPrice" },
                },
            },
        ]);
        const count = await Orders.find().count()
        const products = await Product.count()
        const users = await User.count()
  
        const a = xxx.map((x) => x._id);
        const amount = xxx.map((x) => x.amount);
        res.render("admin/salesReport",{amount,count,products,users})
    } catch (error) {
        console.log(error.messaage);
    }
}

function changedateformat(val) {
    const myArray = val.split("-");

    const year = myArray[0];
    const month = myArray[1];
    const day = myArray[2];

    const formatteddate = day + "/" + month + "/" + year;
    return formatteddate;
}

module.exports = {
    getAdminLogin,
    postAdminLogin,
    getAdminHome,
    postAdminLogout,
    getUserList,
    getUsers,
    getSingleUser,
    blockUser,
    getCategory,
    postCategory,
    deleteCategory,
    getproducts,
    getAddProducts,
    postAddProducts,
    deleteProduct,
    getUpdateProduct,
    postUpdateProduct,
    getBanner,
    postBanner,
    deleteBanner,
    getCoupon,
    postCoupon,
    deactivateCoupen,
    getOrders,
    updateOrderStatus,
    getSalesReport
};
