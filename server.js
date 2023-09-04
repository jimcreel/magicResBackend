//require models.

require('dotenv').config()


const express = require('express');
const session = require('express-session');

const cors = require('cors');
const db = require('./models');
const requestsCtrl = require('./controllers/requests')
const usersCtrl = require('./controllers/users')
const { createProxyMiddleware } = require('http-proxy-middleware');
const { default: axios } = require('axios');
const app = express();
const jwt = require('jwt-simple');
const { OAuth2Client } = require('google-auth-library');
const { sendNotifications, getAvailability } = require('./helpers/notifications.js')

// const sendNotifications = require('./helpers/notifications').sendNotifications;



// Require the auth middleware

app.use(cors({
  origin: '*',
  methods: 'GET, POST, PUT, DELETE',
  allowedHeaders: 'Content-Type, Authorization'
}));

// refresh the browser when nodemon restarts
app.use('/api', (req, res, next) => {
  
  req.url = req.url.replace(/^\/api/, '');

  
  next();
});



// Define a route handler for requests with the "/api" prefix


const PORT = process.env.PORT
let availabilities = {}
app.listen(PORT, async () => {
  console.log('Server listening on port 3000');
  // call sendNotifications on a 10 minute timer
  availabilities = await getAvailability()
  setInterval(async () => {
    availabilities = await getAvailability()
    sendNotifications(availabilities)
  }
  , 600000);
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
  console.log('availability route hit')
  
  let resort = req.params.resort;
    
  let pass = req.params.pass
  if (!availabilities[resort]) {
    availabilities[resort] = await getAvailability(resort)
  }
  let cacheAvail = availabilities[resort].filter (avail => avail.passType === pass)
  res.json(cacheAvail)
});
  
















