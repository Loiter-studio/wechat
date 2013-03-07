//声明所需依赖库的对象
var	fs = require('fs'),
    http = require('http'),
		Log = require('log'),
		log = new Log('debug', fs.createWriteStream('my.log'));
	
var image = {
	url: '',
	save: function(){
		var _this = this;
		
    var hostName = _this.url.split('/')[2];
    var path = _this.url.substring(_this.url.indexOf(hostName) + hostName.length);
    var options = {
        host:hostName,
        port:80,
        path:path
    };
		var name = _this.md5(_this.url) + ".jpg";
		
    http.get(options, function (res) {
        res.setEncoding('binary');
        var imageData = '';

        res.on('data', function (data) {//图片加载到内存变量
            imageData += data;
        }).on('end', function () {//加载完毕保存图片
            fs.writeFile("wechat/thumbs/"+ name +".jpg", imageData, 'binary', function (err) {
                if (err) log.error("Failed to save image");
            });
        });
    });
		return name;
	},
	md5: function(str){
    hash = require('crypto').createHash('md5');
		return hash.update(str+"").digest('hex');
	}
}

module.exports = image;
/*
var url = "http://202.112.150.126/index.php?client=libcode&isbn=/cover";
image.url = url;
image.save();
*/