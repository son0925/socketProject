const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const { addUser } = require('./utils/users');
const { generateMessage } = require('./utils/messages');
const io = new Server(server);

const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath));


io.on('connection', (socket) => {

  socket.on('join', (option, callback) => {
    const { error, user } = addUser({id: socket.id, ...option})
    if (error) {
      return callback(error)
    }
    socket.join(user.room);

    socket.emit('message', generateMessage('Admin', `${user.room}방에 오신 걸 환영합니다`))
    socket.broadcast.to(user.room).emit('message', generateMessage('', `${user.username}님이 방에 참여했습니다`))

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })
  });


  socket.on('sendMessage', () => {});
  socket.on('disconnect', () => {});
})





const port = 4000;
server.listen(port, () => {
  console.log('서버 열기 성공')
})