const port = 80;

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users=[];

app.get('/',(req,res)=>{
	res.sendFile(__dirname + '/index.html');
});

io.on('connection',(socket)=>{
	//join api
	socket.leave(socket.id);
	socket.on('setUsername',(data)=>{
		if(users.indexOf(data)==-1){
			users.push(data);
			socket.newUser = data;
			socket.emit('userSet',{username:data,rooms:io.nsps['/'].adapter.rooms});
		} else{
			socket.emit('userExist', data + ' username is taken! Try some other username.');
		}
	})
	//Rooms api
	socket.on('getrooms',(room)=>{
		socket.leave(room);
		socket.emit('sendingrooms',io.nsps['/'].adapter.rooms);
	});
	socket.on('createroom',(data)=>{
		if(data){
			socket.join(data);
		}
		else{
			socket.join(socket.newUser+"'s chat");
		}
	})
	//message api
	socket.on('groupmsg',(msg)=>{
		io.in(msg.room).emit('newmsg',msg);
	});
	/*socket.on('msg',(data)=>{
		io.sockets.emit('newmsg',data);
	})*/
	socket.on('disconnect',()=>{
		users.splice(users.indexOf(socket.newUser));
	})
})

http.listen(port,()=>{
	console.log(`Example app listening at http://localhost:${port}`)
});