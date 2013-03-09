var http = require('http'),
		$ = require('jquery'),
		S = require('string'),
		image = require('./image');
		

/*
	var url = "http://202.112.150.126/index.php?client=libcode&isbn=978-7-301-19864-3/cover";
	image.url = url;
	image.save();
*/
var transfer = {};
	transfer["%"] = "%25";
	transfer["+"] = "%2B";
	transfer[" "] = "%20";
	transfer["/"] = "%2F";
	transfer["?"] = "%3F";
	transfer["#"] = "%23";
	transfer["&"] = "%26";
	transfer["="] = "%3D";

var wechat = {
	escape_character: function(book_name){
		for(var c in transfer){
			book_name = S(book_name).replaceAll(c, transfer[c]).s;
		}
		return book_name;
	},
	fetch: function(book_name, res){
		var _res = res;
		var _this = this;
		var options = {  
				host: '202.116.64.108',  
				port: 8991,  
				path: '/F?func=find-b&request=' ,
		};
		options.path += wechat.escape_character(book_name);
		//Data structure
		//_res.reply(options.path);
		
		var html = '';
		http.get(options, function(res) {  
			res.on('data', function(data) {  
					html += data;
			}).on('end', function() {
					var rt_obj = Array();
					var rt_length = $(html).find(".items").length;
					var rt_counter = 1;

					$(html).find(".items").each(function(){
						var _this = this;
						var books = {
							url: '',
							picurl: '',
							title: '',
						};
						
						var itemtitle = $(_this).find(".itemtitle");
						//console.log(itemtitle);
						var title = itemtitle.text();
						var url = itemtitle.find("a").attr('href');
						//url = url.substring(0, 28)+url.substring(85, url.length-11);
						url = "http://lib.sysujwxt.com/detail/"+url.substring(86, url.length-11);
						//console.log(url);

						image.url = S($(_this).find("img").attr("src")).trim().s;
						var picurl = "http://lib.sysujwxt.com/" + image.save();
						var pin = '';
						
						var str = $(this).find('table').text().split('\n');
						if(str.length >= 6){
							// All operation concern to array, should validate
							pin = str[1].replace(/[^x00-xff]*/, "");
						}
						title = title + " " + pin;
						
						books.url = url;
						books.picurl = picurl;
						books.title = title;
						rt_obj.push(books);
						if(rt_counter ++ == 10)
							_res.reply(rt_obj);
					});
//					//_res.reply(rt_obj);
					console.log(rt_obj);
			});  
		});
	},
	detail: function(book_name){
		var _this = this;
		var options = {  
				host: '202.116.64.108',  
				port: 8991,  
				path: '/F?func=find-b&request=' ,
		};
		options.path += _this.escape(book_name);
		
		//Data structure
		var books = {
			bookurl: Array(),
			picurl: Array(),
			title: Array(),
			pin: Array()
		};
		
		var html = '';
		http.get(options, function(res) {  
			res.on('data', function(data) {  
					html += data;
			}).on('end', function() {
					$(html).find(".items").each(function(){
						var _this = this;
						var itemtitle = $(_this).find(".itemtitle");
						var title = itemtitle.text();
						var bookurl = itemtitle.find("a").attr('href');
						var cover = S($(_this).find("img").attr("src")).trim().s;
						var pin = '';
						var author = '';
						var publish = '';
						var storage = '';
						var detail = '';
						
						var str = $(this).find('table').text().split('\n');
						if(str.length >= 6){
							// All operation concern to array, should validate
							pin = str[1].replace(/[^x00-xff]*/, "");
							author = str[1].split(/[0-9a-zA-Z]/)[0];
							author = author.substring(3, author.length-4);
							publish = str[2];
							
							str = str[6].split("',this)");
							str = S(str).replaceAll("  ", "").s;
							str = str.split("\" onmouseout");
							
							detail = str[0];
							storage = str[1].split("400)\"")[1];
						}
					});
			});  
		});
	}
}
module.exports = wechat;
//wechat.fetch("book", "");
