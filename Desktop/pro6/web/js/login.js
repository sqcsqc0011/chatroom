var myApp = angular.module('myApp', ['ngStorage']);

myApp.service('userService', function($http) {
	return {
		logincheck: function($scope, $sessionStorage, $window) {
			var info = { username: $scope.username, pwd:$scope.password };
			$http.post('/signin', info).success(function(response) {
				console.log("coming from expressjs, login check is ", response);
				$scope.loginresult = response.logincheck;
				if($scope.loginresult) {
					sessionStorage.setItem('loginuser', JSON.stringify(response.loginuser));
					//var loginuser = JSON.parse(sessionStorage.loginuser);
					$window.location.href = '/chatroom.html';
				} else alert("Wrong username or password!");
            });
        },
	}
});

myApp.controller('loginCtrl', function($scope, userService, $window, $sessionStorage) {
	$scope.username = "";
	$scope.pwd = "";
	$scope.logincheck = function(){
		userService.logincheck($scope, $sessionStorage, $window);
//		$window.location.href = '/chatroom.html';		
	}
});