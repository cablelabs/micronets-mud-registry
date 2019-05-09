/*  
	There are 3 "manufacturer" domains pointing to this registry (acmemeds,vitalife,shurecare) and an open registry
	for looking up the manufacturer's mud-url endpoints (which are hosted on this same server)

	Base URIs set up in virtual hosts that point to this server:

	https://registry.micronets.in/mud --> /registry
	https://shurecare.micronets.in/registry/devices --> /vendors
	https://vitalife.micronets.in/registry/devices --> /vendors
	https://acmemeds.micronets.in/registry/devices --> /vendors
	https://hotdawg.micronets.in/registry/devices --> /vendors

 */

var express = require('express');
var router = express.Router();

// VendorID is A-Z, 4 characters == 456976 vendors. Expand as necessary.

// Statics for demo purposes. These codes are added to the information field of a DPP qrcode.
const vendors = {
	"SHCR": "https://shurecare.micronets.in/registry/devices",
	"VTLF": "https://vitalife.micronets.in/registry/devices",
	"ACMD": "https://acmemeds.micronets.in/registry/devices",
	"DAWG": "https://hotdawg.micronets.in/registry/devices"
}

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

function registerURL(baseurl, model, pubkey) {
	var url = baseurl + "/register-device";
	if (model && pubkey) {
		url += "/" + model + "/" + pubkey;
	}
	console.log("registerURL: "+url);
	return url;
}

module.exports = router;
