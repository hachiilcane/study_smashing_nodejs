/**
 * Module dependencies
 */
var express = require('express'),
mongodb = require('mongodb'),
ObjectId = mongodb.ObjectID;

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
 * Authentication middleware.
 */
app.use(function (req, res, next) {
    if (req.session.loggedIn) {
	res.local('authenticated', true);
	app.users.findOne({ _id: new ObjectId(req.session.loggedIn) }, function (err, doc) {
	    if (err) return next(err);
	    res.local('me', doc);
	    next();
	});
    } else {
	res.local('authenticated', false);
	next();
    }
});

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
    res.render('index');
});

/**
 * Login route
 */
app.get('/login', function (req, res) {
    res.render('login', { signupEmail: '' });
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
 * Connect to the datebase.
 */
var server = new mongodb.Server('127.0.0.1', 27017)
new mongodb.Db('my-website', server).open(function (err, client) {
    // don't allow the app to start if there was an error
    if (err) throw err;
    console.log('\033[96m  + \033[39m connected to mongodb');

    // set up collection shortcuts
    app.users = new mongodb.Collection(client, 'users');

    client.ensureIndex('users', 'email',  function (err) {
	if (err) throw err;
	client.ensureIndex('users', 'password', function (err) {
	    if (err) throw err;

	    console.log('\033[96m  + \033[39m ensured indexes');

	    // listen
	    app.listen(3000, function () {
		console.log('\033[96m  + \033[39m app listening on *:3000');
	    });
	});
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

/**
 * Login process route
 */
app.post('/login', function (req, res) {
    app.users.findOne({ email: req.body.user.email, password: req.body.user.password }, function (err, doc) {
	if (err) return next(err);
	if (!doc) return res.send('<p>User not found. Go back and try again</p>');
	req.session.loggedIn = doc._id.toString();
	res.redirect('/');
    });
});

/**
 * Logout route
 */
app.get('/logout', function (req, res) {
    req.session.loggedIn = null;
    res.redirect('/');
});
