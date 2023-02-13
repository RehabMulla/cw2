const express = require ('express')
const app = express()
var path = require('path');
var cors = require('cors')


app.use(cors());
app.use(express.json())
app.set(('port', 3000))
app.use ((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    next();
})

var fs = require('fs');
// logger middleware
app.use(function(req, res, next) {
    console.log("Request IP: " + req.url);
    console.log("Request date: " + new Date());
    next();
});

const MongoClient = require('mongodb').MongoClient;
let db;

MongoClient.connect('mongodb+srv://RehabMulla:12345@cluster0.hzekf69.mongodb.net', (err, client) => {  
      db = client.db('School_Lessons')
    })
//display a message for root path to show that API is working
    app.get('/', (req, res, next) => { 
    res.send('Select a collection, e.g., /collection/messages')
})
//get the collection name
app.param('collectionName', (req, res, next, collectionName) => {  
    req.collection = db.collection(collectionName)
    return next()
})

app.get('/collection/:collectionName', (req, res, next) => {  
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)     
        res.send(results)    
    }  
    )      
})

  // static file server middleware
  app.use(function (req, res, next) {
    // Uses path.join to find the path where the file should be
    var filePath = path.join(__dirname, "images", req.url);
    // Built-in fs.stat gets info about a file    
    fs.stat(filePath, function (err, fileInfo) {
        if (err) {
            next();
            return;
        }
        if (fileInfo.isFile()) res.sendFile(filePath);
        else next();
    });
});

app.listen(3000, () => {
    console.log('Express.js server running at localhost:3000')
})

app.post('/collection/:collectionName', (req, res, next) => {  
    req.collection.insertOne(req.body, (e, results) => {
        if (e) return next(e)    
        res.send(results.ops) 
     })})

const ObjectID = require('mongodb').ObjectID;
app.get('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.findOne({ _id: new ObjectID(req.params.id)}, (e, result )=> {
        if (e) return next (e)
        res.send(result)
    })
})

//to update modified count
app.put("/collection/:collectionName/:id", (req, res, next) => {
    req.collection.update(
      { _id: new ObjectID(req.params.id) },
      { $set: req.body },
      { safe: true, multi: false },
      (e, result) => {
        if (e) return next(e);
        res.send(result.modifiedCount === 1 ? { msg: "success" } : { msg: "error" });
      }
    );
  });


// middleware error handler
app.use(function(req,res){
    res.status(404)
    res.send("Error! Not found!")
})