var http = require('http'),
		$ = require('jquery'),
		S = require('string'),
		image = require('./image'),
		session = require('./session');
		

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
	getSessionFromHtml : function(html){
			var items = $(html).find("#header");
			var tmpSession = items.find("a").attr("href");
			tmpSession = tmpSession.split('/');
			tmpSession = tmpSession[4].split('-');
			//console.log(tmpSession[0]);
			return tmpSession[0];
	},
	fetch: function(fromUserName , book_name, res){
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
		/*
			wei add
		*/
		var isNextPage = false;
		if (book_name == '下一页') {
			isNextPage = true;
			var theBookSession = session.getBookSession(fromUserName);
			//console.log(theBookSession);
			if(theBookSession)
			{
				options.path = '/F/'+ theBookSession.bookSession + '?func=short-jump&jump='+(theBookSession.pageId*10+1);
			}
			else
				//console.log("过期");
				_res.reply("我们不记得您搜过什么书了，请从新输入查询书目再试试哦~亲");
		}
		//console.log(options);
		//end
	//	options.path = '/F/T1YE4KJ1XVEYR9HBEBNYY18DJKP3SKHSNEQIALLIERRCKNXGV5?func=short-jump&jump=11';
		
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
						//console.log("没有书名");
						_res.reply("没搜到书哟~换个名字呗");
					}
					var tmpBookSession = wechat.getSessionFromHtml(html);
					if(isNextPage){
							session.saveNextPage(fromUserName , tmpBookSession);
					}
					else{
					//	console.log(fromUserName);
						session.saveNewSession(fromUserName, tmpBookSession);
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
						if(rt_counter ++ == rt_length)
							_res.reply(rt_obj);
							//console.log(rt_obj);

							
					});
						//_res.reply(rt_obj);
					//console.log(rt_obj);

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
				/*
					var isbn_price = $(html).find("td.td1:contains(ISBN)").next().text().split(":");
					book.isbn = $.trim(isbn_price[0]);
					book.price = $.trim(isbn_price[1]);
					var title = $(html).find("td.td1:contains(题名)").next().text();
					title = title.split("/");
					book.title = $.trim(title[0]);
					book.publish = $.trim($(html).find("td.td1:contains(出版发行)").next().text());
					book.author = $.trim(title[1].split("\n")[0]);
					book.summary = $.trim($(html).find("td.td1:contains(摘要)").next().text());
					book.pin = $.trim($(html).find("td.td1:contains(索书号)").next().text().split("\n")[1].split(":")[1]);	
					var status_url = $(html).find("td.td1:contains(所有单册借阅状态) a").attr("href");
				*/
					var isbn_price = $(td[3]).children("a").text().split(":");
					book.isbn = $.trim(isbn_price[0]);
					book.price = $.trim(isbn_price[1]);
					var author_publish = $.trim($(td[7]).children("a").text());
					book.publish = $.trim($($(html).find("td.td1:contains(出版)")[1]).text());	
					book.author = "";
					if(author_publish){
						author_publish = author_publish.split("/");
						book.title = author_publish[0];
						book.author = author_publish[1];
					}
					book.summary = $.trim($(html).find("td.td1:contains(摘要)").next().text());
					//console.log($.trim($(html).find("td.td1:contains(摘要)").next().text()));
					/*
					if( $.trim($(td[12]).text()) == "摘要")
						book.summary = $.trim($(td[13]).text());
					else if( $.trim($(td[14]).text()) == "摘要")
						book.summary = $.trim($(td[15]).text());
					else if( $.trim($(td[16]).text()) == "摘要")
						book.summary = $.trim($(td[17]).text());
					else if( $.trim($(td[18]).text()) == "摘要")
						book.summary = $.trim($(td[19]).text());
					*/
					if($.trim($(td[size-6]).text()) == "馆藏地:索书号")
						book.pin = $.trim($(td[size-5]).text().split(":")[1]);
					// Get book status
					var status_url = $(td[size-3]).children("a").attr("href");
				
				// ======== roll back beacuse of latency
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
									_res.end(JSON.stringify(book));
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

/*
wechat.fetch("11", "python", "");
var t = 0;
setInterval(function(){
	if(t ++ <= 1){
		wechat.fetch("11", "下一页", "");
		console.log("delay");
	}
}, 5000);
*/
//session.testLogSession();