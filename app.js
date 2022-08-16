const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const session = require('express-session');
var fs = require("fs");
var alert = require('alert');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(bodyParser.json())
app.use(session({
	secret: 'Your secret key',
	resave: true,
	saveUninitialized: true
}));
mongoose.connect("mongodb+srv://Siddharth12345:Siddharth%40123@cluster0.wkypk.mongodb.net/?retryWrites=true&w=majority")
  .then(() => {
    console.log('Connected to database ')
  })
  .catch((err) => {
    console.error(`Error connecting to the database. \n${err}`);
  })

const userSchema = {
    firstname: String,
    lastname: String,
    address: String,
    city: String,
    pincode: String,
    email: String,
    pass: String
};

const productSchema ={
    code: String,
    name: String,
    description: String,
    Category: String,
    imgurl: String,
    price: String,
    Quantity: Number
}

const orderSchema = {
    price: String,
    User: String,
    Status: String
}

const User = mongoose.model("User",userSchema);
const Product = mongoose.model("Product",productSchema);
const Order = mongoose.model("Order",orderSchema);

app.get("/admin", function(req,res){
    Order.find({}, function(err, doc){
        if(!err){
            res.render("order.ejs", {order: doc});
        }
        else{
            res.redirect("/");
        }
    })
});

app.get("/add", function(req,res){
    res.render("add.ejs");
});

app.get("/delete", function(req,res){
    res.render("delete.ejs");
});

app.get("/update", function(req,res){
    res.render("update.ejs");
});

app.get("/customer", function(req,res){
    User.find({}, function(err, doc){
        console.log(doc);
        if(!err){
            res.render("customer.ejs", {user: doc});
        }
        else{
            res.redirect("/");
        }
    });
});

app.get("/", function(req,res){
    res.render("home.ejs");
});

app.get("/signin", function(req,res){
    res.render("signin.ejs");
});

app.get("/signup", function(req,res){
    res.render("register.ejs");
});

app.get("/feedback", function(req,res){
    res.render("feedback.ejs");
});

app.get("/electronics", function(req,res){
    if(req.session.username){
        Product.find({Category: "Electronics"}, function(err, doc){
            if(!err){
                res.render("electronics.ejs", {pro: doc});
            }
            else{
                res.redirect("/signin");
            }
        });
    }
    else{
        res.redirect("/signin");
    }
});

app.get("/clothing", function(req,res){
    if(req.session.username){
        Product.find({Category: "Clothing"}, function(err, doc){
            if(!err){
                res.render("clothing.ejs", {pro: doc});
            }
            else{
                res.redirect("/signin");
            }
        });
    }
    else{
        res.redirect("/signin");
    }
});

app.get("/gym", function(req,res){
    if(req.session.username){
        Product.find({Category: "Gym Equipment"}, function(err, doc){
            console.log(doc);
            if(!err){
                res.render("gym.ejs", {pro: doc});
            }
            else{
                res.redirect("/signin");
            }
        });
    }
    else{
        res.redirect("/gym");
    }
});

app.post("/checkout", function(req,res){
    if(req.session.username){
        var name = req.body.proname;
        var prc = req.body.price * req.body.quantity;
        res.render("checkout", {name: name, price: prc});
    }
    else{
        res.redirect("/signin");
    }
});

app.get("/cart/:id", function(req,res){
    if(req.session.username){
        Product.find({_id: req.params.id}, function(err, doc){
            console.log(doc[0].imgurl);
            if(!err){
                res.render("cart.ejs", {i: doc, id: req.params.id});
            }
            else{
                res.redirect("/product");
            }
        });
    }
    else{
        res.redirect("/signin");
    }
});

app.get("/product", function(req,res){
    if(req.session.username){
        Product.find({Category: "protien"}, function(err, doc){
            if(!err){
                res.render("product.ejs", {pro: doc});
            }
            else{
                res.redirect("/signin");
            }
        });
    }
    else{
        res.redirect("/signin");
    }
});

app.post("/delivered/:id", function(req,res){
    Order.findOneAndUpdate({_id: req.params.id}, {Status: "Delivered"}, function(err, doc){
        if(err){
            console.log(doc);
        }
        else{
            doc.save();
            res.redirect("/admin");
        }
    });
});

app.post("/Outfordelivery/:id", function(req,res){
    Order.findOneAndUpdate({_id: req.params.id}, {Status: "Out for delivery"}, function(err, doc){
        if(err){
            console.log(doc);
        }
        else{
            doc.save();
            res.redirect("/admin");
        }
    });
});

app.post("/cancel/:id", function(req,res){
    Order.findOneAndUpdate({_id: req.params.id}, {Status: "Cancelled"}, function(err, doc){
        if(err){
            console.log(doc);
        }
        else{
            doc.save();
            res.redirect("/admin");
        }
    });
});

app.post("/placed/:id", function(req,res){
    Order.findOneAndUpdate({_id: req.params.id}, {Status: "Placed"}, function(err, doc){
        if(err){
            console.log(doc);
        }
        else{
            doc.save();
            res.redirect("/admin");
        }
    });
});

app.post("/signup", function(req,res){
    const user = new User({
        firstname: req.body.fname,
        lastname: req.body.lname,
        address: req.body.address,
        city: req.body.city,
        pincode: req.body.pin,
        email: req.body.email,
        pass: req.body.pwd
    });
    user.save(function(err){
        if(!err){
            console.log("Account created");
            res.redirect("/signin");
        }
    });
});

app.post("/signin", function(req,res){
    User.exists({email: req.body.email,pass: req.body.pwd}, function(err, check){
        console.log(check);
        if(err){
            console.log(err);
        }
        else{
            if(check)
            {
                req.session.username = req.body.email;
                req.session.pass = req.body.pwd;
                console.log("logged in");
                res.redirect("/product");
            }
            else if(!check){
                alert("Invalid username or password");
                console.log("Invalid username or password");
                res.redirect("/");
            }
        }
    });
});

app.post("/addproduct", function(req,res){
    const product = new Product({
        code: req.body.productcode,
        name: req.body.productname,
        description: req.body.description,
        Category: req.body.category,
        imgurl: req.body.imgurl,
        price: req.body.price,
        Quantity: req.body.quantity
    });
    product.save(function(err){
        if(!err){
            console.log("Product created");
            res.redirect("/add");
        }
    });
});

app.post("/orderconfirm", function(req,res){
    console.log(req.session.username);
    const order = new Order({
        price: req.body.price,
        User: req.body.email,
        Status: "Placed"
    });
    order.save(function(err){
        if(!err){
            console.log("Order created");
            res.redirect("/success");
        }
    });
});

app.get("/success", function(req,res){
    res.render("success");
});

app.post("/delete", function(req,res){
    Product.findOneAndDelete({code: req.body.productcode}, function (err, docs) {
        if (err){
            console.log(err)
        }
        else{
            console.log("Deleted User : ", docs);
            res.redirect("/delete");
        }
    });
});

app.post("/updateproduct", function(req,res){
    Product.findOneAndUpdate({code: req.body.productcode}, {Quantity: req.body.quantity}, function(err, doc){
        console.log(doc);
        if(err){
            console.log(err)
        }
        else{
            res.redirect("/update");
        }
    });
});

app.get("/logout", function(req,res){
    req.session.destroy();
    res.redirect("/")
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
});