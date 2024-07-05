const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const watchSchema = new Schema({
    title: { type: String, required: [true, "title is required"] },
    category: {type:String, required: [true, "Category is required"]},
    price: {type: String, required:[true, "price is required"]},
    watchedby: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String }
});

//Collection will be named as watch in database
module.exports = mongoose.model('Watch', watchSchema);
