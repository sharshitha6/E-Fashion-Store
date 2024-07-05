const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const offerSchema = new Schema({
  title: { type: String, required: [true, "Title is required"] },
  category: { type: String, required: [true, "Category is required"] },
  offeredby: { type: Schema.Types.ObjectId, ref: "User" },
  price: { type: String, required:[true, 'price is required'] },
  status: { type: String }
});

module.exports = mongoose.model("Offer", offerSchema);
