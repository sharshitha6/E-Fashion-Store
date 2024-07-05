const {body} = require('express-validator');
const{validationResult} = require('express-validator');

exports.validateId = (req, res, next) => {
    let id = req.params.id;
    //an objectId is a 24-bit Hex string
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        return next();
    } else {
        let err = new Error('Invalid item id');
        err.status = 400;
        return next(err);
    }
}

exports.validateSignUp = [body('firstname','First name cannot be empty').notEmpty().trim().escape(), 
body('lastname','Last name cannot be empty').notEmpty().trim().escape(),
body('email','Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({min:8, max:64})];

exports.validateLogIn = [body('email','Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({min:8, max:64})];

exports.validateItem = [
    body('title','Title cannot be empty').notEmpty().trim().escape(),
    body('category','Category cannot be empty').notEmpty().trim().escape(),
    body('price','Price cannot be empty').notEmpty().trim().escape(),
    body("size", "Size cannot be empty").notEmpty().trim().escape(),
    body('details','Details cannot be empty').trim().escape().isLength({min:10})
]

exports.validateResult = (req, res, next) =>{
    let errors = validationResult(req);
    if (!errors.isEmpty()){
        errors.array().forEach(error=>{
            req.flash ('error', error.msg);
        });
        return res.redirect('back');
    } else {
        return next();
    }
}