const model = require('../models/item');
const offer = require('../models/offer');
const watch = require('../models/watch');

exports.index = (req, res, next) => {
    model.find().sort({"category":1})
    .then(items=>res.render('./item/trades', { items }))
    .catch(err=>next(err));
};

exports.new = (req, res) => {
    res.render('./item/newTrade');
};

exports.create = (req, res, next) => {
    let item = new model(req.body); // create a new item document
    item.author = req.session.user;
    item.watched = false;
    item.status = "Available";
    item.offertitle = "";
    item.offered = false;
    item.save() // insert the document to the database
    .then(item=>{req.flash('success', 'Item successfully created'); res.redirect('/items')})
    .catch(err=>{
        if(err.name === 'ValidationError'){
            res.redirect('back')
            err.status = 400;
        }
        next(err);
    });
};

exports.show = (req, res, next) => {
    let id = req.params.id;
    model.findById(id).populate('author', 'firstname lastname')
    .then(item=>{
    if (item) {
        res.render('./item/trade', { item });
    } else {
        let err = new Error('Cannot find item with id ' + id);
        err.status = 404;
        next(err);
    }
   })
    .catch(err=>next(err));
};

exports.edit = (req, res, next) => {
    let id = req.params.id;
    model.findById(id)
    .then(item=>{
    if (item) {
        res.render('./item/editItem', { item });
    } else {
        let err = new Error('Cannot find item with id ' + id);
        err.status = 404;
        next(err);
    }
    })
    .catch(err=>next(err));
};

exports.update = (req, res, next) => {
    let id = req.params.id;
    let item = req.body;
    model.findByIdAndUpdate(id, item, {useFindAndModify: false, runValidators: true})
    .then(item=>{
    if (item) {
        req.flash('success', 'Item successfully updated');
        res.redirect('/items/'+id);
    } else {
        let err = new Error('Cannot find item with id ' + id);
        err.status = 404;
        next(err);
    }
    })
    .catch(err=>{
        if(err.name === 'ValidationError'){
            res.redirect('back')
            err.status = 400;
        }
        next(err);
    });
};

exports.delete = (req, res, next) => {
    let id = req.params.id;
    model.findById(id)
    .then((item)=>{
      let title = item.title;
      let offertitle = item.offertitle;
      console.log("DELETE Title", title, offertitle)
      Promise.all([offer.findOneAndDelete({ $or: [{title:title},{title:offertitle}]}, {useFindAndModify: false}), 
      model.findByIdAndDelete(id, {useFindAndModify: false}),
      model.findOneAndUpdate({ $or: [{title:title}, {offertitle : title}, {title: offertitle}]}, {status:"Available", offertitle:"", offered:false}, {useFindAndModify: false})])
    .then(item=>{
    if (item) {
        req.flash("success", "TradeItem deleted Successfully");
        res.redirect('/items');
    } else {
        let err = new Error('Cannot find item with id ' + id);
        err.status = 404;
        next(err);
    }
    })
    .catch(err=>next(err));
  })
    .catch(err=>next(err));
};

