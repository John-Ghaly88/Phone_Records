var express = require("express");
var path = require("path");
const mongoose = require("mongoose");
var comments = require("./schemes/comments");
const contacts = require("./schemes/contacts");
const users = require("./schemes/userSchema");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
'use strict';

//DB connection
async function main() {
  var uri = "mongodb://admin:swsec@cluster0-shard-00-00.1zdiw.mongodb.net:27017,cluster0-shard-00-01.1zdiw.mongodb.net:27017,cluster0-shard-00-02.1zdiw.mongodb.net:27017/swsec?ssl=true&replicaSet=atlas-slll6s-shard-0&authSource=admin&retryWrites=true&w=majority"
  await mongoose
    .connect(process.env.MONGODB_URI || uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((config) => {
      console.log("connected to DB successfully");
    });
}
main().catch(console.error);
var app = express();

app.engine("ejs", require("ejs").__express);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", function (req, res) {
  res.render("login");
});

app.get("/registration", function (req, res) {
  res.render("registration");
});

app.get("/contacts", async (req, res) => {
  try {
    if(req.query.Cont_Name){
      const CName = req.query.Cont_Name;
      const CNo = await contacts.findOne({ userID: req.cookies.key, CName: CName });
      if(CNo){
        res.render("contacts", {data: CNo});
      } else if(CNo === null) {
        res.render("contacts", {data: {CNo:"Contact not found"}});
      }
    } else {
      res.render("contacts", {data: ''});
    }
    
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

app.get("/comments", async (req, res) => {
  try {
    const comment = await comments.find({});
    res.render("comments", {com: comment});

  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

app.get("/forgetPass", async (req, res) => {
  try {
    res.render("forgetPass");

  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

app.post("/contacts", async (req, res) => {
  const newRecord = new contacts({
    CName: req.body.Contact_Name,
    CNo: req.body.Contact_No,
    userID: req.cookies.key
  });
  try {
    await newRecord.save();
    res.status(201);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
});

app.post("/comments", async (req, res) => {
  const newRecord = new comments({
    comment: req.body.Comment,
    name: req.body.Name,
  });
  try {
    await newRecord.save();
    res.status(201);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
});

app.post("/registration", async (req, res) => {
  const newRecord = new users({
    name: req.body.username,
    email: req.body.email,
    birthdate: req.body.birthdate,
    password: req.body.password
  });
  try {
    await newRecord.save();
    res.status(201).redirect('/');
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
});

app.post('/logout', function(req, res, next) {
  res.clearCookie("key");
  res.redirect('/');
});

app.post("/forgetPass", async (req, res)=> {
      users.findOne({birthdate: req.body.birthdate, email: req.body.email}).then(user => {
        if(!user)
          return res.status(401).json({
            error: new Error('User not found!')
          });
        user.password = req.body.password;
        user.save();
        res.status(201).redirect('/');
        })
});

app.post("/" , async (req, res, next)=>{
  users.findOne({name: req.body.username}).then(
    (user) => {
      if(!user)
        return res.status(401).json({
          error: new Error('User not found!')
        });
      bcrypt.compare(req.body.password, user.password).then(
        (valid) => {
          if(!valid)
            return res.status(401).json({
              error: new Error('Incorrect password')
            })
            res.status(200).cookie("key", req.body.username).redirect('/contacts')
        }
      ).catch(
        (error) =>{
          res.status(500).json({
            error: error
          })
        }
      )
    }
  ).catch(
    (error) =>{
      res.status(500).json({
        error: error
      });
    }
  )
});

if(process.env.PORT){
  app.listen(process.env.PORT, function() {console.log('Server started on heroku')})
}
else{
  app.listen(3000, function() {console.log('Server started on local host 3000')})
}

module.exports = app;

//node app to run locally, then open ur browser and type localhost:3000
