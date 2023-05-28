//require models.

require('dotenv').config()
const path = require('path');
const express = require('express');

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const passport = require('passport');
const ensureLoggedIn = require('./config/ensureLoggedIn');
const cors = require('cors');

const db = require('./models');
require('./config/passport');
const requestsCtrl = require('./controllers/requests')
const usersCtrl = require('./controllers/users')
const { createProxyMiddleware } = require('http-proxy-middleware');
const { default: axios } = require('axios');
const app = express();
let userProfile;
// Require the auth middleware


// refresh the browser when nodemon restarts

const express = require('express');
const app = express();

// Define a route handler for requests with the "/api" prefix
app.use('/api', (req, res, next) => {
  
  req.url = req.url.replace(/^\/api/, '');

  
  next();
});


app.listen(3000, () => {
  console.log('Server listening on port 3000');
});




/* Middleware (app.use)
--------------------------------------------------------------- */
app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(session({
    secret: process.env.GOOGLE_CLIENT_SECRET,
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
// Add this middleware BELOW passport middleware

  
app.options('*', cors())
app.use('/api/requests', require('./controllers/requests'))
app.use('/api/users', require('./controllers/users'))








/* Mount routes/
--------------------------------------------------------------- */
app.get('/availability/:resort/:pass', async (req, res) => {
    let resortNameUrl = req.params.resort == 'DLR' ? 'disneyland' : 'disneyworld';
    let pass = req.params.pass
    const headers = {
      'Content-Type': 'application/json', // Specify the content type of the request
    };
    let url = `https://${resortNameUrl}.disney.go.com/passes/blockout-dates/api/get-availability/?product-types=${pass}&destinationId=DLR&numMonths=14`;
    try {
      const response = await axios.get(url, { headers });
      // Process the response and send it back to the client
      res.json(response.data);
    } catch (error) {
      // Handle any errors that occurred during the request
      res.status(500).json({ error: 'An error occurred during the request.' });
    }
  });
  
app.get('/auth/google', passport.authenticate(
    'google', 
    { scope: ['profile', 'email'], 
    prompt: 'select_account'    
    }
));


app.get ('/oauth2callback', passport.authenticate(
    'google',
    {
        successRedirect: '/success',
        failureRedirect: '/error'
    }
));

app.get('/success', (req, res) => {    
    res.render('index')
    });
    




app.get('/error', (req, res) => res.send("error logging in"));


app.get('/', function (req, res) {
    
    res.render('index', {user: req.user});
})

app.get('/home/:resort', ensureLoggedIn, function (req, res) {
    let resort = req.params.resort;
    db.api.getResorts(req, res, resort)
    .then(availabilities => {
        res.render('home', 
        {availabilities: availabilities,
        resort: resort})
    })
})



app.get('/seed', function (req, res) {
    db.User.findByIdAndUpdate(userID,
    { $push: { requests: testRequests } },
        { new: true }
    )
    .then(result => res.json(result))
    .catch(err => console.log(err))
}
)

app.get('/logout', function(req, res){
    req.logout(function() {
      res.render('index');
    });
  });


app.use('/requests', requestsCtrl)
app.use('/users', usersCtrl)



app.listen(process.env.PORT, function () {
    console.log('Express is listening to port', process.env.PORT);
});