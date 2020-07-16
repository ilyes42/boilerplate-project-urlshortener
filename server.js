'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var dns = require("dns");

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

const uri = "mongodb+srv://admin:1123581321345589144233@cluster0.izupr.gcp.mongodb.net/urlshortener?retryWrites=true&w=majority";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const Url = mongoose.model('Url', {
  originalUrl: String,
  shortenedUrl: String
})

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post('/api/shorturl/new', function (req, res) {
  if (validateUrl(req.body.url)) {
    // dns.lookup(req.body.url, function(err, address, family){
    //   if (err) {
    //     res.json({
    //       error: "url is invalid/does no exist"
    //     });
    //   } else {
        // Url.find.count(function(err, count){
        //   const url = new Url({
        //     originalUrl: req.body.url,
        //     shortenedUrl: count
        //   })
        // })
    //   }
    // });
    Url.find().exec(function(err, results){
      const count = results.length
      const url = new Url({
        originalUrl: req.body.url,
        shortenedUrl: count
      })
      url.save().then(res.json({
        message: "success"
      }))
    })
  } else {
    res.json({
      error: "url is invalid/does no exist"
    });
  }
});

app.get('/:u', function(req, res){
  Url.findOne({shortenedUrl: req.params.u}).exec(function(err, result){
    if (err) {
      res.json({
        error: "url doesn't exist in database"
      })
    } else {
      res.redirect(result.originalUrl);
    }
  });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});

function validateUrl(value) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}
