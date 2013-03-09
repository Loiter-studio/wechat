var wechat = require('wechat'),
		http = require('http'),
		path = require('path'),
		$ = require('jquery'),
		S = require('string'),
		url = require('url'),
		express = require('express'),
		fs = require('fs'),
    request = require('request'),	
		//connect = require('connect'),
		fetch = require('./books');
/*
var app = connect();

console.log(__dirname);
app.use(connect.static(__dirname + '/thumbs'));

app.use(connect.query());

//fetch("book", "");

app.use('/wechat', wechat('iLibrary', wechat.text(function (message, req, res, next) {
			//console.log(message.Content);
			var result = fetch("book", res);
		})
	)
);
app.listen(3000);
console.log("listen 3000");
*/

var app = express();
app.configure(function(){
	app.set("port", 3000);
	app.use(express.static(path.join(__dirname, "wechat/thumbs")));
});

app.post("/wechat", wechat('iLibrary', wechat.text(function (message, req, res, next) {
		//res.reply(message.Content);
		fetch(message.Content , res);
	})
));

app.get('/test/:url', function(req, res){
	console.log(req.params.url);
});

app.get('/:url', function(req, res){
	//console.log(req.params.image_url);
	var pathname=__dirname + "/thumbs/" + url.parse(req.params.url).pathname;
	console.log(pathname);
	if (path.extname(pathname)=="") {
		pathname+="/";
	}
	if (pathname.charAt(pathname.length-1)=="/"){
		pathname+="index.html";
	}

	fs.exists(pathname, function(exists){
		if(exists){
			switch(path.extname(pathname)){
				case ".html":
					res.writeHead(200, {"Content-Type": "text/html"});
					break;
				case ".js":
					res.writeHead(200, {"Content-Type": "text/javascript"});
					break;
				case ".css":
					res.writeHead(200, {"Content-Type": "text/css"});
					break;
				case ".gif":
					res.writeHead(200, {"Content-Type": "image/gif"});
					break;
				case ".jpg":
					res.writeHead(200, {"Content-Type": "image/jpeg"});
					break;
				case ".png":
					res.writeHead(200, {"Content-Type": "image/png"});
					break;
				default:
					res.writeHead(200, {"Content-Type": "application/octet-stream"});
			}
			fs.readFile(pathname,function (err,data){
				res.end(data);
			});
		} else {
			res.writeHead(404, {"Content-Type": "text/html"});
			res.end("<h1>404 Not Found</h1>");
		}
	});
});

http.createServer(app).listen(app.get('port'), function(){
	console.log("listen 3000");
});
