const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");

const app = express();

// Connect to Mongoose:
mongoose
  .connect("mongodb://localhost/inventory", { useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Loading Product Model:
require("./models/Products");
const Product = mongoose.model("products");

// Loading Customer Model:
require("./models/Customer");
const Customer = mongoose.model("customer");

// Loading Sales Model:
require("./models/Sales");
const Sales = mongoose.model("sales");

// BodyParser Middlewware:
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Method Override Middleware:
app.use(methodOverride("_method"));

// Handlebars Middleware:
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.get("/", (req, res) => {
  res.render("home");
});

// Add Product Router:
app.get("/addProduct", (req, res) => {
  res.render("addProduct");
});

// Process Form:
app.post("/productList", (req, res) => {
  let psn = req.body.productSerialNo;
  Product.findOne({ productSerialNo: psn }).then(product => {
    if (product.productSerialNo === psn) {
      product.quantity = product.quantity + parseInt(req.body.quantity);
      product.save();
      res.redirect("/productList");
    }
    }); 
  
    const p = {
      productName: req.body.productName,
      productSerialNo: req.body.productSerialNo,
      quantity: req.body.quantity,
      pricePerUnit: req.body.pricePerUnit,
      vendorName: req.body.vendorName
    };

    new Product(p).save().then(id => {
      res.redirect("/productList");
  });
});

// Product List Router:
app.get("/productList", (req, res) => {
  Product.find({}).then(products => {
    res.render("productList", {
      products: products
    });
  });
});

//app.post("/productList", (req, res) => {
//  Product.find({}).then(products => {
//    res.render("productList", {
//      products: products
//    });
//  });
//});

// Customer Info. Router:
app.get("/customer", (req, res) => {
  res.render("customer");
});

// Process Form:
app.post("/customer", (req, res) => {
  const customer = {
    customerName: req.body.customerName,
    address: {
      houseNo: req.body.houseNo,
      street: req.body.street,
      city: req.body.city,
      pincode: req.body.pincode
    }
  };
  new Customer(customer)
    .save()
    .then(response => {
      let id = mongoose.Types.ObjectId(response._id);
      res.redirect(`/customerSaved/${id}`);
    })
    .catch(err => console.log(err));
});

// Customer Saved:
app.get("/customerSaved/:id", (req, res) => {
  Customer.findOne({
    _id: mongoose.Types.ObjectId(req.params.id)
  }).then(response => {
    res.render("customerSaved", {
      response: response
    });
  });
});

// Place Order:
app.get("/placeOrder/:id", (req, res) => {
  Customer.findOne({
    _id: mongoose.Types.ObjectId(req.params.id)
  }).then(customer => {
    res.render("placeOrder", { customer: customer });
  });
});

// Process Place Order Form:
let order1 = [];
app.post("/placeOrder/:id", (req, res) => {
  let id = req.params.id;
  errors = [];
  let pname = req.body.productName;
  let q = req.body.quantity;
  Product.findOne({ productName: pname }).then(product => {
    if (product.quantity < q) {
      errors.push({
        text: `Please reduce quantity by ${q - product.quantity}`
      });
      order1.length = 0;
    } else {
      product.quantity = product.quantity - q;
      product.save();
    }
  });
  // if (order1.length > 0) {
  //   order1.forEach(o => {
  //     if (pname === o.ProductName) {
  //       o.Quantity = q;
  //       o.Amount = o.PricePerUnit * q;
  //     } else {
  //       Product.findOne({ productName: pname }).then(product => {
  //         let orederObject = {
  //           ProductName: product.productName,
  //           SerialNo: product.productSerialNo,
  //           PricePerUnit: product.pricePerUnit,
  //           Quantity: q,
  //           Amount: product.pricePerUnit * q
  //         };
  //         order1.push(orederObject);
  //       });
  //     }
  //   });
  // } else {
  //   Product.findOne({ productName: pname }).then(product => {
  //     let orederObject = {
  //       ProductName: product.productName,
  //       SerialNo: product.productSerialNo,
  //       PricePerUnit: product.pricePerUnit,
  //       Quantity: q,
  //       Amount: product.pricePerUnit * q
  //     };
  //     order1.push(orederObject);
  //   });
  // }
  Product.findOne({ productName: pname }).then(product => {
    let orederObject = {
      ProductName: product.productName,
      SerialNo: product.productSerialNo,
      PricePerUnit: product.pricePerUnit,
      Quantity: q,
      Amount: product.pricePerUnit * q
    };
    order1.push(orederObject);
  });
  res.render("placeOrder", {
    errors: errors,
    q: q,
    order1: order1,
    id: id,
    pname: pname
  });
});

// Confirm Order:
app.get("/orderConfirmed/:id", (req, res) => {
  let id = mongoose.Types.ObjectId(req.params.id);
  Customer.findOne({ _id: id }).then(customer => {
    customer.orders.push(order1);
    let totalAmount = 0;
    customer.orders.forEach(o => {
      o.forEach(x => {
        totalAmount = totalAmount + x.Amount;
      });
    });

    customer.save().then(customer => {
      const c = {
        customerName: customer.customerName,
        customerId: customer._id,
        address: {
          houseNo: customer.address.houseNo,
          street: customer.address.street,
          city: customer.address.city,
          pincode: customer.address.pincode
        },
        orders: [customer.orders],
        totalAmount: totalAmount
      };
      new Sales(c).save().then();

      res.render("confirmOrder", {
        customer: customer,
        totalAmount: totalAmount
      });
    });
  });
});
order1.length = 0;

app.get("/printInvoice/:id", (req, res) => {
  Sales.findOne({ customerId: req.params.id }).then(sales => {
    res.render("printInvoice", {
      sales: sales
    });
  });
});

app.get("/sales", (req, res) => {
  Sales.find({}).then(sales => {
    res.render("sales", {
      sales: sales
    });
  });
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server started on Port ${port}`);
});
