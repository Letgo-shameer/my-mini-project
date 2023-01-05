const express = require("express");
const admin = express();
const path = require("path");
const multer = require("multer");
const adminAuth = require("../auth/adminAuth");
const adminController = require("../controllers/adminController");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname !== "image") {
            cb(null, path.join(__dirname, "../public/bannerImages"));
        } else {
            cb(null, path.join(__dirname, "../public/productImages"));
        }
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage });

//Routing----------------------

admin.get("/", adminAuth.isLogout, adminController.getAdminLogin);
admin.post("/", adminController.postAdminLogin);

admin.get("/adminHome", adminAuth.isLoggin, adminController.getAdminHome);
admin.post("/adminHome", adminController.postAdminLogout);

admin.get("/userList", adminAuth.isLoggin, adminController.getUserList);
admin.post("/getUsers", adminController.getUsers);
admin.get("/singleUser", adminController.getSingleUser);
admin.get("/blockUser", adminController.blockUser);

admin.get("/category", adminAuth.isLoggin, adminController.getCategory);
admin.post("/category", adminController.postCategory);
admin.get("/delete-category", adminController.deleteCategory);

admin.get("/products", adminAuth.isLoggin, adminController.getproducts);
admin.get("/addProducts", adminAuth.isLoggin, adminController.getAddProducts);
admin.post("/addProducts", upload.array("image", 2), adminController.postAddProducts);
admin.get("/deleteProduct", adminController.deleteProduct);
admin.get("/updateProduct", adminAuth.isLoggin, adminController.getUpdateProduct);
admin.post("/updateProduct", upload.single("image"), adminController.postUpdateProduct);

admin.get("/banner", adminAuth.isLoggin, adminController.getBanner);
admin.post("/banner", upload.array("bannerimage", 2), adminController.postBanner);
admin.get("/deleteBanner", adminController.deleteBanner);

admin.get("/coupon", adminAuth.isLoggin, adminController.getCoupon);
admin.post("/coupon", adminController.postCoupon); 
admin.get("/deactivateCoupen",adminController.deactivateCoupen)

admin.get("/orders",adminAuth.isLoggin, adminController.getOrders)
admin.post("/orders",adminController.updateOrderStatus)

admin.get("/salesReport",adminController.getSalesReport)

module.exports = admin;
