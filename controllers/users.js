/* 
---------------------------------------------------------------------------------------
NOTE: Remember that all routes on this page are prefixed with `localhost:3000/users`
---------------------------------------------------------------------------------------
*/


/* Require modules
--------------------------------------------------------------- */
const express = require('express')
// Router allows us to handle routing outisde of server.js
const router = express.Router()
const config = require('../jwt.config.js')
const jwt = require('jwt-simple');



/* Require the db connection, and models
--------------------------------------------------------------- */
const db = require('../models')

// Require the auth middleware
const authMiddleWare = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
      try {
        const decodedToken = jwt.decode(token, config.jwtSecret);
        req.user = decodedToken;
        
        next();
      } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
      }
    } else {
      res.status(401).json({ message: 'No token supplied' });
    }
  };

/* Routes
--------------------------------------------------------------- */
// LOG IN (log into a user account)

router.post('/signup', (req, res) => {
    // Create a new user
    db.User.create(req.body)
        .then(user => {
            // if the database creates a user successfully, assign a JWT to the user and send the JWT as the response
            const token = jwt.encode({ id: user.id }, config.jwtSecret)
            res.json({ token: token })
        })
        // send an error if the database fails to create a user
        .catch(() => {
            res.json(({ data: 'Could not create a new user, try again' }))
        })
})

router.post('/login', async (req, res) => {
    // attempt to find the user by their email in the database
    const foundUser = await db.User.findOne({ email: req.body.email })
    // check to:
    // 1. make sure the user was found in the database
    // 2. make sure the user entered in the correct password
    if (foundUser && foundUser.password === req.body.password) {
        // if the above applies, send the JWT to the browser
        const payload = { id: foundUser.id }
        const token = jwt.encode(payload, config.jwtSecret)
        res.json({
            token: token,
            email: foundUser.email
        })
        // if the user was not found in the database OR their password was incorrect, send an error
    } else {
        res.sendStatus(401)
    }
})


// Show Route: shows the user details and link to edit/delete
router.get('/profile', authMiddleWare,  (req, res) => {
   
	db.User.findById(req.user.id)
    .then(user => {
        
        res.json(user)
    })
        });


// UPDATE Route: updates the user details
// 
router.put('/', authMiddleWare, function (req, res) {
    db.User.findByIdAndUpdate(
        req.user.id,
        req.body,
        {new: true})
        .then(user => {
            res.json(user)
        })
        .catch(function(err){
        })
});



// Destroy Route: DELETE localhost:3000/reviews/:id
router.delete('/:id',   (req, res) => {
    db.User.findByIdAndDelete(req.params.id)
        .then(() => {
            res.redirect('/')
        })
        .catch(function(err){
        })
});



/* Export these routes so that they are accessible in `server.js`
--------------------------------------------------------------- */
module.exports = router