exports.watch = (req, res, next) => {
    let id = req.params.id;
    let user = req.session.user;
    model.findByIdAndUpdate(id, {watched: true}, {useFindAndModify: false, runValidators: true})
      .then((item) => {
        console.log("ITEMMMM",item);
        let watcheditem = new watch({
          title: item.title,
          category: item.category,
          price: item.price,
          status: item.status,
          watchedby: user
        });
        console.log("WATCCHED ITEM",watcheditem)
        watcheditem.save()
        .then((watcheditem) => {
            req.flash("success", "TradeItem has been added to the Watch list");
            res.redirect("/users/profile");
          })
          .catch((err) => {
            if (err.name === "ValidationError") {
              res.redirect('back')
              err.status = 400;
            }
            next(err);
          });
      })
      .catch(err=>next(err));
  };

  exports.unwatch = (req, res, next) => {
    let id = req.params.id;
    console.log("Inside Unwatch", id)
    model.findByIdAndUpdate(id, {watched: false}, {useFindAndModify: false, runValidators: true})
      .then(item=>{
      console.log("inside title", item.title)
      watch.findOneAndDelete({title: item.title}, { useFindAndModify: false })
      .then((watch) => {
          req.flash("success", "TradeItem unwatched");
          res.redirect("/users/profile");
        }).catch(err=>next(err));
    }).catch(err=>next(err));
  };


  exports.trade= (req, res, next)=>{
    let id = req.params.id;
    let user = req.session.user;
    model.findById(id)
    .then(item=>{  
      let offeredItem = new offer({
        title: item.title,
        status: "Offer Pending",
        price: item.price,
        category: item.category,
        offeredby: user
      });
      Promise.all([offeredItem.save(), model.findByIdAndUpdate(id, {status: "Offer Pending", "offered": true}, {useFindAndModify: false, runValidators: true})]) 
      .then(results=>{
       const  [offer, item] = results;
       model.find({author : user})
       .then(items=>{
         res.render('./item/offer', {items});
       })
       .catch(err=>next(err))
      })
      .catch(err=>next(err))
    })
   .catch(err=>next(err))
   };

   exports.tradeOffer = (req,res,next)=>{
    let id = req.params.id;
    let user = req.session.user;
    Promise.all([model.findByIdAndUpdate(id, {status: "Offer Pending"}, {useFindAndModify: false, runValidators: true}), offer.findOne({offeredby:user}).sort({'_id':-1}) ]) 
   .then(results=>{
      const [item, offered] = results;
      console.log("OFFERED", offered)
      let title = offered.title;
      model.findByIdAndUpdate(id,{offertitle:title}, {useFindAndModify: false, runValidators: true})
      .then(item=>{
        req.flash("success", "TradeItem is offered successfully")
        res.redirect('/users/profile')
      })
      .catch(err=>next(err))    
      })
  .catch(err=> next(err))
  };

  exports.manageOffer = (req,res,next)=>{
    let id = req.params.id;
    let user = req.session.user;
    model.findById(id)
    .then(item=>{
      if(item.offertitle === ""){
        console.log("Inside manage no offertitle")
        let title = item.title;
        model.findOne({offertitle:title})
        .then(item=>{
          res.render('./item/manage', {item});
        })
        .catch(err=>next(err))   
      }
      else{
        console.log("Inside Manage offer")
        console.log("ITEM",item.offertitle, item.title);
        let title = item.offertitle ? item.offertitle : item.title;
        console.log('TITLE', title)
        offer.findOne({title:title})
        .then(offer=>{
          console.log("manage", item, offer)
          res.render('./item/manageoffer', {item, offer});
        })
        .catch(err=>next(err))
        }
    })
    .catch(err=>next(err))
  };

  exports.acceptOffer=(req,res,next)=>{
    let id = req.params.id;
    model.findByIdAndUpdate(id, {status: "Traded"}, {useFindAndModify: false, runValidators: true})
    .then(item=>{
      let title = item.offertitle;
      console.log("TITLE ACCEPT", title)
      Promise.all([model.findOneAndUpdate({title:title},{status:"Traded"},{useFindAndModify: false}), offer.findOneAndDelete({title:title}, {useFindAndModify: false})]) 
      .then(offer=>{
        req.flash("success", "Offer has been accepted successfully")
        res.redirect('/users/profile');
      })
      .catch(err=>next(err))
    })
    .catch(err=>next(err))
  };

  exports.rejectOffer=(req,res,next)=>{
    let id = req.params.id;
    model.findByIdAndUpdate(id, {status: "Available", offertitle: ""}, {useFindAndModify: false, runValidators: true})
    .then(item=>{
      let title = item.offertitle;
      console.log("REJECT", title)
      Promise.all([model.findOneAndUpdate({title:title},{status:"Available", offered: false}, {useFindAndModify: false}), 
      offer.findOneAndDelete({title:title}, {useFindAndModify: false})])
      .then(offer=>{
        req.flash("success", "Offer has been rejected")
        res.redirect('/users/profile');
      })
      .catch(err=>next(err))
    })
    .catch(err=>next(err))
  };

  exports.canceloffer = (req, res, next) => {
    let id = req.params.id;
    console.log("params offer", id)
    offer.findById(id)
    .then(canoffer=>{
        let title = canoffer.title;
        console.log("title", title)
    // console.log("name is "+ title);
     Promise.all([model.findOneAndUpdate({offertitle:title}, {status: "Available", offertitle:''}, {useFindAndModify: false}),
     model.findOneAndUpdate({title:title},{status: "Available", "offered": false}, {useFindAndModify: false}),
     offer.findByIdAndDelete(id, {useFindAndModify: false})]) 
      .then(results=>{
        const [p1, p2, p3]= results;
        req.flash("success", "Offer has been cancelled");
        res.redirect('/users/profile');
      })
      .catch(err=>next(err))
    })
    .catch(err=>next(err))
  };