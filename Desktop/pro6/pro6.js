// Include the Express module
var express = require('express');
var redis   = require("redis");
var path = require("path");
var bodyParser = require('body-parser');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
//var client  = redis.createClient();
//var flash = require('req-flash');

//multipart
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var mysql = require('mysql');

// Create an instance of Express
var app = express();
//socket.io
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('port',process.env.PORT||3000);
app.set('views',__dirname+'/views');
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'web')));
app.use(bodyParser({limit: '50mb'}));
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

//express session
app.use(cookieParser());
app.use(session({
    secret: 'ssshhhhh',
    store: new RedisStore({ host: '127.0.0.1', port: 6379}),
}));
//app.use(require('flash')());


//check login user auth
function isAuthenticated(req, res, next) {
//	console.log(req.session.loginuser);
    if (req.session.loginuser != undefined ){
		console.log(req.session.loginuser.username+" user are using !");
		return next();}
    res.redirect('/');
}

var conn = mysql.createConnection({
    host: 'dev1.valiantica.com',
    user: 'dev1',
    password: 'valiantica0515',
    database:'test',
    port: 3306
});
conn.connect();

app.get('/',function(req,res){
	res.render("index.html");
});

app.get('/signinsuccess', function(req,res){
	res.sendFile(__dirname + '/web/chatroom.html');
});

//login name and pwd check
app.post('/signin', function(req,res){
	//console.log("session: "+req.session);
	var checkQuery = " SELECT * FROM test.qs_employee where username ='"+req.body.username+"' and pwd='"+req.body.pwd+"' ";
	conn.query(checkQuery, function(err, rows) {
//		console.log(rows);
		if (err) console.log(err);
		else if(rows.length > 0) {
			req.session.loginuser = rows[0];
			res.json({logincheck:true, loginuser:rows[0]});
		} else res.json({logincheck:false, loginuser:''});
	});
});

// logout, delete sesssion
app.get('/logout', function(req, res){
	delete req.session.loginuser;
	res.json(true);
});

//get employee list
app.get('/employee',isAuthenticated, function(req,res){
	//console.log(req.session.loginuser);
	var getQuery = "SELECT e.*, (case when e.managerid is null then '' " +
	" else (select CONCAT(m.fname,' ',m.lname) from test.qs_employee m where m.id = e.managerid) end ) as managername, " +
	"(select count(id) from test.qs_employee r where e.id = r.managerid) as report " +
	" FROM test.qs_employee e ";
	conn.query(getQuery, function(err, rows) {
		if (err) console.log(err);
		res.send(rows);
	});
});

var users = [];
//socket.io
io.on('connection', function(socket){
	socket.on('online', function (data) {
		var doublecheck = false;
		socket.name = data.user;
		for( var i in users){
			if( users[i].id == data.user.id) doublecheck = true;
		}
		if( doublecheck == false){
			console.log(data.user.username+" into room");
			users.push(data.user);			
		}
		io.sockets.emit('online', {users: users, user: data.user, date: data.date});
	});
	socket.on('disconnect', function() {
		var doublecheck = false;
		if( socket.name == undefined){
			console.log('Timeout');
		} else {
			for( var i in users){
				if( users[i].id == socket.name.id){
					console.log(socket.name.username+" left room");
					users.splice(i,1);
				}
			}
			socket.broadcast.emit('offline', {users: users, user: socket.name});
		}
	});

	socket.on('chat message', function(msg){
//		console.log(msg);
		io.emit('chat message', msg);
	});
});



// error page
app.get('/:xxx', isAuthenticated, function(req, res){
	res.redirect('/');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
