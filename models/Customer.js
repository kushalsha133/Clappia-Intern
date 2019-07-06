const express = require("express");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
  customerName: {
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
  date: {
    type: Date,
    default: Date.now()
  }
});
mongoose.model("customer", CustomerSchema);
