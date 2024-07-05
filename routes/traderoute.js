const express = require('express');
const router = express.Router();
const controller = require('../controllers/tradecontroller');
const { isLoggedIn, isAuthor } = require('../middlewares/auth');
const { validateId, validateItem, validateResult } = require('../middlewares/validator');

//GET /items: send all items to the user
router.get('/', controller.index);

//GET /items/new: send html form for creating a new item
router.get('/new', isLoggedIn, controller.new);

//POST /fashions: create a new fashion
router.post('/', isLoggedIn, validateItem, validateResult, controller.create);

//GET /fashions/:id: send details of fashion identified by id
router.get('/:id', validateId, controller.show);

//GET /fashions/:id/edit: send html form for editing an existing fashion
router.get('/:id/editItem', validateId, isLoggedIn, isAuthor, controller.edit);

//PUT /fashions/:id: update the fashion identified by id
router.put('/:id', validateId, isLoggedIn, isAuthor, validateItem, validateResult, controller.update);

//DELETE /fashions/:id: delete the fashion identified by id
router.delete('/:id', validateId, isLoggedIn, isAuthor, controller.delete);

router.post('/:id/watch', validateId, isLoggedIn, controller.watch);

router.delete('/:id/unwatch', validateId, isLoggedIn, controller.unwatch);

router.post('/:id/trade', validateId, isLoggedIn, controller.trade);

router.post("/:id/tradeOffer", validateId, isLoggedIn, controller.tradeOffer);

router.get("/:id/manageOffer",validateId, isLoggedIn, controller.manageOffer);

router.get("/:id/acceptOffer",validateId, isLoggedIn, controller.acceptOffer);

router.get("/:id/rejectOffer", validateId, isLoggedIn, controller.rejectOffer);

router.delete("/:id/offer", validateId, isLoggedIn, controller.canceloffer);


module.exports = router;  