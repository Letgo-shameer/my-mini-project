exports.isLoggin = async (req, res, next) => {
    try {
        if (req.session.user) {
            next();
        } else {
            res.redirect("/");
        }
    } catch (error) {
        console.log(error.message);
    }
};
exports.isLogout = async (req, res, next) => {
    try {
        if (req.session.user) {
            return res.redirect("/");
        } else {
            next();
        }
    } catch (error) {
        console.log(error.message);
    }
};
