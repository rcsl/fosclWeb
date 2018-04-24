const express = require('express');
const router = express.Router();
const config = require('../config.js');
const pugCompiler = require('../modules/pugCompiler');
const downloads = require('../data/download.json');
const events = require('../data/events.json');
const assert = require('assert');
const request = require('request');


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Friends of Sonning Common Library' });
});

//simple heathcheck
router.get('/health-check', (req, res) => res.sendStatus(200));

router.get('/shortstory', function (req, res, next) {
  res.render('shortstory', { title: 'Friends of Sonning Common Library' });
});
router.get('/short-story-rules', function (req, res, next) {
  res.render('short-story-rules', { title: 'Friends of Sonning Common Library' });
});
// downloads/shortstory-entryform.pdf

router.get('/download', function (req, res) {
  //pass json content to page
  res.render('download', { downloads: downloads, title: 'Friends of Sonning Common Library - Downloads' });
});

router.get('/download/:item', function (req, res) {
  var file;
  var path = "public/downloads/";
  var reqLink = req.params['item'];
  var filename;

  downloads.some(cat => {
    cat.items.some(item => {
      if (item.link === reqLink) {
        filename = item.filename;
        return true;
      }
    });
    return (typeof filename !== 'undefined');
  });
  if (typeof filename !== 'undefined') {
    res.download(path + filename, function (err) {
      if (err)
        res.status(404).render('download404.pug', { title: 'Friends of Sonning Common Library - Downloads', link: reqLink });
    });
  }
  else {
    res.status(404).render('download404.pug', { title: 'Friends of Sonning Common Library - Downloads', link: reqLink });
  }
});
/*
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
router.get('/entryform', function (req, res) {
  var file = 'public/downloads/shortstory-entryform.pdf';
  res.download(file, function (err) {
    if (err) {
      // Handle error, but keep in mind the response may be partially-sent
      res.headersSent;
    }
  }); // redirect to calling page with message
});*/
router.get('/events', function (req, res, next) {
  //todo we fill options from our database
  res.render('events', { events: events, title: 'Friends of Sonning Common Library - Events' });
});
router.get('/about', function (req, res, next) {
  //todo we fill options from our database
  res.render('about', { title: 'Friends of Sonning Common Library - About Us' });
});
router.get('/contact', function (req, res, next) {
  //todo we fill options from our database
  var opts = getOptions();
  res.render('contact', { title: 'Friends of Sonning Common Library - Contact Us', reasons: opts, captchakey: config.captcha.sitekey });
});
router.post('/contact', function (req, res) {
  var mailOpts, transport;

  req.sanitize('name').escape().trim();
  req.sanitize('email').escape().trim();
  req.sanitize('subject').escape().trim();
  req.sanitize('message').escape().trim();


  req.checkBody('name', "Name is required").notEmpty();
  req.checkBody('email', "Your email address is required").notEmpty();
  req.checkBody('reason', "A reason is required").notEmpty().isValidId(config.contactUs.list);
  req.checkBody('email', "Email is not in a recognised format (eg. someone@example.com)").isEmail();
  req.checkBody('message', 'Please add a message or question').notEmpty();

  var errors = req.validationErrors();
  var opts = getOptions();

  var selectedReason = getMyContactReason(req.body.reason);
  var contact = (
    {
      name: req.body.name,
      email: req.body.email,
      reasonVal: selectedReason.id,
      reason: selectedReason.reason,
      subject: req.body.subject,
      message: req.body.message
    }
  );
  if (errors) {     // Render the form using error information
    res.render('contact', { title: 'Friends of Sonning Common Library - Contact Us', reasons: opts, captchakey: config.captcha.sitekey, contact: contact, errors: errors });
    return;
  }
  // no form errors -- how about captcha
  if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
    // create errors object
    var err = [{ location: "body", msg: "Tick to confirm you are not a robot", param: "recaptca", value: "" }];
    res.render('contact', { title: 'Friends of Sonning Common Library - Contact Us', reasons: opts, captchakey: config.captcha.sitekey, contact: contact, errors: err });
    return;
  }

  const verifyURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + config.captcha.secretkey + "&response=" + req.body['g-recaptcha-response']
    + "&remoteip=" + req.connection.remoteAddress;
  request(verifyURL, (err, response, body) => {
    body = JSON.parse(body);
    if (err || body.success === undefined || !body.success) {
      var err = [{ location: "body", msg: "Failed captcha test", param: "recaptca", value: "" }];
      res.render('contact', { title: 'Friends of Sonning Common Library - Contact Us', reasons: opts, captchakey: config.captcha.sitekey, contact: contact, errors: err });
      return;
    }
    // process email then render page replacing form with a 'thank you message'
    var mailgun = require('mailgun-js')(config.mg);
    var content = {
      title: '[FoSCL Web] ' + req.body.subject,
      email: req.body.email,
      name: req.body.name,
      category: selectedReason.category,
      subject: req.body.subject,
      message: req.body.message
    };
    var data = {
      from: config.mg.sender,
      to: selectedReason.email,
      subject: content.title
    };
    data.plaintext = generateTextEmail(content);
    // create and render our email message to browser!!
    // get compiled template 
    pugCompiler.compile('email/enquiry', content, function (err, html) {
      if (err) {
        throw new Error('Problem compiling template(double check relative path): ' + RELATIVE_TEMPLATE_PATH);
      }
      data.html = html;
      mailgun.messages().send(data, function (error, body) {
        if (error)// we have had a problem - report it - maybe they should try again later
          res.render('contact', { title: 'Friends of Sonning Common Library - Contact Us', reasons: opts, msg: 'Error occured, message not sent. Perhaps try again later.', err: true, contact: contact })
        else
          // we just need to tell client we are done
          res.render('contact', { title: 'Friends of Sonning Common Library - Contact Us', reasons: opts, msg: 'Your message has been forwarded to someone who should be able to help. Thank you.', err: false, contact: contact })
      });
    });
  });


  /*
  
  
    transport.sendMail(mailOpts, function (err, response) {
      if (err) {
        
  
    });
  */
});

router.get('/join', function (req, res, next) {
  res.render('register', { title: 'Friends of Sonning Common Library' });
});
router.get('/swatch', function (req, res, next) {
  res.render('bootswatch', { title: 'Friends of Sonning Common Library' });
});
router.get('/register', function (req, res, next) {
  res.render('register', { title: 'Friends of Sonning Common Library - Register' });
});

// helper functions

// get options from config.contactUs
function getOptions() {
  var a = [];
  config.contactUs.list.forEach(item => {
    a.push({ val: item.id, text: item.reason });
  });
  return a;
}

function getMyContactReason(index) {
  var option = config.contactUs.list.find(item => {
    return item.id == index;
  });
  if (option === undefined)
    return { 'id': -1, 'email': config.contactUs.default.email, 'reason': 'Unknown' };
  else
    return option;
}
function generateTextEmail(content) {
  var buffer = 'FoSCL Website Enquiry\n\n+  A visitor to the foscl website has made an enquiry.\n\n+  Their query has been automatically allocated based on the way the vistor (sender) categorised their question and forwarded only to you.\
   +  Please try to answer this enquiry as soon as possible or acknowledge it within 48 hours of receipt.\n\n+  If this enquiry should be directed elsewhere please forward this message to the relevant person and \
   copy your email to the sender.\n\n';
  buffer += 'From :' + content.name + '<' + content.email + '>\n';
  buffer += content.category + ': ' + content.subject + '\n\n';
  buffer += content.message;

  return buffer;
}
module.exports = router;
