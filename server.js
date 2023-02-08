const express = require ('express')
const app = express()

app.use(express.json())
app.set(('port', 3000))
app.use ((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    next();
})

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

app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.updateOne(
        {_id: new ObjectID(req.params.id)},
        {$set: req.body},
        {safe: true, multi: false},
 (e, result) => {
    if (e) return next(e)
    res.send((result) ? {msg: 'success'} : {msg: 'error'})
 }
)
})

app.delete('/collection/:collectionName/:id', (req, res, next) =>{
    req.collection.deleteOne(
        {_id: ObjectID(req.params.id)},
        (e, result) => {
            if (e) return next(e)
            res.send((result) ? {msg: 'success'}: {msg: 'error'})
        })
} 
)