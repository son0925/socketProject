// DB 역할 수행
const users = []

// 클라이언트와 서버의 join 이벤트 중 실행 함수
const addUser = ({id, username, room}) => {
  // trim 사용 시 문자열이 undefined라면 오류 그리고 이름과 방 이름은 필수이기 때문
  if(!username || !room) {
    return {
      // join 이벤트에서 if (error) 일 때를 위한 코드
      error: '사용자 이름과 방이 필요합니다'
    }
  }
  // username, room을 좌우로 빈칸 지우기
  username = username.trim();
  room = room.trim();

  
  // 배열에 존재하는 users들을 find함수와 콜백함수 조건문으로 조건에 맞는 user을 찾는다
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username
  })

  // 만약 존재한다면 중복 이름으로 return error로 처리한다
  if (existingUser) {
    return {
      error: "사용자 이름이 사용 중입니다"
    }
  }
  // 중복되지 않는다면 user를 객체로 만들어 속성으로 id, username, room을 만든다
  const user = {id, username, room}
  // 배열에 저장
  users.push(user)
  // user를 리턴한다 const { error, user } 이 형식으로 받기 때문에 { user }로 리턴
  return {user} 
}

const getUsersInRoom = (room) => {
  // 같은 방에 존재하는 username을 리턴한다
  room = room.trim();
  return users.filter((user) => user.room === room)
}

const getUser = (id) => {
  // socket.id에 해당하는 유저를 찾고 return
  return users.find(user => user.id === id);
}

// 클라이언트가 socket연결을 종료 했을 때
const removeUser = (id) => {
  // 배열에서 찾고 해당 유저를 삭제한다
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    // 해당 유저를 삭제하고 [0]은 삭제한 유저의 데이터를 return한다
    return users.splice(index, 1)[0]
  }
}

// 함수 내보내기
module.exports = {
  addUser,
  getUsersInRoom,
  getUser,
  removeUser
}