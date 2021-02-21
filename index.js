// ws://127.0.0.1:8000/socket.io/?EIO=3&transport=websocket
// ws://iso-tanks-server.herokuapp.com:80/socket.io/?EIO=3&transport=websocket

const io = require('socket.io')(process.env.PORT || 8000);
const Server = require("./Classes/Server");

const server = new Server();
setInterval(() => {
  server.onUpdate();
}, 100, 0);

io.on("connection", (socket) => {
  let connection = server.onConnected(socket);
  connection.createEvents();
  connection.socket.emit("register", {"id": connection.player.id});
});

function interval(func, wait, times) {
  var interv = function(w, t) {
    return function() {
      if(typeof t === "undefined" || t-- > 0) {
        setTimeout(interv, w);
        try {
          func.call(null);
        } catch (e) {
          t = 0;
          throw e.toString();
        }
      }
    };
  }(wait, times);

  setTimeout(interv, wait);
}