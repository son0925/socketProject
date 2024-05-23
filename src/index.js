// express 모듈 호출 - 웹 애플리케이션을 만들기 위한 프레임워크
const express = require('express');
// express 객체 생성 - 라우팅 미들웨어 설정할 수 있다
const app = express();
// 절대 경로 지정 path 모듈 호출
const path = require('path');
// http 모듈 호출 - 클라이언트, 서버를 만드는 용도
const http = require('http');
// 인자가 app인 http 서버 생성
const server = http.createServer(app);
// Socket.io 모듈의 Server 클래스 호출
const { Server } = require('socket.io');
// users를 컨트롤하는 utils의 함수 호출
const { addUser, getUsersInRoom, getUser, removeUser } = require('./utils/users');
// message 컨트롤하는 utils의 함수 호출
const { generateMessage } = require('./utils/messages');
// http의 server를 인자로 한 Socket.io 모듈의 Server 객체 생성 (express와 socket.io를 같이 사용하기 위한 코드들이다)
const io = new Server(server);

// 정적 파일 경로 코드
const publicDirectoryPath = path.join(__dirname, '../public')
// 정적 파일 제공하는 미들웨어
app.use(express.static(publicDirectoryPath));

// 클라이언트와 서버가 connection했을 때 실행
io.on('connection', (socket) => {

  // 클라이언트가 join을 보냈을 때 처리하는 코드
  // join은 클라이언트가 socket에 접근했을 때 자동으로 실행된다
  socket.on('join', (option, callback) => {
    // id, 구조분해한 option을 addUser함수의 인자로 넣어 처리함
    // error 혹은 user의 값으로 return한다
    const { error, user } = addUser({id: socket.id, ...option})
    
    // 만약 addUser가 error값을 주었을 때
    if (error) {
      // 클라이언트로 callback을 주어 처리하게 한다
      return callback(error)
    }
    // error의 값이 없다면 socket으로 해당 방 소켓으로 join시켜준다
    socket.join(user.room);

    // 해당 클라이언트에게 메세지를 보낸다
    socket.emit('message', generateMessage('Admin', `${user.room}방에 오신 걸 환영합니다`))
    // 해당 유저를 제외한 유저들에게 메세지를 보낸다
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username}님이 방에 참여했습니다`))

    // 해당 방에 있는 클라이언트에게 새로 수정된 방 정보를 제공한다
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })
  });


  socket.on('sendMessage', (message, callback) => {
    // socket.id와 맞는 유저의 정보를 가져온다
    const user = getUser(socket.id);
    // 그 유저의 방에 메세지를 보낸다
    io.to(user.room).emit('message', generateMessage(user.username, message));
    callback();
  });

// 클라이언트가 서버 종료를 했을 때
  socket.on('disconnect', () => {
    // 배열에서 삭제한 유저의 데이터를 가져와서 저장한다
    const user = removeUser(socket.id);
    
    // 만약 유저가 있다면
    if (user) {
      // 유저가 있었던 방에 메세지를 보낸다
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username}님이 방을 나갔습니다`))
      // 유저가 나갔기 때문에 방 정보를 다시 수정해서 보낸다
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  });
})




// 서버 포트와 리스너
const port = 4000;
server.listen(port, () => {
  console.log('서버 열기 성공')
})