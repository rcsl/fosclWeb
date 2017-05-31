var config = {};
config.smtp ={
  user : 'no-reply@friendsofsonningcommonlibrary.org.uk',
  password : 'my-secret-password'
};
config.email = "secretary@friendsofsonningcommonlibrary.org.uk";

config.contactUs = [
        { "reason":"Membership", "email":"membership@friendsofsonningcommonlibrary.org.uk" },
        { "reason":"Volunteering",  "email": "rota@friendsofsonningcommonlibrary.org.uk" },
        { "reason":"General Question", "email": "secretary@friendsofsonningcommonlibrary.org.uk" },
        { "reason":"Web-site",  "email": "media@friendsofsonningcommonlibrary.org.uk" },
        { "reason":"Other", "email": "secretary@friendsofsonningcommonlibrary.org.uk" },
    ];


module.exports = config;