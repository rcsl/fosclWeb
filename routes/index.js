var express = require('express');
var router = express.Router();
var config = require('../config.js');
const assert = require('assert');

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
// downloads/shortstory-entryform.pdf

router.get('/download', function(req, res){
  res.render('download', { title: 'Friends of Sonning Common Library - Downloads' });
}); 

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
        file = 'foscl-GiftAidDeclaration.pdf';
        break;
    case 'renewal' :
        file ='foscl-membership-renewal.pdf';
        break;
    case 'foscl-newsletter-1706':
      file = 'foscl-newsletter-1706.pdf';
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
    var opts =  getOptions();
    res.render('contact', { title: 'Friends of Sonning Common Library - Contact Us', reasons: opts });
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
    req.checkBody('reason', "A reason is required").notEmpty().isValidId(config.contactUs);
    req.checkBody('email', "Email is not in a recognised format (eg. someone@example.com)").isEmail();
    req.checkBody('message', 'Please add a message or question').notEmpty();

    
    var errors = req.validationErrors();
    
    var opts = getOptions();
    var reasonIdx = parseInt(req.body.reason,10);  //this value should have been validated!!
    var selectedReason = getMyContactReason(reasonIdx); // this may be invalid so need to set error!
    var contact = (
        { name : req.body.name,
          email : req.body.email,
          reasonVal : reasonIdx,
          reason : selectedReason.reason,
          subject : req.body.subject,
          message : req.body.message
         }
    );

    if(errors){     // Render the form using error information
        res.render('contact', { title: 'Friends of Sonning Common Library - Contact Us', reasons :opts, contact : contact, errors : errors });
        return;
    } 
    // process email then render page replacing form with a 'thank you message'

    transport = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: config.gapi.user,
        serviceClient: config.gapi.serviceClient,
        privateKey: config.gapi.privateKey
        }
    });
    // sender is our email
    // from is the email of person who submitted message
    // to is obtained from config.contactUs 
    

    var messageText = 'The following message has been received from the web-site:-\n\n';
    messageText += 'Visitor : ' + req.body.name + ' <' + req.body.email + '>\n';
    messageText += 'Nature of Enquiry : ' + selectedReason.reason + '\n\nMessage Content\n---------------\n\n';
    messageText += req.body.message;
   
    var messageHTML = "<p>The following enquiry has been received from the Friends of Sonning Common Library web-site:-";
    messageHTML += '<p><p><b>Visitor : </b> ' + req.body.name + ' &lt' + req.body.email + '&gt' + '<h2>Message Content';
    messageHTML += '<p><b>Nature of Enquiry : </b>' + selectedReason.reason;
    messageHTML += '<h2>Message Content</h2><p>';
    messageHTML +=req.body.message;
    mailOpts = {
        from : req.body.name + ' &lt;' + req.body.email + '&gt;',
        sender: config.gapi.user,
        to : selectedReason.email,
        replyTo : req.body.name + ' &lt;' + req.body.email + '&gt;',
        subject : 'FoSCL Website Contact :' + req.body.subject ,
        text : messageText,
        html : messageHTML
    };

    transport.sendMail(mailOpts, function(err,response) {
      if(err){ 
        // we have had a problem - report it - maybe they should try again later
        res.render('contact', { title: 'Friends of Sonning Common Library - Contact Us', reasons: opts, msg: 'Error occured, message not sent. Perhaps try again later.', err: true, contact: contact })
      }
      else {
        // we just need to tell client we are done
        res.render('contact', { title: 'Friends of Sonning Common Library - Contact Us', reasons: opts, msg: 'Your message has been sent! Thank you.', err: false, contact: contact })
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

// helper functions

// get options from config.contactUs
function getOptions(){
  var opts =[];
  for(i=0; i< config.contactUs.length; i++){ 
    var item ={};
    item.val=config.contactUs[i].id;
    item.text = config.contactUs[i].reason;
    opts.push(item);
  }
  if(opts.length===0){
    var item ={"val": 0 , "text": "General Enquiry" };
    opts.push(item);
  }
  return opts;
}
function getMyContactReason(index){
  var option = {'id': -1, 'email' : config.default.email , 'reason' : 'Unknown' }; //empty option will be return a default option
  for(var i=0; i< config.contactUs.length; i++){
    if(config.contactUs[i].id ==index){
        option.id =index;
        option.email = config.contactUs[i].email;
        option.reason = config.contactUs[i].reason;
        break;
      }
  }
  return option;
}

module.exports = router;
