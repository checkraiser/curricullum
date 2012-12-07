var express = require("express"),
    app     = express(),
    redis   = require('redis'),
    client  = redis.createClient(),
    rest    = require('restler'),
    port    = parseInt(process.env.PORT, 10) || 4569;
    

app.configure(function(){
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
  app.engine('html', require('ejs').renderFile);
  app.use(express.errorHandler({
    dumpExceptions: true, 
    showStack: true
  }));
  app.use(app.router);
});

app.get("/get/:id", function(req, res){  
  var id = req.params.id;
 var rid = client.get(id);
 if (!rid) {
     rest.get('http://10.1.0.195:4567/' + id).on('complete', function(data) {    
      client.set(id, data);
      client.expire(id, 10);
      res.end(JSON.stringify(data));
    });
   }
   else {    
    res.end(JSON.strigify(rid));
   }        
});
app.get("/check/:id", function(req, res){
  var id = req.params.id;
	var ckey = 'check:' + id;
	var cid = client.get(ckey);
	if (!cid) {
		rest.get('http://10.1.0.195:4567/check/' + id).on('complete', function(data) {
      if (data.error) {
        res.end(JSON.stringify(data));
      }
			client.set(ckey, data);
			client.expire(ckey, 3600);
			res.end(JSON.stringify(data));
		});
	} else {
		res.end(JSON.strigify(cid));
	}
});
app.get("/", function(req, res) {    
  res.render("profile.html");
});
app.get("/test", function(req, res){
  res.render("profile2.html");
})
console.log("running");
app.listen(port);