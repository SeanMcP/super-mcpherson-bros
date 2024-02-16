/** @typedef { import("./node_modules/kaboom/dist/global") } */
import kaboom from "./node_modules/kaboom/dist/kaboom.mjs";

// initialize kaboom context
kaboom();

// load sounds
loadSound("ding", "sounds/ding.mp3");
loadSound("ow", "sounds/ow.mp3");

// load sprites
loadSprite("brick", "sprites/brick.png");
loadSprite("bad-ball", "sprites/bad-ball.png");
loadSprite("ezra", "sprites/ezra.png");
loadSprite("gem", "sprites/gem.png");
loadSprite("sam", "sprites/sam-2.png");
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
        this.move(100, 0);
      } else {
        this.move(-100, 0);
      }
    },
    squash() {
      burp();
      this.isAlive = false;
      this.stop();
      destroy(this);
    }
  }
}

const score = add([
  text("Score: 0"),
  pos(12, 12),
  {
    value: 0,
  },
]);

addLevel(
  [
    "                          $",
    "                          $",
    "           $$         =   $",
    "  %      ====         =   $",
    "                      =    ",
    "       ^^      = 0    =   &",
    "===========================",
    "                           ",
    "                           ",
    "    $                      ",
    "    =      $               ",
    "           =               ",
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
      "=": () => [sprite("brick"), area(), body({ isStatic: true })],
      $: () => ["gem", sprite("gem"), area(), pos(0, -9)],
      "^": () => [sprite("spikes"), area(), "ouch"],
      "0": () => [sprite("bad-ball"), area(), "ouch", body(), enemy()],
    },
  }
);
const player = add(["player", sprite("sam"), health(3), pos(0, 0), area(), body()]);
player._current = "sam";

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

  add([
    text("Game Over!"),
    pos(width() / 2, height() / 2),
  ]);
});

let canSquash = false;

onUpdate(() => {
  if (player.isGrounded()) {
    canSquash = false;
  }
});

onCollide("player", "ouch", (_, ouch) => {
  if (ouch.isAlive && canSquash && ouch.squash) {
    ouch.squash();
  } else {
    if (player._current === "ezra") {
      return;
    }
    player.hurt(1);
  }
})

// on key events
onKeyPress("space", () => {
  if (player._current === "sam" && player.isGrounded()) {
    player.jump();
    canSquash = true;
  }
});

onKeyDown("right", () => {
  player.move(400, 0);
});

onKeyDown("left", () => {
  player.move(-400, 0);
});

// Switch between characters
onKeyPress("shift", () => {
  if (player._current === "sam") {
    player.use(sprite("ezra"));
    player._current = "ezra";
  } else {
    player.use(sprite("sam"));
    player._current = "sam";
  }
});
