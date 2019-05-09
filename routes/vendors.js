/* vendors.js
    Tinker-toy implementation of a mud-url lookup & device registration service.
 */

var express = require('express');
var router = express.Router();

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
            res.send(mudURL(device.model, req.headers.host));
        }
        else {
            // TODO: Maybe return a generic mud URL
            res.status(404);
            res.end();
        }
    });
});

function mudURL(model, host) {
    console.log("mudURL - host: "+host);
    
    // TODO: provide for dev/prod, probably with dev/prod envvar

    if (host == 'hotdawg.micronets.in') {
        return "https://hotdawg.micronets.in/micronets-mud/"+model;
    }
    return "https://alpineseniorcare.com/micronets-mud/"+model;
}

// Convenience function to redirect register-device request to vendor's device registry
router.post('/register-device/:model/:pubkey', function(req, res, next) {

    if (req.params.model == undefined || req.params.pubkey == undefined) { 
        res.status(400);
        var error = {};
        error.error = "Invalid request" ;
        error.status = 400;
        res.send(JSON.stringify(error, null, 2));
    }

    // upsert not working for some reason. Creates multiple records. Use delete/insert instead
    //db.devices.update({ pubkey: req.params.pubkey }, req.params, { upsert: true });

    db.devices.remove({ pubkey: req.params.pubkey }, { multi: true }, function (err, numRemoved) {
        db.devices.insert(req.params);
    });
    
    res.send("Device registered");
    console.log("Device registered: " + JSON.stringify(req.params));
});

module.exports = router;
