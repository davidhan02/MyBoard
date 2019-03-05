const passport = require('passport');
const bcrypt = require('bcrypt');
const saltRounds = parseInt(process.env.SALT_ROUNDS);

// DB collection
const list = 'MyBoardUsers';

module.exports = function(app, db) {

  app.route('/login')
    .post( (req, res, next) => {
      // Apply authentication middleware
      passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        // Upon failure, redirect back to index
        if (!user) {
          // Sent as alert by jQuery
          return res.send('Invalid Username or Password. Please Try again.');
        }
        // Upon success, redirect to general page
        req.logIn(user, function(err) {
          if (err) {
            return next(err);
          }
          // Prevented by jQuery script
          return res.send('Success');
        });
      })(req, res, next);
  });

  // Define route for registering new user
  app.route('/register')
    .post((req, res, next) => {
        db.collection(list).findOne({
          username: req.body.username
        }, function(err, user) {
          if (err) {
            next(err);
          } else if (user) { // if user exists already, redirect to homepage
            res.send('User already exists. Please try a different username.');
          } else {
            // Asynchronous hashing instead of Sync call
            bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
              db.collection(list).insertOne( // insertOne adds object to db
                {
                  username: req.body.username,
                  password: hash
                }, // asssigns hash to password
                (err, doc) => {
                  if (err) {
                    res.send('Error in adding user to database.');
                  } else {
                    next(null, user);
                  }
                }
              )
            })
          }
        })
      },
      // Log in here then send success so jQuery can handle
      passport.authenticate('local', {
        failureRedirect: '/'
      }),
      (req, res, next) => {
        res.send('Success');
      });

  // Upon logout, unauthenticate the user and redirect to the home page
  app.route('/logout')
    .get((req, res) => {
      req.logout();
      res.redirect('/');
    });
}
