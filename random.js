const express = require("express");
const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost/test")
  .then(() => console.log("Connected"))
  .catch(err => console.log(err));

const testSchema = new mongoose.Schema({
  name: String
});

const Test = mongoose.model("test", testSchema);

async function testme() {
  const t = new Test({
    name: "Karan"
  });

  const result = await t.save();
  console.log(result);
}

testme();
