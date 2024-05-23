const socket = io();

// url에 있는 ?~~~의 데이터를 가져와서 파싱한 객체 생성
const query = new URLSearchParams(location.search);
// URLSearchParams는 iterable객체이기 때문에 get사용
const username = query.get('username');
const room = query.get('room');


socket.emit('join', {username, room}, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
})

const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

socket.on('roomData', ({room, users}) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML = html;
})

const messageTemplate = document.querySelector('#message-template').innerHTML;
const messages = document.querySelector('#messages');
socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createAt).format('h:mm a')
  })
  // 위에서 부터 순서대로 insert해주는 함수
  messages.insertAdjacentHTML('beforeend', html)
  scrollToBottom();
})


function scrollToBottom() {
  messages.scrollTop = messages.scrollHeight;
}

const messageForm = document.querySelector('#message-form');
const messageFormInput = document.querySelector('input');
const messageFormButton = document.querySelector('button');

messageForm.addEventListener('submit', (e) => {
  // form을 제출하면 화면이 새로고침이 된다
  // 그것을 막고 내부적 script를 실행하기 위한 코드
  e.preventDefault();

  // 버튼 조작 불가능하게 하는 코드
  messageFormButton.setAttribute('disabled','disabled');
  const message = e.target.elements.message.value;

  socket.emit('sendMessage', message, (error) => {
    messageFormButton.removeAttribute('disabled');
    messageFormInput.value = '';
    // 클라이언트가 채팅을 보내면 다시 채팅을 바로 칠 수 있게 하는 코드
    messageFormInput.focus();

    if (error) {
      return console.log(error);
    }
  })
})