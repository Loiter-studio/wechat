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
						image.url = S($(_this).find("img").attr("src")).trim().s;
						var image_name = image.save();
						var picurl = "http://lib.sysujwxt.com/" + image_name;
						
						var pin = '';
						
						var str = $(this).find('table').text().split('\n');
						if(str.length >= 6){
							// All operation concern to array, should validate
							pin = str[1].replace(/[^x00-xff]*/, "");
						}
						title = title + " " + pin;
						
						var url = itemtitle.find("a").attr('href');
						url = "http://lib.sysujwxt.com/detail/" + title + "&" + pin + "&" + image_name + url.substring(86, url.length-11);
						
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
	detail: function(url, res){
		var _res = res;
		var _this = this;
		var options = {  
				host: '202.116.64.108',  
				port: 8991,
				path: '/F?' + url ,
		};
		var arr = url.split("&");
		var title = arr[0];
		var pin = arr[1];
		// For image, we should try another method
		var image_name = arr[2];
		
		var html = '';
		http.get(options, function(res) {  
			res.on('data', function(data) {  
				html += data;
			}).on('end', function() {
				var td = $(html).find("div#details2 td");
				var size = td.length;
				if(size > 0){
					var price = $.trim($(td[3]).children("a").text().split(":")[1]);
					var publish = $.trim($(td[7]).children("a").text());
					var summary = "";
					if( $.trim($(td[12]).text()) == "摘要")
						summary = $.trim($(td[13]).text());
					else if( $.trim($(td[14]).text()) == "摘要")
						summary = $.trim($(td[15]).text());
					else if( $.trim($(td[16]).text()) == "摘要")
						summary = $.trim($(td[17]).text());
					else if( $.trim($(td[18]).text()) == "摘要")
						summary = $.trim($(td[19]).text());
						
					// Get book status
					var status_url = $(td[size-3]).children("a").attr("href").split("?")[1];
					var status_options = {  
							host: '202.116.64.108',  
							port: 8991,
							path: '/F?' + status_url ,
					};
					var status_html = '';
					var status = Array();
					http.get(status_options, function(res) {  
						res.on('data', function(data) {  
							status_html += data;
						}).on('end', function() {
							var tmp_status = $(status_html).find(".tr1~tr");
							var tmp_counter = 1;
							tmp_status.each(function(){
								var book = {};
								$(this).children("td");
								book.type = $($(this).children("td")[1]).text();
								book.status = $($(this).children("td")[2]).text();
								book.rt_date = $($(this).children("td")[3]).text()
								book.location = $($(this).children("td")[5]).text();
								status.push(book);
								// Till here all data get successfully
								if(tmp_counter++ == tmp_status.length){
									// status title pin image_name price publish summary 
									console.log(title);
									console.log(image_name);
									console.log(price);
									console.log(summary);
									console.log(status);
								}
								//_res.end(status_html);
							});
						});
					});	
					_res.end(html);
				}
					_res.end("no");
			});
		});
	}
}
module.exports = wechat;
