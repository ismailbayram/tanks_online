const LobbyBase = require("./LobbyBase");
const GameLobbySettings = require("./GameLobbySettings");
const Connection = require("../Connection");
const Bullet = require("../Bullet");
const Decimal = require("decimal.js");

module.exports = class GameLobby extends LobbyBase {
  constructor(id, settings = GameLobbySettings) {
    super(id);
    this.settings = settings;
    this.bullets = [];
  }

  onUpdate() {
    let lobby = this;

    lobby.updateBullets();
    lobby.updateDeadPlayers();
  }

  canEnterLobby(connection = Connection) {
    let lobby = this;
    let maxPlayerCount = lobby.settings.maxPlayerCount;
    let currentPlayerCount = lobby.connections.length;

    if(currentPlayerCount + 1 > maxPlayerCount) {
      return false;
    }

    return true;
  }

  onEnterLobby(connection = Connection) {
    let lobby = this;
    super.onEnterLobby(connection);
    lobby.addPlayer(connection);
  }

  onLeaveLobby(connection = Connection) {
    let lobby = this;
    super.onLeaveLobby(connection);
    lobby.removePlayer(connection);
  }

  updateBullets() {
    let lobby = this;
    let bullets = lobby.bullets;
    let connections = lobby.connections;

    bullets.forEach(bullet => {
      var isDestroyed = bullet.onUpdate();
  
      // remove
      if(isDestroyed) {
        lobby.despawnBullet(bullet);
      } else {
        // var returnData = {
        //   id: bullet.id,
        //   position: bullet.position.GetFixed()
        // };

        // connections.forEach(connection => {
        //   connection.socket.emit("updatePosition", returnData);
        // });
      }
    });
  }

  updateDeadPlayers() {
    let lobby = this;
    let connections = lobby.connections;
    connections.forEach(connection => {
      let player = connection.player;
      if (player.isDead) {
        let isRespawn = player.respawnCounter();
        if (isRespawn) {
          let socket = connection.socket;
          let returnData = {
            id: player.id,
            position: player.position.GetFixed()
          }
  
          socket.emit("playerRespawn", returnData);
          socket.broadcast.to(lobby.id).emit("playerRespawn", returnData);
        }
      }
    });
  }

  onFireBullet(connection = Connection, data) {
    let lobby = this;
    let bullet = new Bullet();
    bullet.name = 'Bullet';
    bullet.activator = data.activator;
    bullet.position.x = new Decimal(data.position.x);
    bullet.position.y = new Decimal(data.position.y);
    bullet.direction.x = new Decimal(data.direction.x);
    bullet.direction.y = new Decimal(data.direction.y);

    lobby.bullets.push(bullet);

    var returnData = {
      name: bullet.name,
      id: bullet.id,
      activator: bullet.activator,
      position: bullet.position.GetFixed(),
      direction: bullet.direction.GetFixed(),
      speed: bullet.speed
    }
    let socket = connection.socket;
    socket.emit('serverSpawn', returnData);
    socket.broadcast.to(lobby.id).emit('serverSpawn', returnData);
  }

  onCollisionDestroy(connection = Connection, data) {
    let lobby = this;
    let returnBullets = lobby.bullets.filter(bullet => {
      return bullet.id == data.id;
    });

    // we will mostly only have on entry but just in case loop through all and set to destroyed
    returnBullets.forEach(bullet => {
      let playerHit = false;
      // Check if we hit someone that is not us

      lobby.connections.forEach(c => {
        let player = c.player;
        if(bullet.activator != player.id) {
          let distance = bullet.position.Distance(player.position);
          if (distance.lessThan(0.5)) {
            playerHit = true;
            let isDead = player.dealDamage(50); // Take half of their health for testing
            if (isDead) {
              let returnData = {
                id: player.id
              }
              c.socket.emit("playerDied", returnData);
              c.socket.broadcast.to(lobby.id).emit("playerDied", returnData);
            }
            lobby.despawnBullet(bullet);
          }
        }
      });
      if(!playerHit) {
        bullet.isDestroyed = true;
      } 
    });
  }

  despawnBullet(bullet = Bullet) {
    let lobby = this;
    let bullets = lobby.bullets;
    let connections = lobby.connections;

    var index = bullets.indexOf(bullet);
    if(index > -1) {
      bullets.splice(index, 1);

      var returnData = {
        id: bullet.id
      };

      connections.forEach(c => {
        c.socket.emit("serverUnspawn", returnData);
      });
    }
  }

  addPlayer(connection = Connection) {
    let lobby = this;
    let connections = lobby.connections;
    let socket = connection.socket;

    var returnData = {
      id: connection.player.id
    }

    socket.emit('spawn', returnData); //tell myself I have spawned
    socket.broadcast.to(lobby.id).emit('spawn', returnData); // Tell others

    //Tell myself about everyone else already in the lobby
    connections.forEach(c => {
      if(c.player.id != connection.player.id) {
        socket.emit('spawn', {
          id: c.player.id
        });
      }
    });
  }

  removePlayer(connection = Connection) {
    let lobby = this;
    connection.socket.broadcast.to(lobby.id).emit('disconnected', {
      id: connection.player.id
    });
  }
}