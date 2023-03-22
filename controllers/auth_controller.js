const loginRequired = (req, res, next) => {
    if(req.user){
        next();
    }
    else {
        res.status(401).json({
            msg: "Unauthourized user"
        })
    }
    
};
module.exports = {
    loginRequired
};