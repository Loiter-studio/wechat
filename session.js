


// set the Array to 1000 size 

var sessions = new Array();
//console.log(sessions.length);
var sessionManagement = {

	getCurrentTime : function  () {
		var now = new Date();
		var ss = now.getTime(); // from 1970/01/01  to now   (ms)
		//console.log(ss);
		return ss;
	},
	getIndexOfUser: function(userName)
	{
		for(var i = 0 ; i < sessions.length ; i++)
		{
			if(sessions[i].userId == userName){
				return i;
			}

		}
		return 1000;
	},
	saveNewSession : function(userName, bookSession){
		var index = sessionManagement.getIndexOfUser(userName);
		//console.log(index);
		if(index != 1000){
			sessions[index].bookSession = bookSession;
			sessions[index].userId = userName;
			sessions[index].crashTime = sessionManagement.getCurrentTime() + 10*60*1000;
			sessions[index].pageId = 1;
		}
		else{
			if(sessions.length == 999){

				var exchangeIndex  = Math.floor(Math.random()*1000);
				sessions[exchangeIndex].bookSession = bookSession;
				sessions[exchangeIndex].userId = userName;
				sessions[exchangeIndex].crashTime = sessionManagement.getCurrentTime() + 10*60*1000;
				sessions[exchangeIndex].pageId = 1;
			}

			else sessions.push({userId : userName ,
								bookSession :  bookSession,
								crashTime : sessionManagement.getCurrentTime() + 10*60*100,
								pageId : 1});

		}
		
	},
	saveNextPage: function(userName , bookSession){
		var index = sessionManagement.getIndexOfUser(userName);
		if(index != 1000){
			sessions[index].pageId +=1;
		}
	},

	getBookSession : function(userName){
		var index = sessionManagement.getIndexOfUser(userName);
		//console.log(index);
		if( index != 1000){
			if(sessionManagement.getCurrentTime() >= sessions[index].crashTime)
				return false;
			else return sessions[index];
		}
		else{
			return false;
		}

	},
	testLogSession : function(){
		/*
		for(var i = 0 ; i < sessions.length ; i++){
			console.log("session" + i);
			console.log(sessions[i].userId + '+' +sessions[i].bookSession);
		}
		
		*/
		console.log(sessions);	
	}

}

module.exports = sessionManagement;