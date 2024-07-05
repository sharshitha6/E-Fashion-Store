const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const tradeSchema = new Schema({
    title: {type: String, required:[true, 'title is required']},
    author: {type: Schema.Types.ObjectId, ref: 'User'},
    category: {type: String, required:[true, 'category is required']},
    price: {type: String, required:[true, 'price is required']},
    size: {type: String, required:[true, 'size is required']},
    details: {type: String, required:[true, 'Details are required'],
        minLength: [10,'the content should have at least 10 characters']},
    watched: {type:Boolean},
    status: { type: String },
    offertitle: { type: String },
    offered: { type: Boolean },
    }, 
    {timestamps: true}
);

//collection name is trades in database 
module.exports = mongoose.model('Trade', tradeSchema);
