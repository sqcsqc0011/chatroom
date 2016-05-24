var myApp = angular.module('myApp', ['ngRoute', 'ngFileUpload','flow','infinite-scroll']);

myApp.config(['$routeProvider',
        function($routeProvider) {
            $routeProvider.
				when('/', {
                    templateUrl: 'employeeList.html',
                    controller: 'listCtrl'
                }).
				when('/search', {
                    templateUrl: 'employeesearch.html',
                    controller: 'searchCtrl'
                }).
				when('/create', {
                    templateUrl: 'createEmployee.html',
                    controller: 'createCtrl'
                }).
				when('/edit/:editId', {
                    templateUrl: 'editemployee.html',
                    controller: 'editCtrl'
                }).
				when('/getmanager/:id', {
                    templateUrl: 'employeeList.html',
                    controller: 'getManager'
                }).
				when('/getreport/:id', {
                    templateUrl: 'employeeList.html',
                    controller: 'getReport'
                }).
				when('/getdetails/:editId', {
                    templateUrl: 'userdetail.html',
                    controller: 'getDetail'
                }).
                otherwise({
                    redirectTo: '/'
                });
}]);

myApp.service('userService', function($http) {
	return {
		getList: function($scope) {
			$http.get('/employee').success(function(response) {
				console.log("coming from expressjs ", response);
				$scope.users = response;
				$scope.maxid = $scope.users[$scope.users.length - 1].id;
            });
        },
		deleteUser : function(id){
			$http.delete('/employee/'+id).success(function(response){
				console.log(response);
			});	
		},
		getManagerList: function($scope) {
			$http.get('/manager/'+$scope.editId).success(function(response) {
				console.log("coming from expressjs ", response);
				$scope.managerList = response;
            });
        },
		getbyid: function($scope) {
			$http.get('/employee/' + $scope.id).success(function(response) {
				console.log("coming from expressjs ", response);
				$scope.users = response;
            });
        },
		editbyid: function($scope) {
			$http.get('/employee/' + $scope.editId).success(function(response) {
				console.log("coming from expressjs ", response);
				$scope.users = response;
				$scope.fname = $scope.users[0].fname;
				$scope.lname = $scope.users[0].lname; 
				$scope.age = Number($scope.users[0].age);
				$scope.sex = $scope.users[0].sex;
				$scope.phonenumber = $scope.users[0].phone.substring(2);
				$scope.email = $scope.users[0].email;
				$scope.department = $scope.users[0].department;
				$scope.title = $scope.users[0].title;
				$scope.manager = $scope.users[0].managerid;
				$scope.imgpath = $scope.users[0].imgpath;
            });
        },
		getreportbyid: function($scope) {
			$http.get('/getReport/' + $scope.id).success(function(response) {
				console.log("coming from expressjs ", response);
				$scope.users = response;
            });
        },
		addNew: function($scope){
			var managerId;
			if( $scope.manager == '-1'){
				managerId = null;
			} else {
				managerId = $scope.manager;
			}
			var newEmpolyee = {
						id : Number($scope.maxid) + 1,
						fname : $scope.fname,
						lname : $scope.lname, 
						age : $scope.age, 
						sex : $scope.sex, 
						phone : '+1' +$scope.phonenumber, 
						email : $scope.email,
						department : $scope.department,
						title : $scope.title,
						managerid : managerId
						};
			$http.post('/employee', newEmpolyee).success(function(response) {
				console.log("coming from expressjs ", response);
            });
		},
		addNewWithImg : function($scope,img,Upload){
			var managerId;
			if( $scope.manager == '-1'){
				managerId = null;
			} else {
				managerId = $scope.manager;
			}
			var newEmpolyee = {
						id : Number($scope.maxid) + 1,
						fname : $scope.fname,
						lname : $scope.lname, 
						age : $scope.age, 
						sex : $scope.sex, 
						phone : '+1' +$scope.phonenumber, 
						email : $scope.email,
						department : $scope.department,
						title : $scope.title,
						managerid : managerId,
						file : img.file
						};
			//console.log(img.file);
		/*	$http.post('/createwithimg', newEmpolyee).success(function(response) {
				console.log("coming from expressjs ", response);
            });*/
			Upload.upload({
				url: '/createwithimg',
				data: newEmpolyee,
			});
		},
		editUser : function($scope){
			if( $scope.manager == '-1'){
				managerId = null;
			} else {
				managerId = $scope.manager;
			}
			var editdata = {
				id: $scope.editId,
                fname : $scope.fname,
				lname : $scope.lname, 
				age : $scope.age, 
				sex : $scope.sex, 
				phone : '+1' +$scope.phonenumber, 
				email : $scope.email,
				department : $scope.department,
				title : $scope.title,
				managerid : managerId
            };
			$http.put('/employee/' + $scope.editId, editdata).success(function (response) {
                console.log(response);
            });
		},
		uploadimg : function(img, $scope){
			var maxid = Number($scope.maxid) + 1;
			var fd = new FormData();
			fd.append('img', img.file);
			$http.post('/upload/'+maxid, fd, {
				transformRequest: angular.identity,
				headers: {'Content-Type': undefined}
			})
			.success(function(){
				console.log("upload image to server: ", response);
			})
			.error(function(){
			});
		},
		changeImg : function(img, $scope){
			var fd = new FormData();
			fd.append('img', img.file);
			$http.post('/upload/'+$scope.editId, fd, {
				transformRequest: angular.identity,
				headers: {'Content-Type': undefined}
			})
			.success(function(){
				console.log("upload image to server: ", response);
			})
			.error(function(){
			});
		},
    };
});

