exports.isLoggin = async (req, res, next) => {
    try {
        if (req.session.admin) {
            next();
        } else {
            res.redirect("/admin");
        }
    } catch (error) {
        console.log(error.message);
    }
};
exports.isLogout = async (req, res, next) => {
    try {
        if (req.session.admin) {
            return res.redirect("/admin/adminHome");
        } else {
            next();
        }
    } catch (error) {
        console.log(error.message);
    }
};
