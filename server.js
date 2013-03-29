var wechat = require('wechat'),
		http = require('http'),
		path = require('path'),
		url = require('url'),
		express = require('express'),
		book = require('./books');
		
var app = express();
app.configure(function(){
	app.set("port", 3000);
	app.use(express.static(path.join(__dirname, "wechat/thumbs")));
});

process.on('uncaughtException', function (err) {
	  console.log('Caught exception: ' + err);
});

app.post("/wechat", wechat('iLibrary', 
	wechat.text(function (message, req, res, next) {
		console.log("in"+message.Content);
		if(message.Content == 'Hello2BizUser')
			res.reply("欢迎使用，请输入想要查找的关键字,需要查询更多请输入关键字\"下一页\".如果您在使用过程中出现了bug,烦请您用文字或截图反馈给我们.p.s暂不支持语音搜索w");
		else
			book.fetch(message.FromUserName, message.Content , res);
	}).event(function(message, req, res, next){
		if(message.Event = "subscribe"){
			res.reply("欢迎使用，请输入想要查找的关键字,需要查询更多请输入关键字\"下一页\".如果您在使用过程中出现了bug,烦请您用文字或截图反馈给我们.p.s暂不支持语音搜索w");
		}
	})
));


app.get('/detail/:url', function(req, res){
	var url = req.params.url;
	res.sendfile(__dirname + '/view/index.html');
});
app.post('/detail/:url', function(req, res){
	book.detail(req.params.url, res);
});

app.get('/css/:url', function(req, res){
	res.sendfile(__dirname + '/view/' + req.params.url);
});

http.createServer(app).listen(app.get('port'), function(){
	console.log("listen 3000");
});
