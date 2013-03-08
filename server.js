var wechat = require('wechat'),
		http = require('http'),
		iconv = require('iconv-lite'),
		url = require('url'),
		$ = require('jquery'),
		S = require('string'),
		connect = require('connect');
		
var app = connect();

var transfer = {};
transfer["%"] = "%25";
transfer["+"] = "%2B";
transfer[" "] = "%20";
transfer["/"] = "%2F";
transfer["?"] = "%3F";
transfer["#"] = "%23";
transfer["&"] = "%26";
transfer["="] = "%3D";

function urlReplace(message){
	for(var c in transfer){
		message = S(message).replaceAll(c,transfer[c] ).s;
	}
	return message;
	
};

var options = {  
    host: '202.116.64.108',  
    port: 8991,  
    path: '/F?func=find-b&request=' ,
};

function fetch(book_name, res){
	var _res = res;

	options.path = options.path + urlReplace(book_name);
	var rlt = "";
	var html = '';  
	var count = 0;

	var rt_obj = {
		code: 0,
		imgUrlArray: {},
		bookName: {},
		bookNum: {}
	};

	http.get(options, function(res) {  
		res.on('data', function(data) {  
				html += data;  
		}).on('end', function() {
			
				var count_url = 0;
				var img_url = $(html).find("td.cover").each(function(){
					var tmpurl = $(this).children().html();
					var urlsplit = tmpurl.split('"');
					var url = urlsplit[3].split('\n')[1];
					url = S(url).replaceAll("&amp;", "&").s;
					rt_obj.imgUrlArray[count_url++] = url;
					count++;
				});
				
				var book_count = 0;
				var title = $(html).find("td.col2").each(function(){
					var name = $(this).children('.itemtitle').text();
					rt_obj.bookName[book_count] = name;
					var str = $(this).children('table').text().split('\n');
					str = str[6].split("',this)");
					str = str[0]; 
					str = S(str).replaceAll("  ", "").s;

					var tmpNumber = str.split(' ');
					tmpNumber = tmpNumber[0];
					var number = tmpNumber.split("）");	
					number = number[1];
					
					rt_obj.bookNum[book_count] = number; 
					str = name + "\n" + str;
					rlt = rlt + str + "\n";
					options.path = "/F?func=find-b&request=";
					book_count++;
				});

				if(count != 0)
					rt_obj = 1;
				return rt_obj;

		 });  
	});
}

app.use(connect.query());
app.use('/wechat', wechat('iLibrary', wechat.text(function (message, req, res, next) {
			 
			fetch(message.Content, res);
		})
	)
);
app.listen(3000);
console.log("listen 3000");
