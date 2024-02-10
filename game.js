// import kaboom lib
import kaboom from "./kaboom.mjs";

// initialize kaboom context
kaboom();

// load sounds
loadSound("ding", "sounds/ding.mp3");
loadSound("ow", "sounds/ow.mp3");

// load sprites
loadSprite("brick", "sprites/brick.png");
loadSprite("gem", "sprites/gem.png");
loadSprite("sam", "sprites/sam.png");
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
    "    $                      ",
    "    =                      ",
    "           =               ",
    "                   =       ",
    "   ^^^                   ^^",
    "==========================="
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
const sam = add(["sam", sprite("sam"), health(20), pos(0, 0), area(), body()]);

setGravity(1600);

onCollide("sam", "spikes", (sam) => {
  play("ow");
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
  console.log("Ouch!");
});

sam.on("death", () => {
  console.log("Game Over!");
  destroy(sam);
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
