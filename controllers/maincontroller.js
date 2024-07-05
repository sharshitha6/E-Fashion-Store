const model = require('../models/user');
const item = require('../models/item');
const offer = require('../models/offer');
const watch = require('../models/watch');

exports.about = (req,res)=>{
    res.render('about');
};

exports.contact = (req,res)=>{
    res.render('contact');
};

exports.signup = (req, res)=>{
    res.render('./user/signup');
};

exports.create = (req, res, next)=>{
    //res.send('Created a new user');
    let user = new model(req.body);//create a new user document
    user.save()//insert the document to the database
    .then(user=>{req.flash('success', 'sign in Successful'); res.redirect('/users/login')})
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('/users/signup');
        }
        if(err.code === 11000) {
            req.flash('error', 'Email has been used');  
            return res.redirect('/users/signup');
        }    
        next(err);
    }); 
};

exports.getUserLogin = (req, res, next) => {
    console.log("Inside Login")
    res.render('./user/login');
}

exports.login = (req, res, next)=>{
    let email = req.body.email;
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            console.log('wrong email address');
            req.flash('error', 'wrong email address');  
            res.redirect('/users/login');
            } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/users/profile');
            } else {
                req.flash('error', 'wrong password');      
                res.redirect('/users/login');
            }
            });     
        }     
    })
    .catch(err => next(err));
};

exports.profile = (req, res, next)=>{
    let id = req.session.user;
    Promise.all([model.findById(id), item.find({author: id}), watch.find({watchedby:id}), item.find({watched:true}), item.find({offered:true}), offer.find({offeredby:id})]) 
    .then(results=>{
        const [user, items, watchs, items_watch, items_offer, offers] = results;   
        console.log("items",items_offer);     
        res.render('./user/profile', {user, items, watchs, items_watch, items_offer, offers})
    })
    .catch(err=>next(err));
};

exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
   
 };