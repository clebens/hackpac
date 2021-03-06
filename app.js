
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
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);


// Route to dummy payments form
app.get('/payments', function(req, res) {
	res.sendfile('./public/payments.html')
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.post('/payments', function(req, res) {

		processPayment(req, res);
		addDonor(req, res);

});

function processPayment(req, res) {
	// Set your secret key: remember to change this to your live secret key in production
// See your keys here https://manage.stripe.com/account
stripe.setApiKey(fs.readFileSync('./strApiKey', {encoding: 'utf8'}).replace('\n', ''));

// (Assuming you're using express - expressjs.com)
// Get the credit card details submitted by the form
var stripeToken = req.body.stripeToken;


var charge = stripe.charges.create({
  amount: 15, // amount in cents, again
  currency: "usd",
  card: stripeToken,
  description: "payinguser@example.com"
}, function(err, charge) {
  if (err && err.type === 'StripeCardError') {
    // The card has been declined
      console.log('declined');
  }

  console.log('Charge:' + charge);
});



res.send('Hey!');
}

function addDonor(req, res) {

	var donorKey = req.body.username;

	db.put('Donors', donorKey, {
		'firstName': req.body.firstName,
		'lastName': req.body.lastName,
		'streetAddress1': req.body.streetAddress1,
		'streetAddress2': req.body.streetAddress2,
		'city': req.body.city,
		'state': req.body.state,
		'country': req.body.country,
		'zipCode': req.body.zipCode,
		'occupation': req.body.occupation,
		'totalDonation': 0,
		'annualDonation': 0,
		'phoneNumber': req.body.phoneNumber
	})
	.then(function(result){

	})
	.fail(function(err){

	});
}

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


// The secret to bridging Angular and Express in a 
// way that allows us to pass any path to the client.

// Also, this depends on the static middleware being
// near the top of the stack.
app.get('*', function (req, res) {
	routes.index(req, res);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
