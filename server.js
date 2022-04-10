var express = require('express');
var cors = require('cors')
var fs = require("fs");
var MongoClient = require('mongodb').MongoClient;
var dbConnection = 'mongodb+srv://olavikurki:2nnaVaaht9@olavisreminders.wdq1n.mongodb.net/Reminders?retryWrites=true&w=majority';
// import database from "./database"
var database = require('./database')

var app = express();
app.use(express.json())
app.use(cors())

app.delete("/api/reminders/:id", function (req, res) {
  console.log(req.params)
  var reminderId = parseInt(req.params.id, 0)
  console.log(reminderId)
  if (database.deleteReminder(reminderId) == true) {
    res.status(200)
      .header({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
      .send(JSON.stringify(reminder));
  } else {
    res.status(406).send("Reminder doesn't exist!");
  }
  // MongoClient.connect(dbConnection, function (err, client) {
  //   var db = client.db('Reminders');
  //   db.collection('Reminder')
  //     .find({ _id: reminderId })
  //     .toArray((err, reminder) => {
  //       console.log(err)
  //       console.log(reminder)
  //       if (!reminder) {
  // res.status(406).send("Reminder doesn't exist!");
  //         client.close();
  //         return
  //       }
  //       db.collection('Reminder').deleteOne({ _id: reminderId }, result => {
  //         client.close();
  // res.status(200)
  //   .header({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
  //   .send(JSON.stringify(reminder));
  //       });
  //     })
  // })
})

app.get("/api/reminders/", function (req, res) {
  MongoClient.connect(dbConnection, function (err, client) {
    var db = client.db('Reminders');
    db.collection('Reminder')
      .find()
      .toArray((err, result) => {
        client.close();
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        var reminders = {
          reminders: result
        }
        res.write(JSON.stringify(reminders));
        res.end();
      })
  });
})

app.post("/api/reminders", function (req, res) {
  console.log(req.body.name + " " + req.body.timestamp)
  if (!req.body.name || !req.body.timestamp) {
    res.status(406).send("Invalid name or timestamp");
    return
  }
  MongoClient.connect(dbConnection, function (err, client) {
    var db = client.db('Reminders');
    db.collection('Reminder')
      .findOne({ name: req.body.name }, reminder => {
        console.log(reminder)
        if (reminder) {
          res.status(400).send("Same reminder already exists!");
          client.close();
          return
        }

        let newId = Math.trunc(Math.random() * 1000000)
        let newReminder = { _id: newId, name: req.body.name, timestamp: req.body.timestamp }
        db.collection('Reminder').insertOne(newReminder, result => {
          client.close();
          res.status(200).header({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }).send(JSON.stringify(newReminder));
        });
      })
  })
});



var server = app.listen(process.env.PORT || 4000, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)
})