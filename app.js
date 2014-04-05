
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var fs = require('fs');

// Load Orchestrate API key and Module

var orcApiKey = fs.readFileSync('./orcApiKey', {encoding: 'utf8'}).replace('\n', '');
console.log(orcApiKey);
var db = require('orchestrate')(orcApiKey);

var app = express();


// Load Stripe API key and module
var stripe = require('stripe')('sk_test_CVLdm8e9cko34MGtta5kBAAy');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// Route to dummy payments form
app.get('/payments', function(req, res) {
	res.sendfile('./payments.html')
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.put('/api/acceptDonation', function(req, res) {
	db.put('Donors', req.query.userName, {
		'firstName': req.query.firstName
	})
	.then(function(result){

	})
	.fail(function(err){

	});
});

app.post('/api/acceptDonation', function(req, res) {

	db.get('Donors', req.query.userName)
	.then(function(result) {

		db.put('Donors', req.query.userName, {
			'firstName': req.query.firstName
		})
		.then(function(result) {
		res.send('Added User: ' + req.query.userName + ', ' + req.query.firstName);
		})
		.fail(function(err) {
			console.log(err);
			res.send('error');
		});	
		
	})
	.then(function(err) {
		res.send('error');
	});
	
});


	app.get('/api/addUser/:userName/:firstName', function(req, res) {
	db.put('Users', req.params.userName, {
		'userName': req.params.firstName
	})
	.then(function(result) {
		res.send('Added User: ' + req.params.userName + ', ' + req.params.firstName);
	})
	.fail(function(err) {
		console.log(err);
		res.send('error');
	});
});

	app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
