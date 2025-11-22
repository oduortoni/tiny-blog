var path = require('path');
var fs = require('fs');

var handler = function() {
  this.secure = secure;
}

function secure(req, res){
  var htmlPath = path.resolve(__dirname + '/../../admin/index.html');
  var html = fs.readFileSync(htmlPath, 'utf8');
  
  var sharedData = {
    config: {
      api_url: config.api_url,
      url: config.url
    }
  };
  
  var scriptTag = `<script>window._sharedData = ${JSON.stringify(sharedData)};</script>`;
  html = html.replace('//GENERATED', scriptTag);
  
  res.send(html);
}

module.exports = handler