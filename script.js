window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const CANVAS_WIDTH = (canvas.width = 1672.5);
  const CANVAS_HEIGHT = (canvas.height = 945);

  const backgroundMusic = new Audio();
  backgroundMusic.src = "./Public/Audio/backgrounMusic.mp3";
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.75;

  const scoreEl = document.getElementById("scoreEl");
  const metersEl = document.getElementById("metersEl");
  const startGameEl = document.getElementById("startGameEl");
  const startGameBtn = document.getElementById("startGameBtn");
  const restartGameEl = document.getElementById("restartGameEl");
  const restartGameBtn = document.getElementById("restartGameBtn");

  let score = 0;
  let metersTraveled = 0;
  let drops = [];
  let explosions = [];
  let enemies = [];
  const enemyTypes = [
    "car",
    "taxi",
    "audi",
    "truck",
    "police",
    "minivan",
    "ambulance",
    "minitruck",
  ];

  class InputHandler {
    constructor() {
      this.codes = [];
      window.addEventListener("keydown", ({ code }) => {
        if (player.health > 0 || player.fuel > 0) {
          if (
            (code === "KeyW" ||
              code === "KeyS" ||
              code === "KeyA" ||
              code === "KeyD") &&
            !this.codes.includes(code)
          ) {
            this.codes.push(code);
          }
        }
      });
      window.addEventListener("keyup", ({ code }) => {
        if (
          code === "KeyW" ||
          code === "KeyS" ||
          code === "KeyA" ||
          code === "KeyD"
        ) {
          this.codes.splice(this.codes.indexOf(code), 1);
        }
      });
      startGameBtn.addEventListener("click", function () {
        startGameEl.style.display = "none";
        backgroundMusic.play();
        init();
      });
      restartGameBtn.addEventListener("click", function () {
        restartGameEl.style.display = "none";
        init();
      });
    }
  }

  class Bezel {
    constructor() {
      this.pos = { x: 0, y: 0 };
      this.spriteWidth = 669;
      this.spriteHeight = 420;
      this.width = this.spriteWidth * 2.5;
      this.height = this.spriteHeight * 2.25;
      this.image = document.getElementById("bezel");
    }
    draw() {
      ctx.drawImage(
        this.image,
        this.pos.x,
        this.pos.y,
        this.width,
        this.height
      );
    }
  }

  class Background {
    constructor() {
      this.spriteWidth = 840;
      this.spriteHeight = 650;
      this.width = this.spriteWidth * 1.5;
      this.height = this.spriteHeight * 1.5;
      this.x = CANVAS_WIDTH / 2 - this.width / 2;
      this.y = 0;
      this.image = document.getElementById("background");
    }
    update() {
      this.y += gameSpeed;
      if (this.y >= this.height) this.y = 0;
      this.draw();
    }
    draw() {
      ctx.drawImage(
        this.image,
        this.x,
        this.y - (gameSpeed ? gameSpeed : 5),
        this.width,
        this.height
      );
      ctx.drawImage(
        this.image,
        this.x,
        this.y - this.height,
        this.width,
        this.height
      );
    }
  }

  class Player {
    constructor() {
      this.maxFuel = 100;
      this.fuel = this.maxFuel;
      this.fuelDecrement = 0.05;
      this.maxHealth = 100;
      this.health = this.maxHealth;
      this.spriteWidth = 256;
      this.spriteHeight = 256;
      this.width = this.spriteWidth * 0.75;
      this.height = this.spriteHeight * 0.75;
      this.v = { x: 0, y: 0 };
      this.pos = {
        x: CANVAS_WIDTH * 0.5 - this.width * 0.5,
        y: CANVAS_HEIGHT * 0.5 - this.height * 0.5,
      };
      this.hitbox = {
        x: this.pos.x + 53,
        y: this.pos.y + 17,
        width: this.width * 0.375,
        height: this.height * 0.8,
      };
      this.maxSpeed = 10;
      this.acceleration = 1.25;
      this.deceleration = 0.98;
      this.rotation = 0;
      this.maxRotation = 0.075;
      this.rotationSpeed = 0.005;
      this.image = document.getElementById("player");
    }
    update(codes) {
      this.handleInput(codes);
      this.move();
      this.updateHitbox();
      this.fuel -= this.fuelDecrement;
      if (this.fuel > 100) this.fuel = 100;
      if (this.health > 100) this.health = 100;
      this.draw();
    }
    updateHitbox() {
      this.hitbox.x = this.pos.x + 53;
      this.hitbox.y = this.pos.y + 17;
    }
    move() {
      if (this.v.x > 0) this.v.x = Math.max(this.v.x - this.deceleration, 0);
      else if (this.v.x < 0)
        this.v.x = Math.min(this.v.x + this.deceleration, 0);
      if (this.v.y > 0) this.v.y = Math.max(this.v.y - this.deceleration, 0);
      else if (this.v.y < 0)
        this.v.y = Math.min(this.v.y + this.deceleration, 0);
      if (this.v.x < this.maxSpeed && this.v.x > -this.maxSpeed)
        this.v.x += this.acceleration * this.direction.x;
      if (this.v.y < this.maxSpeed && this.v.y > -this.maxSpeed)
        this.v.y += this.acceleration * this.direction.y;
      this.v.x = Math.min(Math.max(this.v.x, -this.maxSpeed), this.maxSpeed);
      this.v.y = Math.min(Math.max(this.v.y, -this.maxSpeed), this.maxSpeed);
      if (this.health <= 0 || this.fuel <= 0) {
        this.v.x = 0;
        this.v.y = 0;
      }
      this.pos.x += this.v.x;
      this.pos.y += this.v.y;
      this.handleBoundaries();
    }
    handleInput(codes) {
      let direction = { x: 0, y: 0 };
      if (codes.includes("KeyW")) {
        direction.y = -1;
        this.fuelDecrement = 0.1;
        scoreInterval = 150;
        if (gameSpeed < this.maxSpeed) gameSpeed += 0.25;
      } else if (codes.includes("KeyS")) {
        direction.y = 1;
        this.fuelDecrement = 0.1;
        scoreInterval = 350;
        if (gameSpeed > 3) gameSpeed -= 0.1;
      }
      if (codes.includes("KeyA")) {
        direction.x = -1;
        this.fuelDecrement = 0.075;
        scoreInterval = 300;
        if (this.rotation >= -this.maxRotation)
          this.rotation -= this.rotationSpeed;
      } else if (codes.includes("KeyD")) {
        direction.x = 1;
        this.fuelDecrement = 0.075;
        scoreInterval = 300;
        if (this.rotation <= this.maxRotation)
          this.rotation += this.rotationSpeed;
      }
      if (!codes.includes("KeyW") && !codes.includes("KeyS")) {
        if (gameSpeed > 5) gameSpeed -= 0.1;
        else if (gameSpeed < 5) gameSpeed += 0.1;
      }
      if (!codes.includes("KeyA") && !codes.includes("KeyD")) {
        if (this.rotation > 0) {
          this.rotation -= this.rotationSpeed;
          if (this.rotation < 0) this.rotation = 0;
        }
        if (this.rotation < 0) {
          this.rotation += this.rotationSpeed;
          if (this.rotation > 0) this.rotation = 0;
        }
      }
      if (
        !codes.includes("KeyW") &&
        !codes.includes("KeyS") &&
        !codes.includes("KeyA") &&
        !codes.includes("KeyD")
      ) {
        this.fuelDecrement = 0.025;
        scoreInterval = 250;
      }
      this.direction = direction;
    }
    handleBoundaries() {
      if (this.pos.x <= 365) this.pos.x = 365;
      else if (this.pos.x >= 1135) this.pos.x = 1135;
      if (this.pos.y <= 35) this.pos.y = 35;
      else if (this.pos.y >= CANVAS_HEIGHT - this.height - 30)
        this.pos.y = CANVAS_HEIGHT - this.height - 30;
    }
    draw() {
      ctx.save();
      ctx.translate(
        this.pos.x + this.width * 0.5,
        this.pos.y + this.height * 0.5
      );
      ctx.rotate(this.rotation);
      ctx.translate(
        -this.pos.x - this.width * 0.5,
        -this.pos.y - this.height * 0.5
      );
      ctx.drawImage(
        this.image,
        this.pos.x,
        this.pos.y,
        this.width,
        this.height
      );
      ctx.restore();
    }
  }

  class StatusBar {
    constructor(x, y, thing, maxThing, text) {
      this.x = x;
      this.y = y;
      this.width = 20;
      this.height = 150;
      this.thing = thing;
      this.maxThing = maxThing;
      this.currentThing = thing;
      this.targetThing = thing;
      this.alpha = 0.75;
      this.text = text;
    }
    update(updatedThing) {
      this.targetThing = Math.max(0, Math.min(updatedThing, this.maxThing));
      this.animateFuel();
      this.draw();
    }
    animateFuel() {
      if (Math.abs(this.currentThing - this.targetThing) > 0.5) {
        this.currentThing += (this.targetThing - this.currentThing) * 0.1;
      } else {
        this.currentThing = this.targetThing;
      }
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = "#222";
      ctx.fillRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
      let gradient = ctx.createLinearGradient(
        this.x,
        this.y,
        this.x,
        this.y + this.height
      );
      gradient.addColorStop(0.5, "rgb(155, 0, 0)");
      gradient.addColorStop(0.75, "rgb(200, 0, 0)");
      gradient.addColorStop(1, "rgb(255, 0, 0)");
      const fuelHeight = (this.currentThing / this.maxThing) * this.height;
      ctx.fillStyle = gradient;
      ctx.fillRect(
        this.x,
        this.y + (this.height - fuelHeight),
        this.width,
        fuelHeight
      );
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#fff";
      ctx.strokeRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
      ctx.fillStyle = "#fff";
      ctx.font = "13px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        Math.round((this.currentThing / this.maxThing) * 100) + "%",
        this.x + this.width / 2,
        this.y + this.height - 10
      );
      ctx.font = "20px Arial";
      ctx.fillText(
        this.text,
        this.x + this.width / 2,
        this.y + this.height + 30
      );
      ctx.restore();
    }
  }

  class Enemy {
    constructor(vy, image) {
      this.vy = gameSpeed + vy;
      this.spriteWidth = 256;
      this.spriteHeight = 256;
      this.width = this.spriteWidth * 0.75;
      this.height = this.spriteHeight * 0.75;
      this.x = Math.floor(Math.random() * (1100 - 400 + 1)) + 400;
      this.y = -this.height;
      this.image = image;
      this.hitbox = {
        x: this.x + 53,
        y: this.y + 17,
        width: this.width * 0.375,
        height: this.height * 0.8,
      };
    }
    update() {
      this.draw();
      this.y += this.vy;
      this.updateHitbox();
    }
    updateHitbox() {
      this.hitbox.x = this.x + 67;
      this.hitbox.y = this.y + 12;
    }
    draw() {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }

  class Car extends Enemy {
    constructor() {
      super(Math.random() * 22, document.getElementById("car"));
    }
  }

  class Taxi extends Enemy {
    constructor() {
      super(Math.random() * 20, document.getElementById("taxi"));
    }
  }

  class Audi extends Enemy {
    constructor() {
      super(Math.random() * 25, document.getElementById("audi"));
    }
  }

  class Truck extends Enemy {
    constructor() {
      super(Math.random() * 16, document.getElementById("truck"));
    }
  }

  class Police extends Enemy {
    constructor() {
      super(Math.random() * 20, document.getElementById("police"));
    }
  }

  class MiniVan extends Enemy {
    constructor() {
      super(Math.random() * 17, document.getElementById("miniVan"));
    }
  }

  class Ambulance extends Enemy {
    constructor() {
      super(Math.random() * 19, document.getElementById("ambulance"));
    }
  }

  class MiniTruck extends Enemy {
    constructor() {
      super(Math.random() * 18, document.getElementById("miniTruck"));
    }
  }

  class Explosion {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.maxFrames = 11;
      this.currentFrame = 0;
      this.spriteWidth = 96;
      this.spriteHeight = 96;
      this.frameInterval = 50;
      this.timeToNewFrame = 0;
      this.sizeModifier = Math.random() * 2 + 2;
      this.width = this.spriteWidth * this.sizeModifier;
      this.height = this.spriteHeight * this.sizeModifier;
      this.image = document.getElementById("explosion");
      this.shakeScreen();
    }
    shakeScreen() {
      canvas.classList.add("shake");
      setTimeout(() => {
        canvas.classList.remove("shake");
      }, 1000);
    }
    update(deltaTime) {
      this.draw();
      this.animate(deltaTime);
    }
    animate(deltaTime) {
      if (this.timeToNewFrame >= this.frameInterval) {
        this.currentFrame++;
        this.timeToNewFrame = 0;
      } else {
        this.timeToNewFrame += deltaTime;
      }
    }
    draw() {
      ctx.drawImage(
        this.image,
        this.currentFrame * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }

  class Drop {
    constructor(spriteWidth, spriteHeight, sizeModifier, imageId, dropType) {
      this.spriteWidth = spriteWidth;
      this.spriteHeight = spriteHeight;
      this.width = this.spriteWidth * sizeModifier;
      this.height = this.spriteHeight * sizeModifier;
      this.x = Math.floor(Math.random() * (1100 - 400 + 1)) + 400;
      this.y = -this.height;
      this.vy = Math.random() * 4 + 4;
      this.image = document.getElementById(`${imageId}`);
      this.hitbox = {
        x: this.x,
        y: this.y,
        width: this.width * 0.5,
        height: this.height * 0.5,
      };
      this.type = dropType;
    }
    update() {
      this.draw();
      this.y += this.vy;
      this.updateHitbox();
    }
    updateHitbox() {
      this.hitbox.x = this.x + this.hitbox.width * 0.5;
      this.hitbox.y = this.y + this.hitbox.height * 0.5;
    }
    draw() {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }

  class FuelDrop extends Drop {
    constructor() {
      super(100, 100, 1.25, "gasCan", "fuel");
    }
  }

  class HealthDrop extends Drop {
    constructor() {
      super(500, 500, 0.25, "health", "health");
    }
  }

  function clearCanvas() {
    ctx.fillStyle = "#44AD44";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  function checkCollision(thing1, thing2) {
    return (
      thing1.hitbox.x < thing2.hitbox.x + thing2.hitbox.width &&
      thing1.hitbox.x + thing1.hitbox.width > thing2.hitbox.x &&
      thing1.hitbox.y < thing2.hitbox.y + thing2.hitbox.height &&
      thing1.hitbox.y + thing1.hitbox.height > thing2.hitbox.y
    );
  }

  function handleEnemyCollisions() {
    for (let i = 0; i < enemies.length; i++) {
      for (let j = i + 1; j < enemies.length; j++) {
        if (checkCollision(enemies[i], enemies[j])) {
          explosions.push(
            new Explosion(
              enemies[i].x - enemies[i].width / 2,
              enemies[i].y - enemies[i].height / 2
            )
          );
          explosions.push(
            new Explosion(
              enemies[j].x - enemies[j].width / 2,
              enemies[j].y - enemies[j].height / 2
            )
          );
          enemies.splice(j, 1);
          enemies.splice(i, 1);
          break;
        }
      }
    }
  }

  function spawnEnemies(deltaTime) {
    if (timeToNewEnemy >= enemyInterval) {
      const enemyToSpawn =
        enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      switch (enemyToSpawn) {
        case "car":
          enemies.push(new Car());
          break;
        case "taxi":
          enemies.push(new Taxi());
          break;
        case "audi":
          enemies.push(new Audi());
          break;
        case "truck":
          enemies.push(new Truck());
          break;
        case "police":
          enemies.push(new Police());
          break;
        case "minivan":
          enemies.push(new MiniVan());
          break;
        case "ambulance":
          enemies.push(new Ambulance());
          break;
        case "minitruck":
          enemies.push(new MiniTruck());
          break;
      }
      timeToNewEnemy = 0;
    } else {
      timeToNewEnemy += deltaTime;
    }
  }

  function spawnDrops(deltaTime) {
    if (timeToNewDrop >= dropInterval) {
      drops.push(new FuelDrop());
      drops.push(new HealthDrop());
      timeToNewDrop = 0;
    } else {
      timeToNewDrop += deltaTime;
    }
  }

  function drawStatusText() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(`Score: ${score}`, 118, CANVAS_HEIGHT - 123);
    ctx.fillText(`Meters Traveled: ${metersTraveled}`, 118, CANVAS_HEIGHT - 83);
    ctx.fillStyle = "white";
    ctx.fillText(`Score: ${score}`, 120, CANVAS_HEIGHT - 125);
    ctx.fillText(`Meters Traveled: ${metersTraveled}`, 118, CANVAS_HEIGHT - 85);
  }

  function addScore(deltaTime) {
    if (timeToScoreIncrement >= scoreInterval && player.health > 0) {
      score++;
      metersTraveled += 5;
      timeToScoreIncrement = 0;
    } else {
      timeToScoreIncrement += deltaTime;
    }
  }

  function init() {
    backgroundMusic.volume = 0.5;
    backgroundMusic.currentTime = 0;
    backgroundMusic.playbackRate = 1;
    gameOver = false;
    score = 0;
    metersTraveled = 0;
    drops = [];
    explosions = [];
    enemies = [];
    player.fuel = player.maxFuel;
    player.health = player.maxHealth;
    player.v = { x: 0, y: 0 };
    player.pos = {
    x: CANVAS_WIDTH * 0.5 - player.width * 0.5,
    y: CANVAS_HEIGHT * 0.5 - player.height * 0.5,
    };
    player.rotation = 0;
    gameSpeed = 5;
    timeToNewEnemy = 0;
    timeToNewDrop = 0;
    timeToScoreIncrement = 0;
    scoreInterval = 250;
    animate(0);
  }

  const bezel = new Bezel();
  const player = new Player();
  const input = new InputHandler();
  const background = new Background();
  const healthbar = new StatusBar(
    125,
    75,
    player.health,
    player.maxHealth,
    "Health"
  );
  const fuelbar = new StatusBar(200, 75, player.fuel, player.maxFuel, "Fuel");

  let lastTime = 0;
  let gameSpeed = 5;
  let gameOver = false;
  let timeToNewEnemy = 0;
  const enemyInterval = 500;
  let timeToNewDrop = 0;
  const dropInterval = 15000;
  let timeToScoreIncrement = 0;
  let scoreInterval = 250;
  function animate(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    if (!gameOver) requestAnimationFrame(animate);
    clearCanvas();
    background.update();
    enemies = enemies.filter((enemy) => enemy.y <= CANVAS_HEIGHT);
    enemies.forEach((enemy, enemyIndex) => {
      enemy.update();
      if (checkCollision(player, enemy)) {
        player.health -= Math.random() * 15 + 10;
        explosions.push(
          new Explosion(enemy.x - enemy.width / 2, enemy.y - enemy.height / 2)
        );
        enemies.splice(enemyIndex, 1);
      }
    });
    handleEnemyCollisions();
    drops.forEach((drop, dropIndex) => {
      if (drop.y > CANVAS_HEIGHT) drops.splice(dropIndex, 1);
      else if (checkCollision(player, drop)) {
        drops.splice(dropIndex, 1);
        const increment = Math.random() * 50 + 25;
        drop.type === "fuel"
          ? (player.fuel += increment)
          : (player.health += increment);
      } else drop.update();
    });
    player.update(input.codes);
    explosions.forEach((explosion, explosionIndex) => {
      if (explosion.currentFrame > explosion.maxFrames)
        explosions.splice(explosionIndex, 1);
      else explosion.update(deltaTime);
    });
    healthbar.update(player.health, player.maxHealth);
    fuelbar.update(player.fuel, player.maxFuel);
    drawStatusText();
    bezel.draw();
    spawnDrops(deltaTime);
    spawnEnemies(deltaTime);
    addScore(deltaTime);
    if (player.health <= 0 || player.fuel <= 0) {
        backgroundMusic.volume = 0.05;
        backgroundMusic.playbackRate = 0.75;
        if (player.health <= 0) player.health = 0;
        else if (player.fuel <= 0) player.fuel = 0;
        explosions.push(
        new Explosion(player.x - player.width / 2, player.y - player.height / 2)
      );
      gameSpeed = 0;
      setTimeout(() => {
          gameOver = true;
          scoreEl.innerHTML = score;
          metersEl.innerHTML = metersTraveled;
          restartGameEl.style.display = "block";
      }, 1000);
    }
  }
});