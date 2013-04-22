/**
 * Module dependencies
 */
var express = require('express'),
mongodb = require('mongodb');

/**
 * Set up application.
 */
var app = express.createServer();

/**
 * Middleware.
 */
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: 'my secret' }));

/**
 * Specify your views options.
 */
app.set('view engine', 'jade');

// the following line won't be needed in express
app.set('view options', { layout: false });

/**
 * Default route
 */
app.get('/', function (req, res) {
    res.render('index', { authenticated: false });
});

/**
 * Login route
 */
app.get('/login', function (req, res) {
    res.render('login');
});

app.get('/login/:signupEmail', function (req, res) {
    res.render('login', { signupEmail: req.params.signupEmail });
});

/**
 * Signup route
 */
app.get('/signup', function (req, res) {
    res.render('signup');
});

/**
 * Signup route
 */
//app.listen(3000);

/**
 * Connect to the datebase.
 */
var server = new mongodb.Server('127.0.0.1', 27017)
new mongodb.Db('my-website', server).open(function (err, client) {
    // don't allow the app to start if there was an error
    if (err) throw err;
    console.log('\033[96m  + \033[39m connected to mongodb');

    // set up collection shortcuts
    app.users = new mongodb.Collection(client, 'users');

    // listen
    app.listen(3000, function () {
	console.log('\033[96m  + \033[39m app listening on *:3000');
    });
});

/**
 * Signup processing route
 */
app.post('/signup', function (req, res, next) {
    app.users.insert(req.body.user, function (err, doc) {
	if (err) return next(err);
	res.redirect('/login/' + doc[0].email);
    });
});

