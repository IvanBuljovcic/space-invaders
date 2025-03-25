const ctx = canvas.getContext("2d");

const keysPressed = {};

// Helper class
class Sprite {
  constructor({ position, color = "red", width = 40, height = 40 }) {
    this.position = position;
    this.color = color;

    this.width = width;
    this.height = height;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

class BulletSprite extends Sprite {
  constructor({ position }) {
    super({
      position: position,
      color: "white",
      width: 5,
      height: 10,
    });
    this.speed = 5;
  }

  update() {
    this.position.y -= this.speed; // move upward
  }
}

class EnemySprite extends Sprite {
  constructor({ position, color = "blue", width = 20, height = 20 }) {
    super({
      position,
      width,
      height,
      color,
    });
    this.targetX = position.x;
    this.isMoving = false;
  }

  shiftRight(distance = 50) {
    this.position.x += distance;
  }

  animateMovement(targetX, duration = 1000) {
    if (this.isMoving) return;

    this.isMoving = true;
    this.targetX = this.position.x + 50;

    const startX = this.position.x;
    const startTime = performance.now();

    const move = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easedProgress =
        progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      this.position.x = startX + (this.targetX - startX) * easedProgress;

      if (progress < 1) {
        requestAnimationFrame(move);
      } else {
        this.isMoving = false;
      }
    };

    requestAnimationFrame(move);
  }
}

const playerSprite = new Sprite({ position: { x: canvas.width / 2, y: canvas.height - 45 } });
const velocity = 3;

// --- Projectile setup
const projectiles = [];
let projectileLimit = 5;

// --- Enemy setup
const enemies = [];

function populateEnemies(amount) {
  let i = 1;
  while (i <= amount) {
    let enemySprite;
    if (!enemies.length) {
      enemySprite = new EnemySprite({ position: { x: 150, y: 150 }, color: "green" });
    } else {
      const startingX = enemies[enemies.length-1].position.x;
      enemySprite = new EnemySprite({ position: { x: startingX + 50, y: 150 }, color: "green" });
    }
    enemies.push(enemySprite);
    i++;
  }
}

function animate() {
  // Clear the entire canvas before redrawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Redraw background (optional, if you want a specific background)
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  playerSprite.draw();

  for (let i in enemies) {
    enemies[i].draw();
  }

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const bullet = projectiles[i];

    bullet.update();
    bullet.draw();

    if (bullet.position.y + bullet.height < 0) {
      projectiles.splice(i, 1);
    }
  }

  if (keysPressed["a"]) {
    const collidingLeft = playerSprite.position.x <= 0;

    if (!collidingLeft) {
      playerSprite.position.x -= velocity;
    }
  }

  if (keysPressed["d"]) {
    const collidingRight = playerSprite.position.x + playerSprite.width >= canvas.width;

    if (!collidingRight) {
      playerSprite.position.x += velocity;
    }
  }

  // Request next animation frame
  requestAnimationFrame(animate);
}

function shootProjectile() {
  const projectile = new BulletSprite({
    position: {
      x: playerSprite.position.x + playerSprite.width / 2 - 2.5,
      y: playerSprite.position.y,
    },
  });
  projectiles.push(projectile);
}

setInterval(() => {
  enemies.forEach((enemy) => enemy.animateMovement());
}, 1000);

window.addEventListener("keydown", (e) => {
  keysPressed[e.key] = true;

  if (e.key === " " && projectiles.length <= projectileLimit) {
    shootProjectile();
  }
  console.log("projectiles: ", projectiles);
});

window.addEventListener("keyup", (e) => delete keysPressed[e.key]);

populateEnemies(3)
animate();
