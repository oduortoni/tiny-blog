module.exports = function(app) {

var React = require("react")
var ReactDOM = require("react-dom/server")
var Main = require("../browser/lib/Main")
var Page = require("./models/PageSchema")
var Logger = require("./lib/logger")

var port = process.env.PORT || 8090;
var cmsConfig = {"GA":"GA-asd45", "js_src":"http://localhost:"+port+"/js/app.js", "per_page":5, "port":port}

// Handle all requests without /api, /admin, or static files
app.get(/^\/(?!(api|admin|app\.js|index\.html|\.css|\.png|\.jpg|\.jpeg|\.gif|\.ico)(\/|$)).*$/,function(req,res){
  //purgeCache("rekt")

  // Serve index.html for root path
  if (req.path === '/') {
    return res.sendFile(require('path').resolve(__dirname + '/../www/index.html'));
  }

  if (process.argv.indexOf("template")!= -1) {
    var App = require("rekt")()
  }else{
    var App = Main
  }

  Logger.log(req)

  // Check if URL exists
  Page.findOne({url:req.path, visible: 1}).lean().exec().then(function(page) {

    if(page){
      page.menu=cache.getCache()
      if(page.type == "blog_section"){
        Page.find({type:"post", section:page.section}).sort({'created_at': -1}).limit(cmsConfig.per_page).select("-raw_content -md_content").lean().exec().then(function(section) {
          page.posts=section;
          var content = ReactDOM.renderToString(React.createElement(App, { data: page, config: cmsConfig}));
          return res.send("<!DOCTYPE html>"+ content +"")
        });
      }else{
        var content = ReactDOM.renderToString(React.createElement(App, { data: page, config: cmsConfig}));
        return res.send("<!DOCTYPE html>"+ content +"")
      }
    }else{
      var content = ReactDOM.renderToString(React.createElement(App, { data: {type:"404"}, config: cmsConfig}));
      return res.status(404).send("<!DOCTYPE html>"+ content +"")
    }
  });
});





}