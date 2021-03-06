const ObjectId = require('mongodb').ObjectID;
const saltRounds = parseInt(process.env.SALT_ROUNDS);
const bcrypt = require('bcrypt');

module.exports = function(app, db) {

  //Threads Route Handling
  app.route('/api/threads/:board')

    // Get thread list
    .get((req, res) => {
      // Assign board from url to var
      let board = req.params.board;

      // Search database for all posts
      db.collection(board)
        .find({}, {
          projection: {
            reported: 0,
            delete_password: 0,
            'replies.delete_password': 0,
            'replies.reported': 0,
          }
        })
        // Reverse sort by Date
        .sort({ bumped_on: -1 })
        // Limit to 10 threads
        .limit(10)
        .toArray((err, array) => {
          if (err) res.send(err);
          array.forEach((item) => {
            // Set replycount property
            item.replycount = item.replies.length;
            // Limit replies length to 3
            if (item.replies.length > 3) {
              item.replies = item.replies.splice(-3);
            }
          });
          res.json(array);
        });
    })

    // Post new thread
    .post((req, res) => {
      let board = req.params.board;
      //Template for new object
      let thread = {
        text: req.body.text,
        created_on: new Date(),
        bumped_on: new Date(),
        reported: false,
        replies: [], // Use bcrypt below to hash the password
        delete_password: bcrypt.hashSync(req.body.delete_password, saltRounds)
      };
      //Insert acts same as saving to db
      db.collection(board).insertOne(thread, (err, result) => {
        if (err) res.send(err);
        //Redirect after insertion
        res.redirect('/b/' + board);
      });
    })

    //Report a thread
    .put( (req, res) => {
      let board = req.params.board,
          id = new ObjectId(req.body.report_id);

      db.collection(board).findOneAndUpdate(
         {_id: id},
         {$set: {reported: true}},
         (err, result) => {
           if (err) {
             res.send(err);
           } else {
             res.send('Successfully Reported!');
           }
         });
    })

    //Delete a thread
    .delete( (req, res) => {
      let board = req.params.board,
          id = new ObjectId(req.body.thread_id),
          inputPassword = req.body.delete_password;

      // Search through DB use bcrypt to compare passwords
      db.collection(board).findOne(
        {_id: id},
        (err, post) => {
          // Use of Asynchronous bcyrpt comparison
          bcrypt.compare(inputPassword, post.delete_password, (err, result) => {
              if (result === true) {
                db.collection(board).findOneAndDelete({_id: id}, (err) => {
                  if (err) {
                    res.send(err);
                  } else {
                    res.send('Successfully Deleted!');
                  }
                })
              } else if (result === false) {
                res.send('Incorrect Password');
              }
          })
        }
      )
    });

  // Reply route handling
  app.route('/api/replies/:board')

    // Get reply for /api/replies/{board}?thread_id={thread_id}
    .get( (req, res) => {
      let board = req.params.board,
          id = new ObjectId(req.query.thread_id);
      // Use .find and .toArray in DB for result
      db.collection(board).find(
        {_id: id},
        { projection: {
          reported: 0,
          delete_password: 0,
          'replies.delete_password': 0,
          'replies.reported': 0,
        }})
        .toArray( (err, result) => {
          if (err) {
            res.send(err);
          } else {
            res.json(result);
          }
        });
    })

    // Post a reply
    .post( (req, res) => {
      let board = req.params.board;
      let id = new ObjectId(req.body.thread_id);
      // Format for new reply to thread object in DB
      let reply = {
        _id: new ObjectId(),
        text: req.body.text,
        created_on: new Date(),
        reported: false, // Use bcrypt below to hash the password
        delete_password: bcrypt.hashSync(req.body.delete_password, saltRounds)
      };

      // Adding replies to array in thread object in DB
      db.collection(board).findOneAndUpdate(
        {_id: id},
        {
          $set: {bumped_on: new Date()},
          $push: {replies: reply}
        },
        (err, result) => {
          if (err) {
            res.send(err);
          } else {
            // Redirect to thread page to see replies (jQuery stops this default)
            res.redirect('/b/' + board + '/' + req.body.thread_id);
          }
        });
    })

    // Report a reply
    .put( (req, res) => {
      let board = req.params.board,
          id = new ObjectId(req.body.thread_id),
          rep_id = new ObjectId(req.body.reply_id);

      // Connect to DB, $set replies.$.reported to true
      db.collection(board).findOneAndUpdate(
        {
          _id: id,
          'replies._id': rep_id
        },
        {$set: {'replies.$.reported': true}},
        (err, result) => {
          if (err) {
            res.send(err);
          } else {
            res.send('Successfully Reported!');
          }
        });
    })

    // Delete a reply
    .delete( (req, res) => {
      let board = req.params.board,
          inputPassword = req.body.delete_password,
          id = new ObjectId(req.body.thread_id),
          rep_id = new ObjectId(req.body.reply_id);

      // Search through DB use bcrypt to compare passwords
      db.collection(board).findOne(
        {
          _id: id,
          replies: {$elemMatch: {_id: rep_id}}
        },
        (err, post) => {
          // Use of Asynchronous bcyrpt comparison
          bcrypt.compare(inputPassword, post.replies[0].delete_password, (err, result) => {
              if (result === true) {
                db.collection(board).findOneAndUpdate(
                  {
                    _id: id,
                    replies: {$elemMatch: {_id: rep_id}}
                  },
                  {$set: {'replies.$.text': '[deleted]'}},
                  (err, result) => {
                    if (err) {
                      res.send(err);
                    } else {
                      res.send('Successfully Deleted!');
                    }
                  });
              } else if (result === false) {
                res.send('Incorrect Password');
              }
          })
        }
      )
    });

}
