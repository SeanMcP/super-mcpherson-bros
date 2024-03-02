/** @typedef { import("./node_modules/kaboom/dist/global") } */
import kaboom from "./node_modules/kaboom/dist/kaboom.mjs";

// initialize kaboom context
kaboom();

// load sounds
loadSound("box-break", "sounds/box-break.wav");
loadSound("ding", "sounds/ding.mp3");
loadSound("ow", "sounds/ow.mp3");

// load sprites
loadSprite("brick", "sprites/brick.png");
loadSprite("bad-ball", "sprites/bad-ball.png");
loadSprite("box", "sprites/box.png");
loadSprite("ezra", "sprites/ezra.png", {
  sliceX: 4,
  anims: {
    idle: {
      from: 0,
      to: 1,
      speed: 5,
      loop: true,
    },
    run: {
      from: 2,
      to: 3,
      speed: 10,
      loop: true,
    },
    jump: 2,
  },
});
loadSprite("flying-fish", "sprites/flying-fish.png", {
  sliceX: 2,
  anims: {
    fly: {
      from: 0,
      to: 1,
      speed: 5,
      loop: true,
    },
  },
});
loadSprite("gem", "sprites/gem.png");
loadSprite("sam", "sprites/sam-2.png", {
  sliceX: 4,
  anims: {
    idle: {
      from: 0,
      to: 1,
      speed: 5,
      loop: true,
    },
    run: {
      from: 2,
      to: 3,
      speed: 10,
      loop: true,
    },
    jump: 2,
  },
});
loadSprite("spikes", "sprites/spikes.png");

// add
setBackground(200, 200, 200);

function enemy() {
  return {
    id: "enemy",
    require: ["pos", "area", "body", "sprite"],
    isAlive: true,
    moveCount: 0,
    direction: "right",
    update() {
      if (!this.isAlive) {
        return;
      }

      // move left and right on a 2000 space patrol
      this.moveCount++;
      if (this.moveCount % 100 === 0) {
        this.direction = this.direction === "right" ? "left" : "right";
        this.moveCount = 0;
      }
      if (this.direction === "right") {
        this.flipX = false;
        this.move(100, 0);
      } else {
        this.flipX = true;
        this.move(-100, 0);
      }
    },
    squash() {
      burp();
      this.isAlive = false;
      this.stop();
      destroy(this);
    },
  };
}

const score = add([
  text("Score: 0"),
  pos(12, 12),
  {
    value: 0,
  },
]);

const healthBar = add([
  text("Health: 5"),
  pos(240, 12),
  {
    value: 5,
  },
]);

addLevel(
  [
    "                      F   $",
    "                          $",
    "           $$         =   $",
    "  %      ====         =   $",
    "                      =    ",
    "   B   ^^      = 0    =   &",
    "===========================",
    "                           ",
    "                           ",
    "    $                      ",
    "    =      $               ",
    "           =       ^       ",
    "                   =       ",
    "   ^^^             0     ^^",
    "===========================",
    "                           ",
    "                   $       ",
    "    $              =       ",
    "    =      $   =           ",
    "           =       $       ",
    "                   =       ",
    "^^^^^^      $$$$      ^^^^^",
    "===========================",
  ],
  {
    // define the size of tile block
    tileWidth: 32,
    tileHeight: 32,
    // define what each symbol means, by a function returning a component list (what will be passed to add())
    tiles: {
      B: () => ["box", sprite("box"), area(), body({ isStatic: true })],
      "=": () => [sprite("brick"), area(), body({ isStatic: true })],
      $: () => ["gem", sprite("gem"), area(), pos(0, -9)],
      "^": () => [sprite("spikes"), area(), "ouch"],
      0: () => [sprite("bad-ball"), area(), "ouch", body(), enemy()],
      F: () => [
        sprite("flying-fish", { anim: "fly" }),
        area(),
        "ouch",
        body({
          gravityScale: 0,
        }),
        enemy(),
        "flying-fish",
      ],
    },
  }
);
const player = add([
  "player",
  sprite("sam"),
  health(healthBar.value),
  pos(0, 0),
  area(),
  body(),
]);
player._current = "sam";
player.play("idle");

setGravity(1600);

onCollide("player", "gem", (_, gem) => {
  play("ding");
  console.log("You got a gem!");
  score.value++;
  score.text = "Score: " + score.value;
  destroy(gem);
});

player.on("hurt", () => {
  play("ow");
  console.log("Ouch!");
});

player.on("death", () => {
  console.log("Game Over!");
  destroy(player);

  add([text("Game Over!"), pos(width() / 2, height() / 2)]);
});

let canSquash = false;

onUpdate(() => {
  if (player.isGrounded()) {
    canSquash = false;
  }
});

player.onGround(() => {
  console.log("On the ground!");
  if (!isKeyDown("left") && !isKeyDown("right")) {
    player.play("idle");
  } else {
    player.play("run");
  }
});

player.onUpdate(() => {
  camPos(player.pos);
});

onCollide("player", "ouch", (_, ouch) => {
  if (ouch.isAlive && canSquash && ouch.squash) {
    ouch.squash();
  } else {
    if (player._current === "ezra") {
      return;
    }
    player.hurt(1);
    healthBar.value--;
    healthBar.text = "Health: " + healthBar.value;
  }
});

onCollide("box", "player", (box, player) => {
  if (player.pos.y < box.pos.y) {
    add([
      "gem",
      sprite("gem"),
      area(),
      pos(box.pos.x + (Math.random() > 0.5 ? 50 : -50), box.pos.y),
      "gem",
    ]);
    play("box-break");
    destroy(box);
  }
});

// on key events
onKeyPress("space", () => {
  if (player._current === "sam" && player.isGrounded()) {
    player.play("jump");
    player.jump();
    canSquash = true;
  }
});

onKeyDown("right", () => {
  player.flipX = false;
  player.move(400, 0);
  if (player.isGrounded() && player.curAnim() !== "run") {
    player.play("run");
  }
});

onKeyDown("left", () => {
  player.flipX = true;
  player.move(-400, 0);
  if (player.isGrounded() && player.curAnim() !== "run") {
    player.play("run");
  }
});

["left", "right"].forEach((key) => {
  onKeyRelease(key, () => {
    // Only reset to "idle" if player is not holding any of these keys
    if (player.isGrounded() && !isKeyDown("left") && !isKeyDown("right")) {
      player.play("idle");
    }
  });
});

// Switch between characters
onKeyPress("shift", () => {
  const anim = player.curAnim();

  if (player._current === "sam") {
    player.use(sprite("ezra"));
    player._current = "ezra";
  } else {
    player.use(sprite("sam"));
    player._current = "sam";
  }

  player.play(anim);
});
