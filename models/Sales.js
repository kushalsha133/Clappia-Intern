const express = require("express");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SalesSchema = new Schema({
  customerName: {
    type: String,
    required: true
  },
  customerId: {
    type: String,
    required: true
  },
  address: {
    houseNo: String,
    street: String,
    city: String,
    pincode: Number
  },
  orders: {
    type: Array
  },
  totalAmount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now()
  }
});
mongoose.model("sales", SalesSchema);
