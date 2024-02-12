// import kaboom lib
import kaboom from "./kaboom.mjs";

// initialize kaboom context
kaboom();

// load sounds
loadSound("ding", "sounds/ding.mp3");
loadSound("ow", "sounds/ow.mp3");

// load sprites
loadSprite("brick", "sprites/brick.png");
loadSprite("ezra", "sprites/ezra.png");
loadSprite("gem", "sprites/gem.png");
loadSprite("sam", "sprites/sam-2.png");
loadSprite("spikes", "sprites/spikes.png");

// add
setBackground(200, 200, 200);

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
    "       ^^      = >    =   &",
    "===========================",
    "                           ",
    "                           ",
    "    $                      ",
    "    =      $               ",
    "           =               ",
    "                   =       ",
    "   ^^^                   ^^",
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
      "^": () => [sprite("spikes"), area(), "spikes"],
    },
  }
);
let sam = add(["sam", sprite("sam"), health(3), pos(0, 0), area(), body()]);
sam._current = "sam";

setGravity(1600);

onCollide("sam", "spikes", (sam) => {
  sam.hurt(1);
});

onCollide("sam", "gem", (_, gem) => {
  play("ding");
  console.log("You got a gem!");
  score.value++;
  score.text = "Score: " + score.value;
  destroy(gem);
});

sam.on("hurt", () => {
  play("ow");
  console.log("Ouch!");
});

sam.on("death", () => {
  console.log("Game Over!");
  destroy(sam);

  const gameOver = add([
    text("Game Over!"),
    pos(width() / 2, height() / 2),
    // origin("center"),
  ]);

  onKeyPress("r", () => {
    sam = add(["sam", sprite("sam"), health(3), pos(0, 0), area(), body()]);
    destroy(gameOver);
  });
});

// on key events
onKeyPress("space", () => {
  if (sam.isGrounded()) {
    sam.jump();
  }
});

onKeyDown("right", () => {
  sam.move(400, 0);
});

onKeyDown("left", () => {
  sam.move(-400, 0);
});

onKeyPress("shift", () => {
  if (sam._current === "sam") {
    sam.use(sprite("ezra"));
    sam._current = "ezra";
  } else {
    sam.use(sprite("sam"));
    sam._current = "sam";
  }
});
