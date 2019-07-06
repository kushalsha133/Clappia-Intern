const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  productName: {
    type: String,
    required: true
  },
  productSerialNo: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  pricePerUnit: {
    type: Number,
    required: true
  }
});

mongoose.model("products", ProductSchema);
