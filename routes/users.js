

var express = require('express');
var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

//register
router.get('/register', function(req, res){
    res.render('register');
});

//login
router.get('/login', function(req, res){
    res.render('login');
});


//check admin or  user
// User.compareWin(win, function(err, win){
//     if(win==1){
//         res.redirect('admin');
//     }else{
//         res.render('login');
//     }
//  });


//contact
router.get('/contact', function(req, res){
    res.render('contact');
});

//admin
router.get('/admin', function(req, res){
    res.render('admin');
});

//register user
router.post('/register', function(req, res){
   var name = req.body.name;
   var email = req.body.email;
   var username = req.body.username;
   var password = req.body.password;
   var password2 = req.body.password2;

   //validation
   req.checkBody('name', 'Name is required').notEmpty();
   req.checkBody('email', 'Email is required').notEmpty();
   req.checkBody('email', 'email is not valid').isEmail();
   req.checkBody('username', 'username is required').notEmpty();
   req.checkBody('password', 'password is required').notEmpty();
   req.checkBody('password2', 'passwords do not match').equals(req.body.password);
    
   var errors = req.validationErrors();
   
   if(errors){
    res.render('register', {
        errors: errors
    });
   }else {
    var newUser = new User({
        name: name,
        email: email,
        username: username,
        password: password
    });

    User.createUser(newUser, function(err, user){
        if(err) throw err;
        console.log(user);
    });

    req.flash('success_msg', 'you are registered and can now login');

    res.redirect('/users/login');
   }
});

passport.use(new LocalStrategy(
    function(username, password, done) {
     User.getUserByUsername(username, function(err, user){
         if(err) throw err;

         if(!user){
             return done(null, false, {message: 'unknown user'});
         }

         User.comparePassword(password, user.password, function(err, isMatch){
             if(err) throw err;

             if(isMatch){
                 return done(null, user);
             }
             else {
                 return done(null, false, {message: 'invalid password'});
             }
         });
           
     }); 
    }));

    passport.serializeUser(function(user, done) {

        console.log(user);
        done(null, user.id);
      });
      
      passport.deserializeUser(function(id, done) {
        User.getUserById(id, function(err, user) {
          done(err, user);
        });
      });
  

       
      router.post('/login',
      passport.authenticate('local'),function(req, res) {
       // If this function gets called, authentication was successful.
       // `req.user` contains the authenticated user.

     if (req.user.win==0)
    {
         // res.redirect('/users/login' + req.user.username);
            res.render('index');
    }             else
            {
                 res.redirect('/users/admin');
            }
     });     


/*router.post('/login',
  passport.authenticate('local', {failureRedirect:'/users/login', failureFlash: true}),
  function(req, res) {

    console.log(res);
    res.redirect('/');
  });*/

router.get('/logout', function(req, res){
    req.logout();

    req.flash('success_msg', 'you are logged out');

    res.redirect('/users/login');
});


//post contact 
router.post('/contact', function(req, res){
    var email = req.body.email;
    var name = req.body.name;
    var feedback = req.body.feedback;
    
    var errors = req.validationErrors();
   
if(errors){
 res.render('contact', {
     errors: errors
 });
}else {
 var newUser = new User({
     email: email,
     name: name,
     feedback: feedback

 });

 User.createUser(newUser, function(err, user){
     if(err) throw err;
     console.log(user);
 });
 req.flash('success_msg', 'meet you soon');

 res.redirect('/users/login');
}
});


module.exports = router;