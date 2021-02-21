const { Decimal } = require("decimal.js");
const ServerObject = require("./ServerObject");
const Vector2 = require("./Vector2");

module.exports = class Bullet extends ServerObject {
  constructor() {
    super();
    this.direction = new Vector2();
    this.speed = new Decimal("0.5");
    this.isDestroyed = false;
    this.activator = "";
  }

  onUpdate() {
    this.position.x = this.position.x.plus(this.direction.x.times(this.speed));
    this.position.y = this.position.y.plus(this.direction.y.times(this.speed));
    return this.isDestroyed;
  }
}