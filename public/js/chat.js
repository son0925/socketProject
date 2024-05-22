const socket = io();


const query = new URLSearchParams(location.search);

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
  messages.insertAdjacentHTML('beforeend', html)
  scrollToBottom();
})


function scrollToBottom() {
  messages.scrollTop = messages.scrollHeight;
}