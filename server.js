var wechat = require('wechat'),
		http = require('http'),
		path = require('path'),
		$ = require('jquery'),
		S = require('string'),
		express = require('express'),
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
		fetch("book", res);
	})
));

http.createServer(app).listen(app.get('port'), function(){
	console.log("listen 3000");
});