myApp.controller('listCtrl', function($scope, $http, userService, $location, $anchorScroll) {
	
	$scope.users = userService.getList($scope);
	
	$scope.sort = function(keyname){
        $scope.sortKey = keyname; 
        $scope.reverse = !$scope.reverse;
    }

	$scope.deleteUser = function(id){
		userService.deleteUser(id);
		$scope.users = userService.getList($scope);		
	}

	$scope.limitNum = 10;
    $scope.loadMore = function () {
        $scope.limitNum += 5;
        console.log('Increase  Limit', $scope.limitNum)
    }
	
	$scope.gotop = function() {
      // set the location.hash to the id of
      // the element you wish to scroll to.
      $location.hash('top');
      // call $anchorScroll()
      $anchorScroll();
    };
});

myApp.controller('getManager', function($scope, $http, userService, $location, $routeParams) {
	$scope.id = $routeParams.id;
	$scope.users = userService.getbyid($scope);
	
	$scope.sort = function(keyname){
        $scope.sortKey = keyname; 
        $scope.reverse = !$scope.reverse;
    }

	$scope.deleteUser = function(id){
		userService.deleteUser(id);
		$scope.users = userService.getList($scope);		
	}
});

myApp.controller('getReport', function($scope, $http, userService, $location, $routeParams) {
	$scope.id = $routeParams.id;
	$scope.users = userService.getreportbyid($scope);
	
	$scope.sort = function(keyname){
        $scope.sortKey = keyname; 
        $scope.reverse = !$scope.reverse;
    }

	$scope.deleteUser = function(id){
		userService.deleteUser(id);
		$scope.users = userService.getList($scope);		
	}
});


myApp.controller('createCtrl', function($scope, $location, userService, Upload) {
	$scope.users = userService.getList($scope);
	$scope.notconfirm = true;
	$scope.nofile = true;
	$scope.fname = '';
	$scope.lname = ''; 
	$scope.age = '';
	$scope.sex = '';
	$scope.phonenumber = '';
	$scope.email = '';
	$scope.department = '';
	$scope.title = '';
	$scope.manager = '';
	
	$scope.$watch('fname',function() {$scope.test();});
	$scope.$watch('lname',function() {$scope.test();});
	$scope.$watch('age', function() {$scope.test();});
	$scope.$watch('sex', function() {$scope.test();});
	$scope.$watch('phonenumber', function() {$scope.test();});
	$scope.$watch('email', function() {$scope.test();});
	$scope.$watch('department', function() {$scope.test();});
	$scope.$watch('title', function() {$scope.test();});
	$scope.$watch('manager', function() {$scope.test();});	
	
	$scope.addfile = function() {
		$scope.nofile = false;
	};
	
	$scope.removefile = function() {
		$scope.nofile = true;
	};

	$scope.test = function() {
		$scope.notconfirm = true;
		$scope.phonecheck = checkMobile($scope.phonenumber);
		$scope.emailcheck = checkMail($scope.email);
		if($scope.phonecheck || $scope.phonenumber.length == 0 ){
			$scope.phoneshow = false;
		} else $scope.phoneshow = true;
		if($scope.emailcheck || $scope.email.length == 0 ){
			$scope.emailshow = false;
		} else $scope.emailshow = true;
		if( $scope.fname.length > 0 &&  $scope.lname.length > 0  && $scope.sex.length > 0 &&
			$scope.phonenumber.length > 0  && $scope.email.length > 0 &&
			$scope.department.length > 0 && $scope.title.length > 0 && $scope.manager.length > 0
			&& $scope.age > 0 && $scope.phonecheck && $scope.emailcheck
			)
			$scope.notconfirm = false;
	};

	
	$scope.createUser = function (e){
//		userService.uploadimg(e, $scope);
//		userService.addNew($scope);
		userService.addNewWithImg($scope,e, Upload);
		$location.path('/');
	}
	
	$scope.cancle = function(){
		$location.path('/');
	}	
});

