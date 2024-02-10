// import kaboom lib
import kaboom from "./kaboom.mjs";

// initialize kaboom context
kaboom();

// load sprites
loadSprite("brick", "sprites/brick.png");
loadSprite("gem", "sprites/gem.png");
loadSprite("sam", "sprites/sam.png");
loadSprite("spikes", "sprites/spikes.png");

// add

addLevel(
  [
    "                          $",
    "                          $",
    "           $$         =   $",
    "  %      ====         =   $",
    "                      =    ",
    "       ^^      = >    =   &",
    "===========================",
  ],
  {
    // define the size of tile block
    tileWidth: 32,
    tileHeight: 32,
    // define what each symbol means, by a function returning a component list (what will be passed to add())
    tiles: {
      "=": () => [sprite("brick"), area(), body({ isStatic: true })],
      $: () => [sprite("gem"), area(), pos(0, -9)],
      "^": () => [sprite("spikes"), area(), "danger"],
    },
  }
);
const sam = add([sprite("sam"), pos(0, 0), area(), body()]);

setGravity(1600);

// on key events
onKeyPress("space", () => {
  sam.jump();
});

onKeyDown("right", () => {
  sam.move(400, 0);
});

onKeyDown("left", () => {
  sam.move(-400, 0);
});
