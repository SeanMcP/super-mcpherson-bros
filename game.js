/** @typedef { import("./node_modules/kaboom/dist/global") } */
import kaboom from "./node_modules/kaboom/dist/kaboom.mjs";
import * as components from "./components.js";

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
loadSprite("end-flag", "sprites/flag.png");

// add
setBackground(200, 200, 200);

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

setGravity(1600);

function setupPlayer(player) {
  player.on("hurt", () => {
    play("ow");
    healthBar.value--;
    healthBar.text = "Health: " + healthBar.value;
  });

  player.on("death", () => {
    destroy(player);

    add([text("Game Over!"), pos(width() / 2, height() / 2)]);
  });

  player.onGround(() => {
    if (!isKeyDown("left") && !isKeyDown("right")) {
      player.play("idle");
    } else {
      player.play("run");
    }
  });

  player.onUpdate(() => {
    if (player.pos.x < 0) {
      player.pos.x = 0;
    }
    camPos(player.pos);
  });

  // on key events
  onKeyPress("space", () => {
    if (player.current === "sam" && player.isGrounded()) {
      player.play("jump");
      player.jump();
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
    const flipX = player.flipX;

    if (player.current === "sam") {
      player.use(sprite("ezra"));
      player.current = "ezra";
    } else {
      player.use(sprite("sam"));
      player.current = "sam";
    }

    player.play(anim);
    player.flipX = flipX;
  });
}

function setupCollisions() {
  onCollide("player", "gem", (_, gem) => {
    play("ding");
    score.value++;
    score.text = "Score: " + score.value;
    destroy(gem);
  });

  onCollide("player", "box", (player, box) => {
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

  onCollide("player", "end-flag", () => {
    console.log("You win!");
  });
}

const scenes = {
  first: () => {
    const level = addLevel(
      [
        "=============================",
        "=                      F   $=",
        "=                          $=",
        "=           $$         =   $=",
        "= %       ====         =   $=",
        "=                      =    =",
        "=   B   ^^      = 0    =   E=",
        "=============================",
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
          "%": () => [
            "player",
            sprite("sam"),
            health(healthBar.value),
            pos(),
            area(),
            body(),
            { current: "sam" },
          ],
          B: () => ["box", sprite("box"), area(), body({ isStatic: true })],
          "=": () => [sprite("brick"), area(), body({ isStatic: true })],
          $: () => ["gem", sprite("gem"), area()],
          "^": () => [
            sprite("spikes"),
            area(),
            body({ isStatic: true }),
            components.danger({ directions: "T" }),
          ],
          0: () => [
            sprite("bad-ball"),
            area(),
            body(),
            components.patrol({}),
            components.stomp({}),
            components.danger({ directions: "BLR" }),
          ],
          F: () => [
            sprite("flying-fish", { anim: "fly" }),
            area(),
            body({
              gravityScale: 0,
            }),
            "flying-fish",
            components.alternate(60, 100, [1, 0]),
            components.stomp({}),
            components.danger({ directions: "BLR" }),
          ],
          E: () => [
            "end-flag",
            sprite("end-flag"),
            area(),
            body({ isStatic: true }),
          ],
        },
      }
    );
    const [player] = level.get("player");
    setupPlayer(player);
    setupCollisions();
  },
  test: () => {
    add([
      "platform",
      sprite("brick"),
      area(),
      pos(0, 0),
      body({ isStatic: true }),
      components.alternate(),
    ]);
    add([
      "platform",
      sprite("brick"),
      area(),
      pos(100, 100),
      body({ isStatic: true }),
      components.alternate({ dir: [0, 1] }),
    ]);
  },
};

for (const [name, fn] of Object.entries(scenes)) {
  scene(name, fn);
}

go("first");
