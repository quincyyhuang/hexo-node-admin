module.exports = function (req, res, next) {
    if (req.path == '/' || (req.method == 'POST' && req.path == '/!login')) {
        next()
    } else {
        if (req.session.loggedIn == true) {
            next()
        } else {
            res.redirect('/')
        }
    }
}