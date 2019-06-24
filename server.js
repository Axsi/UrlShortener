const env = require('dotenv').config();
const bodyParser = require('body-parser');
const dns = require('dns');
const nanoid = require('nanoid');
const express = require('express');
const app = express();

const mongo = require('mongodb').MongoClient;

var db;
var collection;

//express.static exposes a directory or a file to a particular URL so its contents can be publicly accessed
app.use(express.static(__dirname + '/public/'));

// // support parsing of application/json type post data
app.use(bodyParser.json());

app.get('/', function(req,res){
    res.redirect('main');
    //works this way too.. hm
    // res.sendFile('main.html', {root: __dirname + '/public'});
});


app.get('/main', function(req, res){
    res.sendFile('main.html', {root: __dirname + '/public'});
});

app.post('/shortenUrl', function(req, res){
    console.log("WITHIN APP.POST");
    console.log(req.body);
    let newURL;

    //checking for correct URL structure
    try{
        newURL = new URL(req.body.url);
        console.log(newURL);
    } catch(err){
        console.log("Error: Invalid URL");
         return res.status(400).send({error: 'invalid URL'});
    }

    //dns check to see if site is active buy checking the hostname that is included in the newURL object
    dns.lookup(newURL.hostname, function(err){
        if(err){
            console.log("Error: Address not found");
            return res.status(404).send({error: 'Address not found'});
        }
    });
    shortUrl(newURL)
        .then(function (r){
        console.log(r);
        let returnID = r.value;

        //send a JSON response back
        res.json({short_id: returnID.short_id});
    });
});

app.post('/getUrl', function(req, res){
    console.log("WITHIN /getURL");
    console.log(req.body);
    collection.findOne(req.body)
        .then(function (r){
            // console.log(r);
            let returnURL = r.url;
            console.log(returnURL);

            //send a JSON response back;
            res.json({url: returnURL});

            // return res.redirect(returnURL);
        });
});

app.listen(process.env.PORT || 8100, function(){
    console.log('Server running on http://localhost:8100/')
});

function shortUrl(newURL){
    //first check to make sure the url doesnt already exists in the database, if it does update it if it doesnt create a new row
    let href = newURL.href;

    //return this so you can have access to short_id
    return collection.findOneAndUpdate({url: href},{$setOnInsert: {url: href, short_id: nanoid(7)}},
        {upsert: true, returnOriginal: false});
}

//======= MongoDB =========
//mongo.connect() to get the reference to the MongoDB instance client
//option useNewUrlParser set to true will avoid the DeprecationWarning. The current URL string parser is deprecated and will be removed in the future
mongo.connect(process.env.MONGO_URL || 'mongodb://localhost:27017',
    {useNewUrlParser: true}, function(err, client){
    if(err){
        console.log(err);
        return;
    }
     db = client.db('short');
     collection = db.collection('urls');
     console.log("Listening on port 27017");

});

