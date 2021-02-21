const Decimal = require('decimal.js');

module.exports = class Connection {
  constructor() {
    this.socket;
    this.player;
    this.server;
    this.lobby;
  }

  createEvents() {
    let connection = this;
    let socket = connection.socket;
    let server = connection.server;
    let player = connection.player;

    socket.on("disconnect", () => {
      server.onDisconnected(connection);
    });
    
    socket.on("joinGame", () => {
      server.onAttemptToJoinGame(connection);
    });

    socket.on("fireBullet", data => {
      connection.lobby.onFireBullet(connection, data);
    });

    socket.on("collisionDestroy", data => {
      connection.lobby.onCollisionDestroy(connection, data);
    });

    socket.on("updatePosition", data => {
      player.position.x = new Decimal(data.position.x);
      player.position.y = new Decimal(data.position.y);
      socket.broadcast.to(connection.lobby.id).emit('updatePosition', player); 
    });

    socket.on("updateRotation", data => {
      player.tankRotation = new Decimal(data.tankRotation);
      player.barrelRotation = new Decimal(data.barrelRotation);
      socket.broadcast.to(connection.lobby.id).emit('updateRotation', player);
    });
  }
}