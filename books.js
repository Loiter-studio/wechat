var http = require('http'),
		image = require('./image'),
		session = require('./session');
		
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
	fetch: function(fromUserName , book_name, res){
		var _res = res;
		var _this = this;
		
		/**
		 * wei add
		 * wen modify
		 * comment03.29： 回调函数就是个渣渣
		 */
		var entry = "";
		var books = "";
		var feedback = /@[^]*/;
		if(book_name == '?') {
			res.reply("输入\'1\'-------查看操作教程\n输入\'2\'-------查看图书馆开放时间\n如需反馈请输入\'@反馈内容\'\n搜索书籍直接输入书名");
		}

		else if(feedback.test(book_name)) {
			return ;
		}
		else if(book_name == '1') {
			res.reply("搜书请输入书名/作者/isbn\n继续查找请输入下一页\n如需帮助请输入\'?\'");
		}
		else if(book_name == '2'){
			res.reply("http://www.library.sysu.edu.cn/web/guest/openinghours");
		}
		else if (book_name != '下一页') {
			var search_url = "http://libapi.opensysu.org/v1/search_result_entry?name=" + book_name;
			http.get(search_url, function(res) {  
				res.on('data', function(data) {  
					entry += data;
				}).on('end', function() {
					entry = JSON.parse(entry).entry;
					var detail_url = "http://libapi.opensysu.org/v1/search_result?set_number="+entry['set_number']+"&set_entry=";
					detail_url = session.saveNewSession(fromUserName, detail_url);
					
					// 判断需要书籍是第几本
					http.get(detail_url, function(res){
						res.on('data', function(data){
							books += data;
						}).on('end', function(){
							books = JSON.parse(books).books;
							if(books.length > 0)
								wechat.reply(books, detail_url, _res);
							else
								_res.reply("没有找到你要的书呀 > <");
						});
					});
				});
			});
		}else {
			// bookSession保存的是书的detail_url
			var bookSession = session.getBookSession(fromUserName);
			//console.log(bookSession);
			if(bookSession)
			{
				// 通过设置set-entry来判断下一页
				var detail_url = session.saveNextPage(fromUserName, bookSession);
				http.get(detail_url, function(res){
					res.on('data', function(data){
						books += data;
					}).on('end', function(){
						books = JSON.parse(books).books;
						if(books.length > 0){
							wechat.reply(books, detail_url, _res);
						}
						else {
							_res.reply("没有下一页了哦亲~");
						}
					});
				});
			}
			else {
				_res.reply("我们不记得您搜过什么书了，请从新输入查询书目再试试哦~亲");
				return ;	// 为了不再次reply得结束这个程序
			}
		}
	},
	reply: function(books, detail_url, _res){
		var set_number=  detail_url.split("=")[1].split("&")[0];
		var value = detail_url.split("=")[2].split("-")[0];
		var rt_obj = Array();
		
		for(var i in books){
			var isbn_array = books[i].isbn.split("-");
			var isbn = "";
			for(var j in isbn_array){
				isbn += isbn_array[j];
			}
			var sequence = parseInt(i) + parseInt(value);
			var book = {
				url: '',
				picurl: '',
				title: '',
			};
			book.url = "http://lib.sysujwxt.com/detail/"+isbn+"-"+set_number+"-"+sequence+"-"+books[i].doc_number;
			book.picurl = "http://libapi.opensysu.org/v1/cover?isbn=" + isbn;
			book.title = books[i].title + " " + books[i].index;
			rt_obj.push(book);
		}
		_res.reply(rt_obj);
		return ;
	},
	detail: function(url, res){
		var _res = res;
		var values = url.split("-");
		var book = "";
		var status = "";
		var rt_obj = {};
		
		var detail_url = "http://libapi.opensysu.org/v1/search_result?set_number="+values[1]+"&set_entry="+values[2]
		http.get(detail_url, function(res){
			res.on('data', function(data){
				book += data;
			}).on('end', function(){
				http.get("http://libapi.opensysu.org/v1/status?doc_number="+values[3], function(res){
					res.on('data', function(data){
						status += data;
					}).on('end', function(){
						book = JSON.parse(book).books[0];
						rt_obj.pin = book.index;
						rt_obj.author = book.author;
						rt_obj.publish = book.press;
						rt_obj.isbn = book.isbn;
						rt_obj.summary = book.intro;
						
						rt_obj.status = JSON.parse(status).status;
						
						console.log(status);
						_res.end(JSON.stringify(rt_obj));
					});
				});
			});
		});
	},
}
//wechat.fetch("","ruby","");
module.exports = wechat;
