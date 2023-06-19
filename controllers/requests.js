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


// New Route: GET localhost:3000/requests/new
router.get('/new/:userId/:date?/:resortPark?',  (req, res) => {
            res.render('./request/request-new.ejs', { 
            date: req.params.date,
            resortPark: req.params.resortPark
         })
         

});

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
    
    
    const request = {
        ...req.body,
        userId: req.user.id,
        count: 0
    }
    
    db.User.findByIdAndUpdate(
        req.user.id, // Corrected user ID syntax
        { $push: { requests: req.body } },
        { new: true }
    )
        .then(result => res.json(result))
        .catch(err => console.log(err))
        
});


router.get('/:requestId/edit', authMiddleWare, (req, res) => {
    db.User.findOne({ 'requests._id': req.params.requestId })
        .then(user => {
            const request = user.requests.id(req.params.requestId)
            res.render('./request/request-edit.ejs', {
                user: user,
                request: request
            })
        })
});


router.put('/:requestId',  (req, res) => {
    db.User.findOneAndUpdate({ 'requests._id': req.params.requestId},
    {$set: {
        'requests.$.date': req.body.date,
        'requests.$.resort': req.body.resort,
        'requests.$.pass': req.body.pass,
        'requests.$.park': req.body.park
    }
    }, {new: true})
        .then(user => 
        res.redirect(`/users/${req.user.id}`))
    });


// Destroy Route: DELETE localhost:3000/reviews/:id
router.delete('/:id', authMiddleWare, (req, res) => {
    db.User.findOneAndUpdate(
        { 'requests._id': req.params.id },
        { $pull: { requests: { _id: req.params.id } } },
        { new: true }
    )
        .then(item =>
            res.json(item)
        )
});


/* Export these routes so that they are accessible in `server.js`
--------------------------------------------------------------- */
module.exports = router