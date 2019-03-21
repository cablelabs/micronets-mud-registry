// Web UI (Not implemented)
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'MUD Registry' });
  res.send("<html><body><center><h2>MUD Registry</h2></center></body></html>");
});

module.exports = router;
