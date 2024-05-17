function auth(req, res, next) {
    console.log('Authenticating...');
    let authHeader = req.headers;
    console.log({authHeader});
    next();
}

module.exports = auth;