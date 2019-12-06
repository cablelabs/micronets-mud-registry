/* vendors.js
    Tinker-toy implementation of a mud-url lookup & device registration service.
 */

var express = require('express');
var router = express.Router();

// MUD file location
let mudFileLocation = "https://alpineseniorcare.com/micronets-mud";

if (process.env.mud_base_uri) {
    mudFileLocation = process.env.mud_base_uri;
}


// Database
const Datastore = require('nedb');
let db = {};
db.devices = new Datastore({filename: 'device-registration.nedb', autoload: true});
db.devices.ensureIndex({fieldName: 'pubkey', unique: true});

// Lookup the url for the MUD file for the device containing this key. Note for this demo
// all vendors are using the same database. In a real deployment, each vendor would have their
// own endpoint/registry.
router.get('/mud-registry/:pubkey', function(req, res, next) {

    db.devices.findOne({ pubkey: req.params.pubkey }, function (err, device) {
        if (device != undefined) {
            res.send(mudURL(device.model));
        }
        else {
            // TODO: Maybe return a generic mud URL
            res.status(404);
            res.end();
        }
    });
});

// Same as mud-registry, except return the file itself instead of its URL
router.get('/mud-file/:pubkey', function(req, res, next) {

    db.devices.findOne({ pubkey: req.params.pubkey }, function (err, device) {
        if (device != undefined) {
            res.redirect(301, mudURL(device.model));
        }
        else {
            // TODO: Maybe return a generic mud URL
            res.status(404);
            res.end();
        }
    });
});

function mudURL(model) {

    // One limitation of this tinker toy implementation - the same endpoint for all of the vendors, is that we don't know 
    // which vendor we are - so we can't serve per vendor urls. All urls point to alpineseniorcare. 

    // A workaround is having symlinks from the MUD at alpineseniorcare.com to the vendor site.
    // eg. 
    // cd /var/www/alpineseniorcare.com/html/micronets-mud
    // sudo ln -s /var/www/hotdawg.micronets.in/html/micronets-mud/AgoNDQcDDgg AgoNDQcDDgg

    return mudFileLocation+'/'+model;
}

// Dump the registry
router.get('/list', function(req, res, next) {

    db.devices.find({}).sort({ timestamp: 1 }).exec(function (err, docs) {
        if (err) {
            res.status(400);
            res.send("List Registry failed: "+ err);
        }
        else {
            res.send(JSON.stringify(docs,null,2));
        }
    });
});

// Remove a device
router.post('/remove-device/:pubkey', function(req, res, next) {

    if (req.params.pubkey == undefined || req.params.pubkey == "") { 
        res.status(400);
        var error = {};
        error.error = "Invalid request" ;
        error.status = 400;
        res.send(JSON.stringify(error, null, 2));
    }

    db.devices.remove({ pubkey: req.params.pubkey }, { multi: true }, function (err, numRemoved) {
        // Compact the database. (Size is not the issue, it is hard to read with journal entries)
        db.devices.persistence.compactDatafile();
        res.send("Device removed: "+req.params.pubkey);
    });
});

// Register a device. 
router.post('/register-device/:model/:pubkey', function(req, res, next) {

    if (req.params.model == undefined 
        || req.params.pubkey == undefined
        || req.params.model == "" 
        || req.params.pubkey == "") 
    { 
        res.status(400);
        var error = {};
        error.error = "Invalid request" ;
        error.status = 400;
        res.send(JSON.stringify(error, null, 2));
    }

    // Add a timestamp string
    req.params.timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + " UTC"; 

    // Insert if not present, otherwise update existing record
    db.devices.update({ pubkey: req.params.pubkey }, req.params, { upsert: true, returnUpdatedDocs: true }, function (err, numAffected, record, upsert) {
        if (err) {
            res.status(400);
            var error = {};
            error.error = "Device Registration failed: "+ err ;
            error.status = 400;
            res.send(JSON.stringify(error, null, 2));
        }
        else if (upsert) {
            res.send("Device registered (insert): "+JSON.stringify(record,null,2));
        }
        else {
            res.send("Device registered (update): "+JSON.stringify(record,null,2));
        }

        // Compact the database. (Size is not the issue, it is hard to read with journal entries)
        db.devices.persistence.compactDatafile();
    });
});

module.exports = router;
