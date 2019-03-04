const passport = require('passport');
const bcrypt = require('bcrypt');

module.exports = function(app, db) {

  // Log-in route
  app.route('/login')
    // Apply authentication middleware and upon failure, redirect back to index
    .post(passport.authenticate('local', {
      failureRedirect: '/test'
    }), (req, res) => {
      // Redirect the user to /profile
      res.redirect('/general');
    });

  // Define route for registering new user
  app.route('/register')
    .post((req, res, next) => {
        db.collection('users').findOne({
          username: req.body.username
        }, function(err, user) {
          if (err) {
            next(err);
          } else if (user) { // if user exists already, redirect to homepage
            res.redirect('/');
          } else {
            let hash = bcrypt.hashSync(req.body.password, 12); // encrypts the password with bcrypt
            db.collection('users').insertOne( // insertOne adds object to db
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
          }
        })
      },
      passport.authenticate('local', {
        failureRedirect: '/'
      }),
      (req, res, next) => {
        res.redirect('/general');
      });

  // Upon logout, unauthenticate the user and redirect to the home page
  app.route('/logout')
    .get((req, res) => {
      req.logout();
      res.redirect('/');
    });
}
