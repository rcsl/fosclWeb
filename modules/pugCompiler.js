var pug = require('pug');
var path = require('path');

// @relativeTemplatePath is the path relative to the views directory, so include subDirectories if necessary
// @data is the data that will be injected into the template
exports.compile = function(relativeTemplatePath, data, next){

// actual path where the template lives on the file system, assumes the standard /views directory
  // output would be something like /var/www/my-website/views/email-template.jade
  var absoluteTemplatePath = path.join(process.cwd() , '/views/' , relativeTemplatePath + '.pug');

  pug.renderFile(absoluteTemplatePath, data, function(err, compiledTemplate){
    if(err){
      throw new Error('Problem finding or compiling pug template (check view path)');
    }
    console.log('[INFO] COMPILED TEMPLATE: ', compiledTemplate);
    next(null, compiledTemplate);
  });
};