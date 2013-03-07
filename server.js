var wechat = require('wechat'),
		http = require('http'),
		$ = require('jquery'),
		S = require('string'),
		connect = require('connect')
		image = require('./image');
		
var app = connect();

app.use(connect.query());
app.use('/wechat', wechat('iLibrary', wechat.text(function (message, req, res, next) {
			var result = fetch(message.Content, res);
		})
	)
);
app.listen(3000);
console.log("listen 3000");