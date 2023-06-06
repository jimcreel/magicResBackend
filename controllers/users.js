/* 
---------------------------------------------------------------------------------------
NOTE: Remember that all routes on this page are prefixed with `localhost:3000/users`
---------------------------------------------------------------------------------------
*/


/* Require modules
--------------------------------------------------------------- */
const bcrypt = require('bcrypt')
const express = require('express')
// Router allows us to handle routing outisde of server.js
const router = express.Router()
const config = require('../jwt.config.js')
const jwt = require('jwt-simple');
const sendEmail = require('../helpers/email.js')


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
    bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err
        bcrypt.hash(req.body.password, salt, (err, hash) => {
            if (err) throw err
            req.body.password = hash
            db.User.create(req.body)
                .then(user => {
                    const token = jwt.encode({ id: user.id }, config.jwtSecret)
                    res.json({ token: token })
                })
                .catch(() => {
                    res.json(({ data: 'Could not create a new user, try again' }))
                })
        })
    })
})
    

router.post('/login', async (req, res) => {
    // attempt to find the user by their email in the database
    const foundUser = await db.User.findOne({ email: req.body.email })
    bcrypt.compare (req.body.password, foundUser.password, (err, isMatch) => {
        if (err) throw err
        if (isMatch) {
            const payload = { id: foundUser.id }
            const token = jwt.encode(payload, config.jwtSecret)
            res.json({
                token: token,
                email: foundUser.email
            })
        } else {
            res.json({ data: 'Incorrect email/password' })
        }
    })

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

router.put('/change-password/:hash', function (req, res) {
    const hashUrl = req.params.hash; // Access the `hash` parameter
    bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err
        bcrypt.hash(req.body.newPassword, salt, (err, hash) => {
            if (err) throw err
            req.body.newPassword = hash
            db.User.findOneAndUpdate({ passReset: hashUrl }, { password: req.body.newPassword }, 
                {passReset: ''})
                .then(user => {
                    const token = jwt.encode({ id: user.id }, config.jwtSecret)
                    res.json({ token: token })
                })
                .catch(err => {
                    console.log(err)
                    res.json({ data: 'Could not update the user' })
                })
        })
    })
})



router.put('/change-password', authMiddleWare, function (req, res) {
    // check req.user.oldPassword against the db
    
    db.User.findById(req.user.id)
        .then(user => {
            bcrypt.compare(req.body.oldPassword, user.password, (err, isMatch) => {
                console.log(isMatch? 'match' : 'no match')
                if (err) throw err
                if (isMatch) {
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) throw err
                        bcrypt.hash(req.body.newPassword, salt, (err, hash) => {
                            if (err) throw err
                            req.body.newPassword = hash
                            db.User.findByIdAndUpdate(
                                req.user.id,
                                { password: req.body.newPassword },
                                { new: true })
                                .then(user => {
                                    const token = jwt.encode({ id: user.id }, config.jwtSecret)
                                    res.json({ token: token })
                                })
                                .catch(function (err) {
                                })
                        })
                    })
                } else {
                    res.json({ data: 'Incorrect password' })
                }
            })
        })
    }
)



router.put('/password-reset/:hash'), (req, res) => {
    db.User.find({passReset: hash})
    .then(user => {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.newPassword, salt, (err, hash) => {
                if (err) throw err
                req.body.newPassword = hash
                db.User.findByIdAndUpdate(
                    user._id,
                    { password: req.body.newPassword },
                    { new: true })
                    .then(updatedUser => {
                        const token = jwt.encode({ id: updatedUser.id }, config.jwtSecret)
                        res.json({ token: token })
                    })
                    .catch(function (err) {
                    })
            })
    })
    })
    .catch((err) =>{
        res.json(err)
    })
}



            
router.post('/forgot-password', (req, res) => {
    console.log(req.body.email);
    db.User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            } else {

            let random = '';
            const characters =
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLength = characters.length;
            for (let i = 0; i < 25; i++) {
                random += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            console.log(random)
            db.User.findByIdAndUpdate(
                user._id,
                { passReset: random },
                { new: true }
            )
                .then(updatedUser => {
                    const request = {
                        type: 'forgot-password',
                        to: updatedUser.email,
                        url: `https//localhost:3000/users/password-reset/${random}`
                    }
                    sendEmail(request)
                    const token = jwt.encode({ passReset: random }, config.jwtSecret);
                    res.json({ token: token });
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ error: 'Internal Server Error' });
                });
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    })
});







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