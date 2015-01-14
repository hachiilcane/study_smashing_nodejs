/**
 * Module dependencies
 */
var express = require('express'),
mongoose = require('mongoose');

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
        User.findById(req.session.loggedIn, function (err, doc) {
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
mongoose.connect('mongodb://127.0.0.1/my-website');
app.listen(3000, function () {
  console.log('\033[96m  + \033[39m app listening on *:3000');
});

/**
 * Define model.
 */
var Schema = mongoose.Schema;
var User = mongoose.model('User', new Schema({
  first: String
  , last: String
  , email: { type: String, unique: true }
  , password: { type: String, index: true }
}));

/**
 * Signup processing route
 */
app.post('/signup', function (req, res, next) {
    var user = new User(req.body.user);
    user.save(function (err) {
	if (err) return next(err);
	res.redirect('/login/' + user.email);
    });
});

/**
 * Login process route
 */
app.post('/login', function (req, res) {
    User.findOne({ email: req.body.user.email, password: req.body.user.password }, function (err, doc) {
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