myApp.controller('getDetail', function($scope, $location,$routeParams, userService) {
	$scope.editId = $routeParams.editId;
	$scope.managerList = userService.getManagerList($scope);
	$scope.currentUser = userService.editbyid($scope);
	
	$scope.cancle = function(){
		$location.path('/');
	}	
});

myApp.controller('editCtrl', function($scope, $location,$routeParams, userService) {
	$scope.editId = $routeParams.editId;
	$scope.managerList = userService.getManagerList($scope);
	$scope.notconfirm = true;
	$scope.nofile = true;
	$scope.fname = '';
	$scope.lname = ''; 
	$scope.age = '';
	$scope.sex = '';
	$scope.phonenumber = '';
	$scope.email = '';
	$scope.department = '';
	$scope.title = '';
	$scope.manager = '';
	
	$scope.currentUser = userService.editbyid($scope);

	$scope.$watch('fname',function() {$scope.test();});
	$scope.$watch('lname',function() {$scope.test();});
	$scope.$watch('age', function() {$scope.test();});
	$scope.$watch('sex', function() {$scope.test();});
	$scope.$watch('phonenumber', function() {$scope.test();});
	$scope.$watch('email', function() {$scope.test();});
	$scope.$watch('department', function() {$scope.test();});
	$scope.$watch('title', function() {$scope.test();});
	$scope.$watch('manager', function() {$scope.test();});	
	
	$scope.addfile = function() {
		$scope.nofile = false;
	};
	
	$scope.removefile = function() {
		$scope.nofile = true;
	};

	$scope.test = function() {
		$scope.notconfirm = true;
		$scope.phonecheck = checkMobile($scope.phonenumber);
		$scope.emailcheck = checkMail($scope.email);
		if($scope.phonecheck || $scope.phonenumber.length == 0 ){
			$scope.phoneshow = false;
		} else $scope.phoneshow = true;
		if($scope.emailcheck || $scope.email.length == 0 ){
			$scope.emailshow = false;
		} else $scope.emailshow = true;
		if( $scope.fname.length > 0 &&  $scope.lname.length > 0  && $scope.sex.length > 0 &&
			$scope.phonenumber.length > 0  && $scope.email.length > 0 &&
			$scope.department.length > 0 && $scope.title.length > 0 && $scope.manager.length > 0
			&& $scope.age > 0 && $scope.phonecheck && $scope.emailcheck
			)
			$scope.notconfirm = false;
	};

	
	$scope.editUser = function (e){
		if( e.length > 0 ){
			userService.changeImg(e[0], $scope);
		}
		userService.editUser($scope);
		$location.path('/');
	}
	
	$scope.cancle = function(){
		$location.path('/');
	}	
});

myApp.controller('searchCtrl', function($scope, $http, userService, $location, $anchorScroll) {	
	$scope.users = userService.getList($scope);
});

myApp.directive('dropdowndemo', [ 'userService', function(userService){
	var elementdiv = "<div>" +
                    " <select class='form-control input-lg dropdown'> "+
					" <option value=''>Name</option>" + 
					" <option ng-repeat='user in users' value='{{user.id}}'>{{user.fname+' '+user.lname+ '(' + user.department+', '+ user.title + ')'}}</option> "
                    " </select></div>";
	return{
		template: elementdiv,
		scope: true,
		link: function (scope, element, attrs) {
			scope.users = userService.getList(scope);
		}
	};
}]);

function checkMobile(str) {
	RegularExp=/^[0-9]{10}$/
	if (RegularExp.test(str)) {
		return true;
	}
	else {
		return false;
	}
}

function checkMail(str){
	RegularExp = /[a-z0-9]*@[a-z0-9]*\.[a-z0-9]+/gi
	if (RegularExp.test(str)){
		return true;
	}else{
		return false;
	}
}

function limitImage(ImgD){    
    var areaWidth = 50;    
    var areaHeight = 50;   
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

function limitPresentImage(ImgD){    
    var areaWidth = 200;    
    var areaHeight = 200;   
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