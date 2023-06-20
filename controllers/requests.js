/* 
---------------------------------------------------------------------------------------
NOTE: Remember that all routes on this page are prefixed with `localhost:3000/reviews`
---------------------------------------------------------------------------------------
*/


/* Require modules
--------------------------------------------------------------- */
const express = require('express')
// Router allows us to handle routing outisde of server.js
const router = express.Router()
const config = require('../jwt.config.js')
const jwt = require('jwt-simple');
const { createRequest, deleteRequest } = require('../models/request.js');

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

/* Require the db connection, and models
--------------------------------------------------------------- */
const db = require('../models')
const ensureLoggedIn = require('../config/ensureLoggedIn');




/* Routes
--------------------------------------------------------------- */



// Show Route: GET localhost:3000/requests/:requestId
router.get('/:userId',  (req, res) => {
    db.User.findById(req.params.userId)
        .then(user => {
            const sortedRequests = user.requests.sort((a, b) => new Date(a.date) - new Date(b.date));
            const sortedUser = { ...user.toObject(), requests: sortedRequests };
            res.json(sortedUser);
        })
        .catch(err => console.log(err));
});



// Create Route: POST localhost:3000/requests/
router.post('/create', authMiddleWare, (req, res) => {
    
    const requestId = getRequestId(req.body)
    console.log(requestId);
    createRequest(req.body, req.user.id)
        .then(result => res.json(result))
        .catch(err => console.log(err))
        
});

// Destroy Route: DELETE localhost:3000/requests/:id
router.delete('/:id', authMiddleWare, (req, res) => {
    deleteRequest(req.params.id)
        .then(item =>
            res.json(item)
        )
});


/* Export these routes so that they are accessible in `server.js`
--------------------------------------------------------------- */
module.exports = router