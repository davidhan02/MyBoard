const passport = require('passport');
const bcrypt = require('bcrypt');
const saltRounds = parseInt(process.env.SALT_ROUNDS);

// DB collection
const list = 'MyBoardUsers';

module.exports = function(app, db) {

  // Log-in route
  app.route('/login')
    // Apply authentication middleware and upon failure, redirect back to index
    .post(passport.authenticate('local', {
      failureRedirect: '/test'
    }), (req, res) => {
      // Redirect the user to /profile
      res.redirect('/b/general');
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
            res.redirect('/');
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
                    res.redirect('/');
                  } else {
                    next(null, user);
                  }
                }
              )
            })
          }
        })
      },
      passport.authenticate('local', {
        failureRedirect: '/'
      }),
      (req, res, next) => {
        res.redirect('/b/general');
      });

  // Upon logout, unauthenticate the user and redirect to the home page
  app.route('/logout')
    .get((req, res) => {
      req.logout();
      res.redirect('/');
    });
}
