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
					var items = $(html).find(".items");
					// 错误处理
					if(items.length == 0){
						_res.reply("没搜到书哟~换个名字呗");
					}
					items.each(function(){
						var _this = this;
						var books = {
							url: '',
							picurl: '',
							title: '',
						};
						
						var itemtitle = $(_this).find(".itemtitle");
						var title = $.trim(itemtitle.text());
						image.url = $.trim($(_this).find("img").attr("src"));
						var image_name = image.save();
						var picurl = "http://lib.sysujwxt.com/thumbs/" + image_name;
						
						var url = itemtitle.find("a").attr('href');
						url = url.substring(86, url.length-11).split("&");
						var set_number = url[1].split("=")[1];
						var set_entry = url[2].split("=")[1];
						url = "http://lib.sysujwxt.com/detail/" + "empty" + "-" + image_name + "-" + set_number + "-" + set_entry;
						
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
			});  
		});
	},
	detail: function(url, res){
		var _res = res;
		var _this = this;
		var book = {};
		
		var arr = url.split("?")[0].split("-");
		var options = {  
				host: '202.116.64.108',  
				port: 8991,
				//func=full-set-set&set_number=101579&set_entry=000001
				path: '/F?func=full-set-set&set_number=' + arr[2] + '&set_entry=' + arr[3],
		};
		
		book.title = arr[0];
		book.pin = "";
		// For image, we should try another method
		book.image_name = arr[1];
		
		var html = '';
		http.get(options, function(res) {  
			res.on('data', function(data) {  
				html += data;
			}).on('end', function() {
				var td = $(html).find("div#details2 td");
				var size = td.length;
				if(size > 0){	
					var isbn_price = $(html).find("td.td1:contains(ISBN)").next().text().split(":");
					book.isbn = $.trim(isbn_price[0]);
					book.price = $.trim(isbn_price[1]);
					var title = $(html).find("td.td1:contains(题名)").next().text();
					title = title.split("/");
					book.title = $.trim(title[0]);
					book.author = $.trim(title[1].split("\n")[0]);
					book.summary = $.trim($(html).find("td.td1:contains(摘要)").next().text());
					book.pin = $.trim($(html).find("td.td1:contains(索书号)").next().text().split("\n")[1].split(":")[1]);
					
					var status_url = $(html).find("td.td1:contains(所有单册借阅状态) a").attr("href");
					var status_html = '';
					var status = Array();
					http.get(status_url, function(res) {  
						res.on('data', function(data) {  
							status_html += data;
						}).on('end', function() {
							var tmp_status = $(status_html).find(".tr1~tr");
							var tmp_counter = 1;
							tmp_status.each(function(){
								var single = {};
								single.type = $($(this).children("td")[1]).text();
								single.status = $($(this).children("td")[2]).text();
								single.rt_date = $($(this).children("td")[3]).text()
								single.location = $($(this).children("td")[5]).text();
								status.push(single);
								// Till here all data get successfully
								if(tmp_counter++ == tmp_status.length){
									// status title pin image_name price publish summary 
									book.code = "success";
									book.status = status;
									console.log(book);
									//_res.end(JSON.stringify(book));
								}
								//_res.end(status_html);
							});
						});
					});	
				}
				else{
					book.code = "failed";
					_res.end(JSON.stringify(book));
				}
			});
		});
	}
}
module.exports = wechat;
//wechat.fetch('苏轼', '');103202&set_entry=000001&
//wechat.detail("Python%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B-746e42358778e8a6ef93656132d7439e.jpg-101487-000010?sukey=b50423ad109ac255073790da7e9b5fa158df1fcdda963f3a241b45f044aadd34e3dfec297aff5f2a60cb283d6f4a74ca15894aac0d37ab68", "");
