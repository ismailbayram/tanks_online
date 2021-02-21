const shordID = require('shortid');
const Vector2 = require('./Vector2');
var Decimal = require('decimal.js');

module.exports = class Player {
  constructor() {
    this.username = 'Default_Player';
    this.id = shordID.generate();
    this.lobby = 0;
    this.position = new Vector2();
    this.tankRotation = new Decimal("0.000");
    this.barrelRotation = new Decimal("0.000");
    this.health = new Number(100);
    this.isDead = false;
    this.respawnTicker = new Number(0);
    this.respawnTime = new Number(0);
  }

  displayPlayerInformation() {
    let player = this;
    return '(' + player.username + ':' + player.id + ')';
  }

  respawnCounter() {
    this.respawnTicker = this.respawnTicker + 1;

    if (this.respawnTicker >= 10) {
      this.respawnTicker = new Number();
      this.respawnTime = this.respawnTime + 1;

      if (this.respawnTime >= 3) {
        this.isDead = false;
        this.respawnTicker = new Number(0);
        this.respawnTime = new Number(0);
        this.health = new Number(100);
        this.position = new Vector2(-2, -2);

        return true;
      }
    }

    return false;
  }

  dealDamage(amount = Number) {
    // Adjust the health on getting hit
    this.health = this.health - amount;

    // Check if we are dead
    if(this.health <= 0) {
      this.isDead = true;
      this.respawnTicker = new Number(0);
      this.respawnTime = new Number(0);
    }

    return this.isDead;
  }
}