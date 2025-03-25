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
  constructor({ position, color = "blue", width = 20, height = 20, velocity = 50 }) {
    super({
      position,
      width,
      height,
      color,
    });
    this.targetX = position.x;
    this.velocity = velocity;
    this.moving = {
      isMoving: false,
      right: true,
    }
  }

  animateMovement(duration = 1000) {
    if (this.moving.isMoving) return;

    this.moving.isMoving = true;

    if (this.position.x - this.width - this.velocity <= 0) {
      this.moving.right = true;
    } else if (this.position.x + this.width + this.velocity >= canvas.width) {
      this.moving.right = false;
    }
    
    if (this.moving.right) {
      this.targetX = this.position.x + this.velocity;
    } else {
      this.targetX = this.position.x - this.velocity;
    }

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
        this.moving.isMoving = false;
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

  // -- Check bullet colision
  bulletCollision({ projectiles, enemies });

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

function bulletCollision({ projectiles, enemies }) {
  for (let p in projectiles) {
    const projectile = projectiles[p];

    for (let e in enemies) {
      const enemy = enemies[e];

      if (
        projectile.position.x < enemy.position.x + enemy.width &&
        projectile.position.x + projectile.width > enemy.position.x &&
        projectile.position.y < enemy.position.y + enemy.height &&
        projectile.position.y + projectile.height > enemy.position.y
      ) {
        // Delete the projectile
        projectiles.splice(p, 1);

        // Delete the enemy
        enemies.splice(e, 1);

        return;
      }
    }
  }
}

setInterval(() => {
  enemies.forEach((enemy) => enemy.animateMovement());
}, 1000);

window.addEventListener("keydown", (e) => {
  keysPressed[e.key] = true;

  if (e.key === " " && projectiles.length <= projectileLimit) {
    shootProjectile();
  }
});

window.addEventListener("keyup", (e) => delete keysPressed[e.key]);

populateEnemies(10)
animate();
