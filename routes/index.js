var express = require('express');
var router = express.Router();
var config = require('../config.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Friends of Sonning Common Library' });
});

router.get('/shortstory', function(req,res, next){
    res.render('shortstory', { title: 'Friends of Sonning Common Library' });
});
router.get('/short-story-rules', function(req,res, next){
    res.render('short-story-rules', { title: 'Friends of Sonning Common Library' });
});
// /downloads/shortstory-entryform.pdf
router.get('/download/:file', function(req, res){
  var file;
  var path = "public/downloads/";
  var requested = req.params['file'];
  switch(requested){
    case 'constitution': 
        file = 'foscl-constitution.pdf';
        break;
    case 'entryform':
        file = 'shortstory-entryform.pdf';
        break;
    case 'membership':
        file = 'foscl-membership-form.pdf';
        break;
    case 'agm' :
        file = 'foscl-agm-2016.pdf';
        break;
    case 'bylaws':
        file = 'foscl-bylaws.pdf';
        break;
    case 'gift-aid' :
        file = 'gift-aid-form.pdf';
        break;
    default: 
        file="";
  }
  if(file.length>4){
      //valid file
      res.download(path + file, function(err){
            // file not found
      });
    }
  // if we get here NO FILE
  
});
router.get('/entryform', function(req, res){
  var file = 'public/downloads/shortstory-entryform.pdf';
  res.download(file, function(err){
       if (err) {
            // Handle error, but keep in mind the response may be partially-sent
            res.headersSent;
       }
    }); // redirect to calling page with message
});
router.get('/events', function(req,res, next){
    //todo we fill options from our database
    res.render('events', { title: 'Friends of Sonning Common Library - Events' });
});
router.get('/about', function(req,res, next){
    //todo we fill options from our database
    res.render('about', { title: 'Friends of Sonning Common Library - About Us' });
});
router.get('/contact', function(req,res, next){
    //todo we fill options from our database
    res.render('contact', { title: 'Friends of Sonning Common Library - Contact Us' });
});
router.post('/contact', function(req,res){
    var mailOpts, transport;

    const nodemailer = require('nodemailer');
    /* todo we will route our email based on nature of enquiry
     eg membership, competition, events, other question
````*/


    req.sanitize('name').escape().trim();
    req.sanitize('email').escape().trim();
    req.sanitize('subject').escape().trim();


    req.checkBody('name', "Name is required").notEmpty();
    req.checkBody('email', "Email is required").notEmpty();
    req.checkBody('email', "Email is not in a recognised format (eg. someone@example.com)").isEmail();
    req.checkBody('message', 'Please add a message or question').notEmpty();

    var errors = req.validationErrors();
    var contact = (
        { name : req.body.name,
          email : req.body.email,
          subject : req.body.subject,
          message : req.body.message
         }
    );
    if(errors){     // Render the form using error information
        res.render('contact', { title: 'Friends of Sonning Common Library - Contact Us', contact : contact, errors : errors });
        return;
    } 
    // process email then render page replacing form with a 'thank you message'

    transport = nodemailer.createTransport({
        service : 'Gmail',
        auth: {
          user : config.smtp.user,
          pass : config.smtp.password
        }
    });
    // sender is our email
    // from is the email of person who submitted message
    var message = "The following message has been received from the web-site:-\n\n";
    message += 'Visitor : ' + req.body.name + ' <' + req.body.email + '>\n\nMessage Content\n---------------\n\n';
    message +=req.body.message;
    mailOpts = {
        from : req.body.name + ' &lt;' + req.body.email + '&gt;',
        sender: config.smtp.user,
        to : config.email,
        replyTo : req.body.email,
        subject : 'FoSCL Website Contact :' + req.body.subject ,
        text : message
    };

    transport.sendMail(mailOpts, function(err,response){
      if(err){ 
        // we have had a problem - report it - maybe they should try again later
        res.render('contact', { title: 'Friends of Sonning Common Library - Contact Us', msg: 'Error occured, message not sent. Perhaps try again later.', err: true, contact: contact })
      }
      else {
          // we just need to tell client we are done
        res.render('contact', { title: 'Friends of Sonning Common Library - Contact Us', msg: 'Message sent ! Thank you.', err: false, contact: contact })
      }
    
    });

});

router.get('/join', function(req,res, next){
    res.render('join', { title: 'Friends of Sonning Common Library' });
});
router.get('/swatch', function(req,res, next){
    res.render('bootswatch', { title: 'Friends of Sonning Common Library' });
});
router.get('/register', function(req,res, next){
    res.render('register', { title: 'Friends of Sonning Common Library - Register' });
});

module.exports = router;
