const express = require('express');
const path = require('path');
const http = require('http');
const port = process.env.PORT || 3000
const app = express();
const server = http.createServer(app)  //for our server to suport web sockets
const publicDirectoryPath = path.join(__dirname,'../public');
const socketio = require('socket.io')
const Filter = require('bad-words');
const {generateMessage,generateLocationMessage} = require('./utils/messages');
const {addUser,removeUser,getUser,getUsersInRoom} = require ('./utils/users.js')






const io = socketio(server);


io.on('connection',(socket)=>{
    console.log("Socket io client coenction");
   

    socket.on('join',({username,room},callback)=>{

        const {user,error} = addUser({id:socket.id,username,room})

        if(error){
            return callback(error)
        }
        
        socket.join(user.room);
        socket.emit('message',generateMessage("Admin","Welcome!"));
        socket.broadcast.to(user.room).emit('message',generateMessage("Admin",`${user.username} has joined!`))

        

        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })

        callback();

    })

    socket.on('sendMessage',(message,calback)=>{
        const filter = new Filter();
        if(filter.isProfane(message)){
            return calback('Profanity is not alowed')
        }

        const user = getUser(socket.id);
        io.to(user.room).emit('message',generateMessage(user.username,message))
        calback('Delivered')
    })

    

    socket.on('disconnect',()=>{
       const user = removeUser(socket.id);
       if(user){
        io.emit('message',generateMessage("Admin",`${user.username} left this chanel`));

        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
       }

       
       
    });

    socket.on('sendLocation',(cords,callback)=>{
      
        const user = getUser(socket.id)
        io.to(user.room).emit('sendLocation',generateLocationMessage(user.username,`https://www.google.com/maps/?q=${cords.latitude},${cords.longitude}`));

        callback();
    })


    

 
} )

app.use(express.static(publicDirectoryPath));

server.listen(port, () => console.log(`Example app listening on port ${port}!`))