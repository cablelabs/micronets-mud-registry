/*  
	There are 3 "manufacturer" domains pointing to this registry (acmemeds,vitalife,shurecare) and an open registry
	for looking up the manufacturer's mud-url endpoints (which are hosted on this same server)

	Base URIs set up in virtual hosts that point to this server:

	(** Note ** URIs moved to lib/config.js)

	https://registry.micronets.in/mud --> /registry
	https://shurecare.micronets.in/registry/devices --> /vendors
	https://vitalife.micronets.in/registry/devices --> /vendors
	https://acmemeds.micronets.in/registry/devices --> /vendors
	https://hotdawg.micronets.in/registry/devices --> /vendors

 */

var express = require('express');
var router = express.Router();
const fs = require('fs');

var config = require('../lib/config.js');
var vendors = config.vendors;

function getVendorURL(req) {

	if (process.env.LOCAL_MUD) {
		return "http://localhost:3082/vendors";
	}
	else if (req.params.vendor && vendors[req.params.vendor]) {
		return vendors[req.params.vendor];
	}

	return undefined;
}

// Get the vendor registry url to retrieve MUD urls
router.get('/mud-registry/:vendor', function(req, res, next) {

	var vendorURL = getVendorURL(req);

	if (!vendorURL) {
        // Invalid request.
        res.status(400);
        var error = {};
        error.error = "Vendor not found" ;
        error.status = 400;
        res.send(JSON.stringify(error, null, 2));
	}

	res.status(200);
	res.send(mudURL(vendorURL));
});

// Get the vendor registry url to register devices
router.get('/device-registry/:vendor', function(req, res, next) {

	var vendorURL = getVendorURL(req);

	if (!vendorURL) {
        // Invalid request.
        res.status(400);
        var error = {};
        error.error = "Vendor not found" ;
        error.status = 400;
        res.send(JSON.stringify(error, null, 2));
	}

	res.status(200);
	res.send(registerURL(vendorURL));
});

// Convenience function to redirect mud-url request to vendor's mud registry
router.get('/mud-url/:vendor/:pubkey', function(req, res, next) {

	var vendorURL = getVendorURL(req);

	if (!vendorURL || !req.params.pubkey) {
        res.status(400);
        var error = {};
        error.error = "Invalid Request" ;
        error.status = 400;
        res.send(JSON.stringify(error, null, 2));
	}

	var redirectURL = mudURL(vendorURL, req.params.pubkey);
	console.log("redirecting to: "+redirectURL);
	res.redirect(301, redirectURL);
});

// Convenience function to redirect mud-url (model instead of pubkey) request to vendor's mud registry
router.get('/model/mud-url/:vendor/:model', function(req, res, next) {

	var vendorURL = getVendorURL(req);

	if (!vendorURL || !req.params.model) {
        res.status(400);
        var error = {};
        error.error = "Invalid Request" ;
        error.status = 400;
        res.send(JSON.stringify(error, null, 2));
	}

	var redirectURL = mudURL(vendorURL + '/model', req.params.model);
	console.log("redirecting to: "+redirectURL);
	res.redirect(301, redirectURL);
});

// Convenience function to return the MUD file itself
router.get('/mud-file/:vendor/:pubkey', function(req, res, next) {

	var vendorURL = getVendorURL(req);

	if (!vendorURL || !req.params.pubkey) {
        res.status(400);
        var error = {};
        error.error = "Invalid Request" ;
        error.status = 400;
        res.send(JSON.stringify(error, null, 2));
	}

	var redirectURL = mudFile(vendorURL, req.params.pubkey);
	console.log("redirecting to: "+redirectURL);
	res.redirect(301, redirectURL);
});

// Convenience function to return the MUD file itself (model instead of pubkey) 
router.get('/model/mud-file/:vendor/:model', function(req, res, next) {

	var vendorURL = getVendorURL(req);

	if (!vendorURL || !req.params.model) {
        res.status(400);
        var error = {};
        error.error = "Invalid Request" ;
        error.status = 400;
        res.send(JSON.stringify(error, null, 2));
	}

	var redirectURL = mudFile(vendorURL + '/model', req.params.model);
	console.log("redirecting to: "+redirectURL);
	res.redirect(301, redirectURL);
});

// Convenience function to list the registry. Mainly used for testing
router.get('/list', function(req, res, next) {
	res.redirect(301, "/vendors/list");
});

// Convenience function to remove a device (any vendor). Mainly used for testing
router.post('/remove-device/:pubkey', function(req, res, next) {
	res.redirect(301, "/vendors/remove-device/" + req.params.pubkey);
});

// Convenience function to redirect register-device request to vendor's device registry
router.post('/register-device/:vendor/:model/:pubkey', function(req, res, next) {

	var vendorURL = getVendorURL(req);

	if (!vendorURL || !req.params.model || !req.params.pubkey) {
        res.status(400);
        var error = {};
        error.error = "Invalid request" ;
        error.status = 400;
        res.send(JSON.stringify(error, null, 2));
	}

	var redirectURL = registerURL(vendorURL, req.params.model, req.params.pubkey);
	console.log("redirecting to: "+redirectURL);
	res.redirect(301, redirectURL);
});

function mudURL(baseurl, pubkey) {
	var url = baseurl + "/mud-registry";
	if (pubkey) {
		url += "/" + pubkey;
	}
	return url;
}

function mudFile(baseurl, pubkey) {
	var url = baseurl + "/mud-file";
	if (pubkey) {
		url += "/" + pubkey;
	}
	return url;
}

function registerURL(baseurl, model, pubkey) {
	var url = baseurl + "/register-device";
	if (model && pubkey) {
		url += "/" + model + "/" + pubkey;
	}
	//console.log("registerURL: "+url);
	return url;
}

module.exports = router;
