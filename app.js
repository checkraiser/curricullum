var express = require("express"),
    app     = express(),
    redis   = require('redis'),
    client  = redis.createClient(),
    rest    = require('restler'),
    port    = parseInt(process.env.PORT, 10) || 8080;
	

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
console.log('request: ' + id);
client.get(id, function(err, rid){
	if (!rid) {
     rest.get('http://127.0.0.1:4567/' + id).on('complete', function(data) {    
        if (data.error) {
		      client.set(id, JSON.stringify(data));
				client.expire(id, 100);
        	  res.end(JSON.stringify(data));
		
        } else {
			
      		client.set(id, JSON.stringify(data));
      		client.expire(id, 3600);
      		res.end(JSON.stringify(data)); 
		}
    });
   }
   else {   
		client.expire(id, 3600);
		res.end(JSON.stringify(JSON.parse(rid)));
   }       	
});  
});


app.get("/check/:id", function(req, res){
	var id = req.params.id;
	var ckey = 'check:' + id;
	client.get(ckey, function(err, cid){
		if (!cid) {
		rest.get('http://127.0.0.1:4567/check/' + id).on('complete', function(data) {
	      if (data.error) {			
			client.set(ckey, JSON.stringify(data));
			client.expire(ckey, 3600);      
        	res.end(JSON.stringify(data));
	      } else {		  
        	client.set(ckey, JSON.stringify(data));
			client.expire(ckey, 3600);      
	      	res.end(JSON.stringify(data));
	      }
			
		});
	} else {	
		client.expire(ckey, 3600);      
		res.end(JSON.stringify(JSON.parse(cid)));
	}
	});
	
});
app.get("/", function(req, res) {    
  res.redirect("/index.html");
});

console.log("running");
app.listen(port);
