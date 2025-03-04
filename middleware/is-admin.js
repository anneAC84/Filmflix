function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.isAdmin) {
        return next(); // User is admin, proceed
    }
    res.status(403).send("Access denied: Admins only");
}
module.exports = isAdmin;
