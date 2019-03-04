const session       = require('express-session');
const passport      = require('passport');
const ObjectID      = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local');
const bcrypt        = require('bcrypt');

module.exports = function (app, db) {

  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  }));

  //tell app to use passport.initalize and passport.session
  app.use(passport.initialize());
  app.use(passport.session());

  //serialize user here
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  //access database and deserialize a user here
  passport.deserializeUser((id, done) => {
      db.collection('users').findOne(
          {_id: new ObjectID(id)},
          (err, doc) => {
              done(null, doc);
          }
      );
  });

  //authentication strategy here
  //tell passport to use an instantiated passport-local object with a few settings defined
  passport.use(new LocalStrategy(function(username, password, done) {
      //tries to find a user in our database with the username entered
      db.collection('users').findOne({ username: username }, function (err, user) {
        console.log('User '+ username +' attempted to log in.');
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        // this was: if (password !== user.password) { return done(null, false); }
        // changed to use bcrypt compareSync for hash passwords, so passwords remain secure
        if (!bcrypt.compareSync(password, user.password)) { return done(null, false); }
        return done(null, user);
        // the users object is returned and they are authenticated
      });
    }
  ));

}
