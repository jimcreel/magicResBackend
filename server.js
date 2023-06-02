//require models.

require('dotenv').config()
const path = require('path');
const express = require('express');
const session = require('express-session');
const ensureLoggedIn = require('./config/ensureLoggedIn');
const cors = require('cors');
const db = require('./models');
const requestsCtrl = require('./controllers/requests')
const usersCtrl = require('./controllers/users')
const { createProxyMiddleware } = require('http-proxy-middleware');
const { default: axios } = require('axios');
const app = express();
const jwt = require('jwt-simple');

// Require the auth middleware

app.use(cors())
// refresh the browser when nodemon restarts
app.use('/api', (req, res, next) => {
  
  req.url = req.url.replace(/^\/api/, '');

  
  next();
});



// Define a route handler for requests with the "/api" prefix



app.listen(PORT, () => {
  console.log('Server listening on port 3000');
});




/* Middleware (app.use)
--------------------------------------------------------------- */

app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(session({
    secret: process.env.GOOGLE_CLIENT_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Add this middleware BELOW passport middleware

  

app.use('/api/requests', require('./controllers/requests'))
app.use('/api/users', require('./controllers/users'))








/* Mount routes/
--------------------------------------------------------------- */
app.get('/api/availability/:resort/:pass', async (req, res) => {
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
  









app.get('/error', (req, res) => res.send("error logging in"));


app.get('/', function (req, res) {
    
    res.render('index', {user: req.user});
})

app.get('/home/:resort', function (req, res) {
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






