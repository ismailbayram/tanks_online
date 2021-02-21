var Decimal = require('decimal.js');

module.exports = class Vector2 {
  constructor(X = "0.000", Y = "0.000") {
    this.x = new Decimal(X);
    this.y = new Decimal(Y);
  }

  Magnitude() {
    return this.x.toPower(2).plus(this.y.toPower(2)).squareRoot();
  }

  Normalized() {
    let mag = this.Magnitude();
    return new Vector2(this.x.dividedBy(mag), this.y.dividedBy(mag));
  }

  Distance(Other = Vector2) {
    let direction = new Vector2();
    direction.x = Other.x.minus(this.x);
    direction.y = Other.y.minus(this.y);
    return direction.Magnitude();
  }

  ConsoleOutput() {
    return '(' + this.x + ', ' + this.y + ')';
  }

  GetFixed(decimal = 3) {
    return {
      x: this.x.toFixed(decimal),
      y: this.y.toFixed(decimal),
    }
  }
}