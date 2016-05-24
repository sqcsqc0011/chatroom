var myApp = angular.module('myApp', ['ngStorage']);

myApp.service('userService', function($http) {
	return {
		usercheck: function($scope, $sessionStorage, $window) {
			console.log("Get session storage: " + sessionStorage.loginuser);
			if( sessionStorage.loginuser === undefined){
				$window.location.href = '/';
			} else {
				var loginuser = JSON.parse(sessionStorage.loginuser);
				$scope.loginuser = loginuser;}
			/*$http.get('/logincheck').success(function(response) {
				console.log("coming from expressjs, user login check is ", response);
				$scope.logincheck = response;
				//console.log(response);
				if(!$scope.logincheck.login){
					alert('Please login first!');
					$window.location.href = '/';}
            }); */
        },
		logout: function($scope, $sessionStorage, $window){
			sessionStorage.removeItem('loginuser');
			$http.get('/logout').success(function(response) {
				console.log("coming from expressjs, user login out is ", response);
				$scope.logout = response;
            });
			$window.location.href = '/';
		},
	}
});

myApp.controller('chatCtrl', function($scope, userService, $window, $sessionStorage) {
	userService.usercheck($scope, $sessionStorage, $window);
	$scope.logout = function(){
		userService.logout($scope,$sessionStorage, $window);
	};
	$scope.onlinelist = '';
	var socket = io();
	socket.emit('online', {user: $scope.loginuser, date:getTimeString()});
	socket.on('online', function (data) {
		$scope.onlinelist = data.users;
		if (data.user != $scope.loginuser) {
			var element = " <ul class='media-list'><li class='media'><div class='media-body'><div class='media'>" + 
			" <a class='pull-left' href='#'><img class='media-object img-circle' style='height:50px;width:50px;' src='"+data.user.imgpath+"'/>" +
			" </a><div class='media-body'>" +data.user.fname+' '+data.user.lname + " Online<br /><small class='text-muted'>"
			+ data.user.fname+' '+data.user.lname+ " | " + data.date + "</small>" +
			"<hr /></div></div></div></li></ul>";
			$('#chatbody').append(element);
		} else {
			var element = " <ul class='media-list'><li class='media'><div class='media-body'><div class='media'>" + 
			" <a class='pull-left' href='#'><img class='media-object img-circle' style='height:50px;width:50px;' src='"+data.user.imgpath+"'/>" +
			" </a><div class='media-body'>" +data.user.fname+' '+data.user.lname + " Online<br /><small class='text-muted'>"
			+ data.user.fname+' '+data.user.lname+ " | " + data.date + "</small>" +
			"<hr /></div></div></div></li></ul>";
			$('#chatbody').append(element);
		}
		$scope.$apply();
	});
	
	socket.on('offline', function (data) {
	    $scope.onlinelist = data.users;
		if (data.user != $scope.loginuser) {
			var element = " <ul class='media-list'><li class='media'><div class='media-body'><div class='media'>" + 
			" <a class='pull-left' href='#'><img class='media-object img-circle' style='height:50px;width:50px;' src='"+data.user.imgpath+"'/>" +
			" </a><div class='media-body'>" +data.user.fname+' '+data.user.lname + " Offline<br /><small class='text-muted'>"
			+ data.user.fname+' '+data.user.lname+ " | " + getTimeString() + "</small>" +
			"<hr /></div></div></div></li></ul>";
			$('#chatbody').append(element);
		} else {
			var element = " <ul class='media-list'><li class='media'><div class='media-body'><div class='media'>" + 
			" <a class='pull-left' href='#'><img class='media-object img-circle' style='height:50px;width:50px;' src='"+data.user.imgpath+"'/>" +
			" </a><div class='media-body'>" +data.user.fname+' '+data.user.lname + " Offline<br /><small class='text-muted'>"
			+ data.user.fname+' '+data.user.lname+ " | " + getTimeString()+ "</small>" +
			"<hr /></div></div></div></li></ul>";
			$('#chatbody').append(element);
		}
	});
	
	$scope.sendmessage = function(){
		var infosend = {message:$scope.message, date:getTimeString(), sender:$scope.loginuser};
		socket.emit('chat message', infosend);
		$scope.message = "";
	};
	
	socket.on('chat message', function(msg){
		var element = " <ul class='media-list'><li class='media'><div class='media-body'><div class='media'>" + 
			" <a class='pull-left' href='#'><img class='media-object img-circle' style='height:50px;width:50px;' src='"+msg.sender.imgpath+"'/>" +
			" </a><div class='media-body'>" + msg.message + "<br /><small class='text-muted'>"+msg.sender.fname+' '+msg.sender.lname+
			" | " + msg.date + "</small>" +
			"<hr /></div></div></div></li></ul>";
		$('#chatbody').append(element);
	});
});

function getTimeString(){
	var timeNow = new Date();
	var hours   = timeNow.getHours();
	var minutes = timeNow.getMinutes();
	var seconds = timeNow.getSeconds();
	var timeString = "" + ((hours > 12) ? hours - 12 : hours);
	timeString  += ((minutes < 10) ? ":0" : ":") + minutes;
	timeString  += ((seconds < 10) ? ":0" : ":") + seconds;
	timeString  += (hours >= 12) ? " P.M." : " A.M.";
	return timeString;
}

function limitImage(ImgD){    
    var areaWidth = 20;    
    var areaHeight = 20;   
    var image=new Image();    
    image.src=ImgD.src;    
    if(image.width>0 && image.height>0){       
        if(image.width/image.height>= areaWidth/areaHeight){    
            if(image.width>areaWidth){    
                ImgD.width=areaWidth;    
                ImgD.height=(image.height*areaWidth)/image.width;    
            }else{    
                ImgD.width=image.width;    
                ImgD.height=image.height;    
            }    
            ImgD.alt=image.width+"×"+image.height;    
        }else{    
            if(image.height>areaHeight){    
                ImgD.height=areaHeight;    
                ImgD.width=(image.width*areaHeight)/image.height;    
            }else{    
                ImgD.width=image.width;    
                ImgD.height=image.height;    
            }    
            ImgD.alt=image.width+"×"+image.height;    
        }    
    }    
}