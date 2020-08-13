// 'use strict';
// var express = require('express');
// var app = express();
// var routes = require('./routes/routes')
// var jsonParser = require("body-parser").json;
// app.use(jsonParser());
// // const connectDB=require("./DB/connection")

// // connectDB();




// // //require mongooes
// // var mongooes = require('mongoose');

// // //connecting to mongodb Server

// // mongooes.connect("mongodb://localhost:27017/task2", {useNewUrlParser: true, useUnifiedTopology: true});

// // //we can monitor status of connection through mongoose.db
// // var db = mongooes.connection;

// // db.on("error",function(err){
// //     console.error("connection error: ",err);
// // })

// // db.once("open",function(){

// //     console.log("db successful");
// // });
  

// app.use("/",routes);

// app.use(function(req,res,next){
//     var err=new Error("not found");
//     err.status=404;
//     next(err);
// })

// app.use(function(err,req,res,next){
//     res.status(err.status || 500);
//     res.json({
//         message: err.message
//     })
//     next();
// });

