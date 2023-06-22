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
const { OAuth2Client } = require('google-auth-library');
const {createUser, getUser, getUserById, getUserRequests, editUser, getUserByHash, removeUserHash} = require('../models/user.js')



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
    console.log(req.body)
    bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err
        bcrypt.hash(req.body.password, salt, (err, hash) => {
            if (err) throw err
            req.body.password = hash
            
            createUser(req.body)
                .then(user => {
                    console.log(user)
                    const token = jwt.encode({ id: user }, config.jwtSecret)
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
    
    const userData = await getUser(req.body.email)

    let foundUser = userData.rows[0]
    console.log(foundUser)
    if (foundUser) {
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
    } else {
        res.json({ data: 'Incorrect email/password' })
    }
})

router.post('/google' , async (req, res) => {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    console.log(req.body)
    client.verifyIdToken({ idToken: tokenId, audience: process.env.GOOGLE_CLIENT_ID })
        .then(response => {
            const { email_verified, name, email } = response.payload;   
            if (email_verified) {
                getUser({email}).exec((err, user) => {
                    if (err) {
                        return res.status(400).json({
                            error: 'Something went wrong...'
                        })
                    } else {
                        if (user) {
                            const token = jwt.encode({ id: user.id }, config.jwtSecret)
                            res.json({ token: token })
                        } else {
                            let password = email + process.env.GOOGLE_CLIENT_SECRET
                            bcrypt.genSalt(10, (err, salt) => {
                                if (err) throw err
                                bcrypt.hash(password, salt, (err, hash) => {
                                    if (err) throw err
                                    password = hash
                                })
                            })
                            let newUser = createUser({name, email, password}).then(data => {
                                const token = jwt.encode({ id: data.id }, config.jwtSecret)
                                res.json({ token: token })
                            })
                        }
                    }
                })
            }
        })
})



// Show Route: shows the user details and link to edit/delete
router.get('/profile', authMiddleWare,  (req, res) => {
   
	getUserById(req.user.id)
    .then(user => {
        getUserRequests(req.user.id)
        .then(requests => {
            res.json({user: user.rows[0], requests: requests.rows})
        })
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
            const user = getUserByHash(hashUrl)
            .then (user => {
                let payload = { newPassword: req.body.newPassword, passReset: ''}
                editUser(payload, user.rows[0].id)
                    .then(newUser => {
                        console.log(newUser.rows[0].id)
                        const token = jwt.encode({ id: newUser.rows[0].id }, config.jwtSecret)
                        console.log(token)
                        res.json({ token: token })
                    })
                    .catch(err => {
                        console.log(err)
                        res.json({ data: 'Could not update the user' })
                    })
                removeUserHash(user.rows[0].id)
            })
    })
})
})



router.put('/change-password', authMiddleWare, function (req, res) {
    // check req.user.oldPassword against the db
    getUserById(req.user.id)
        .then(user => {
            bcrypt.compare(req.body.oldPassword, user.rows[0].password, (err, isMatch) => {
                if (err) throw err
                if (isMatch) {
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) throw err
                        bcrypt.hash(req.body.newPassword, salt, (err, hash) => {
                            if (err) throw err
                            req.body.newPassword = hash
                            editUser(user.id, { password: req.body.newPassword })
                                .then(newUser => {
                                    
                                    const token = jwt.encode({ id: newUser.rows[0].id }, config.jwtSecret)
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
    getUserByHash(req.params.hash)
    .then(user => {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.newPassword, salt, (err, hash) => {
                if (err) throw err
                req.body.newPassword = hash
                editUser(req.body)
                    .then(updatedUser => {
                        const token = jwt.encode({ id: updatedUser.id }, config.jwtSecret)
                        res.json({ token: token })
                        removeUserHash(user.id)
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
    getUser(req.body.email)
        .then(user => {
            console.log(user)
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
            // console.log(random)
            let payload = { passReset: random}
            editUser(payload, user.rows[0].id)
                .then(updatedUser => {
                    const request = {
                        type: 'forgot-password',
                        to: req.body.email,
                        url: `https://www.magic-reservations.com/change-password/${random}`
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
    
    editUser(
        req.body, req.user.id
    )
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