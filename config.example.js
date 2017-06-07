var config = {};
config.smtp ={
  user : 'no-reply@friendsofsonningcommonlibrary.org.uk',
  password : 'secret'
};
config.default ={};
config.default.email = "readingcomputersolutions@gmail.com";

config.contactUs = [
        { "id" : 0, "reason":"About Joining FoSCL", "email":"membership@friendsofsonningcommonlibrary.org.uk" },
        { "id" : 1, "reason":"About Volunteering",  "email": "rota@friendsofsonningcommonlibrary.org.uk" },
        { "id" : 2, "reason":"Just a General Question", "email": "secretary@friendsofsonningcommonlibrary.org.uk" },
        { "id" : 3, "reason":"About the Web-site",  "email": "media@friendsofsonningcommonlibrary.org.uk" },
        { "id" : 4, "reason":"Something else", "email": "secretary@friendsofsonningcommonlibrary.org.uk" },
    ];


module.exports = config;