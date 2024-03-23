/**
 * Component controlling enemy patrol movement
 * @see https://kaboomjs.com/play?example=platformer
 * @typedef {Object} PatrolConfig
 * @property {number} speed
 * @property {number} dir
 * @param {PatrolConfig} config
 * @returns
 */
export function patrol({ speed = 60, dir = 1 }) {
  return {
    id: "patrol",
    require: ["pos", "area"],
    add() {
      this.on("collide", (_, col) => {
        if (col.isLeft() || col.isRight()) {
          dir = -dir;
          this.flipX = dir < 0;
        }
      });
    },
    update() {
      this.move(speed * dir, 0);
    },
  };
}

/**
 * Component controlling moving objects from a central starting point
 * @typedef {Object} AlternateConfig
 * @property {number} speed
 * @property {number} distance
 * @property {number[]} dir
 * @param {AlternateConfig} config
 * @returns
 */
export function alternate({ speed = 60, distance = 100, dir = [1, 0] }) {
  let originalX;
  let originalY;
  return {
    id: "alternate",
    require: ["pos", "area"],
    update() {
      if (!originalX || !originalY) {
        originalX = this.pos.x;
        originalY = this.pos.y;
      }
      this.move(speed * dir[0], speed * dir[1]);
      const xDiff = Math.abs(this.pos.x - originalX);
      const yDiff = Math.abs(this.pos.y - originalY);
      if (xDiff > distance || yDiff > distance) {
        dir = dir.map((d) => -d);
      }
      this.flipX = dir[0] < 0;
    },
  };
}

/**
 * Component that destroys object on top collision with player
 * @returns
 */
export function stomp() {
  return {
    id: "stomp",
    require: ["pos", "area"],
    add() {
      this.on("collide", (obj, col) => {
        if (obj.is("player") && col.isTop()) {
          this.stomp();
        }
      });
    },
    stomp() {
      burp();
      shake(1);
      destroy(this);
    },
  };
}

/**
 * Component that damages player on non-top collisions
 * @typedef {Object} DangerConfig
 * @property {number} damage
 * @property {string} directions
 * @param {DangerConfig} config
 * @returns
 */
export function danger({ damage = 1, directions }) {
  const isDangerous = (col) => {
    return (
      (directions.includes("T") && col.isTop()) ||
      (directions.includes("B") && col.isBottom()) ||
      (directions.includes("L") && col.isLeft()) ||
      (directions.includes("R") && col.isRight()) ||
      false
    );
  };
  return {
    id: "danger",
    require: ["pos", "area"],
    add() {
      this.on("collide", (obj, col) => {
        if (obj.is("player") && isDangerous(col)) {
          if (obj.current === "ezra") return;
          obj.hurt(damage);
        }
      });
    },
  };
}
