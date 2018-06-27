'use strict';
const express = require('express'),
    app = express(),
    async = require('async'),
    logger = require('tracer').colorConsole(),
    _ = require('lodash'),
    mysql = require('mysql'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    cors = require('cors'),
    config = require('./config/config.js'),
    jwt = require('jsonwebtoken'),
    fs = require('file-system'),
    morgan = require('morgan');
    var controller /*= require('./controllers/controller.js')*/,
    login,
    _initialEtherAmount = "0.011",
    etherValueInWei = 1000000000000000000,

    chai = require('chai'),
    chaiHttp = require('chai-http'),
    assert = require('assert'),

    db_connection = require('./config/dbconnection.js');
// app.listen(config.port);
app.use(express.static('../dist'));
var server = app.listen(config.port);
console.log(`server running on port number ${config.port}`);
var io = require('socket.io')(server);
app.use(cors());   
var expressValidator = require('express-validator');
app.use(expressValidator())
// app.use(cors({credentials: true, origin: 'http://localhost:7777'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('common', {stream: fs.createWriteStream('./access.log', {flags: 'a'})}))
app.use(morgan('dev'));

let should = chai.should();
chai.use(chaiHttp);

// it('Main page content', function(done) {
//   // request('http://localhost:8080' , function(error, response, body) {
//   //     expect(body).to.equal('Hello World');
//   //     done();
//   // });
// });

const Mocha = require('Mocha');
const mocha = new Mocha();
// const assert = require('chai').assert;

//do normal Node.js things

// mocha.run(() => {
//      describe('an amazing suite of tests', () => {
//          it('should be true', () => {
//              assert.equal(true, true);
//          });
//      });
// });
var send_user_status = function(data){
  io.emit('users-status', data);
}

var send_data = function(data){
  console.log(data);
io.emit('new-message', data);
}



// io.emit('connection', io);

module.exports = {
  send_data: send_data,
  send_user_status: send_user_status 
}

login = require('./controllers/login.js');
controller = require('./controllers/controller.js');

app.use('/login',login);

io.on('connection', function(socket) {
    console.log('connected');
    socket.on('clientEvent', function(data) {
       console.log(data);
    });
    app.use('/get', controller);
    
});

app.use('/get', controller);
const passportGoogle = require('passport-google-oauth');

const passportConfig = {
  clientID: '598902743876-go1guulac1hqa7tea5dqor44bt6fre1d.apps.googleusercontent.com',
  clientSecret: /*'E-0jCmg6JtsUonUJ9FfLcZBj'*/ 'adddd',
  callbackURL: 'http://localhost:7777/chat'
};

if (passportConfig.clientID) {
  passport.use(new passportGoogle.OAuth2Strategy(passportConfig, function (request, accessToken, refreshToken, profile, done) {
      console.log('-----------------------------------------------------------------------------------------------------------');
      console.log(profile);
      console.log('-----------------------------------------------------------------------------------------------------------');
  }));
}
const LocalStrategy = require('passport-local').Strategy;
app.get('/api/authentication/google/start',
passport.authenticate('google', { session: false, scope: ['openid', 'profile', 'email'] }));
app.get('/api/authentication/google/redirect',
passport.authenticate('google', { session: false }),
generateUserToken);

function generateUserToken(req, res) {
    console.log('i am calling');
    const accessToken = token.generateAccessToken(req.user.id);
    res.render('authenticate.html/', {
      token: accessToken
    });
}



var expressSession = require('express-session');
app.use(expressSession({secret: 'E-0jCmg6JtsUonUJ9FfLcZBj'}));
app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function(user, done) {
    done(null, user._id);
});
   
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use('signupqqqq', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) {
    findOrCreateUser = function(){
      // find a user in Mongo with provided username
      User.findOne({'username':username},function(err, user) {
        // In case of any error return
        
          var newUser = new User();
          // set the user's local credentials
          newUser.username = username;
          newUser.password = createHash(password);
          newUser.email = req.param('email');
          newUser.firstName = req.param('firstName');
          newUser.lastName = req.param('lastName');
          console.log(newUser);
        })
    };
    process.nextTick(findOrCreateUser);
  })
);



var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: '598902743876-go1guulac1hqa7tea5dqor44bt6fre1d.apps.googleusercontent.com',
    clientSecret: /*'E-0jCmg6JtsUonUJ9FfLcZBj'*/ 'adddd',
    callbackURL: 'http://localhost:7777/chat'
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.get('/auth/google',
passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback', 
passport.authenticate('google', { failureRedirect: '/login' }),
function(req, res) {
  // Successful authentication, redirect home.
  res.redirect('/');
});



app.post('/hello', (req, res)=>{
  req.checkBody('uUid', 'uUid is required').notEmpty();
  req.checkBody('sessionId', 'sessionId is required').notEmpty();
  //validation check for errors
  req.asyncValidationErrors().then(function () {
  }).catch((err)=>{
    res.json(err);
  })
})


// get and config the module
var Payments = require( "node-payments" );
// inject and reuse a existing express
var paymentConfig = { express: app, paymentStore: new Payments.RedisHashStore() }
var pymts = new Payments( paymentConfig );
 

 






/* 


key id : 'rzp_test_X4tuLIdmm2zXtU',
key secret : '5O7Ebu9nk7qO5MV9ll0cVUoY'




*/


const Razorpay = require('razorpay');

const rzp = new Razorpay({
  key_id: 'rzp_test_X4tuLIdmm2zXtU', // your `KEY_ID`
  key_secret: '5O7Ebu9nk7qO5MV9ll0cVUoY' // your `KEY_SECRET`
})






app.get('/*', function(req, res){
    // res.sendFile(__dirname+'../'+'/angular/PROJECT-NAME/dist/index.html');
    res.sendFile('index.html', { root: '../dist/'});
});



