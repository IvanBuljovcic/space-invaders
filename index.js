const ctx = canvas.getContext("2d");

const keysPressed = {};

// --- Images
const enemyImage = new Image();
enemyImage.src = './images/terzic.png';

const bulletImage = new Image();
bulletImage.src = './images/egg-splash.png';


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
      enemySprite = new EnemySprite({ position: { x: 150, y: 150 }, color: "green", image: enemyImage });
    } else {
      const startingX = enemies[enemies.length-1].position.x;
      enemySprite = new EnemySprite({ position: { x: startingX + 150, y: 150 }, color: "green", image: enemyImage });
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
  const animFrame = requestAnimationFrame(animate);

  winState(animFrame);
}


function shootProjectile() {
  const projectile = new BulletSprite({
    position: {
      x: playerSprite.position.x + playerSprite.width / 2 - 2.5,
      y: playerSprite.position.y,
    },
    image: bulletImage,
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

function winState(id) {
  if (!enemies.length) {
    document.querySelector('.victory').style.visibility = 'visible';
    cancelAnimationFrame(id)
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

populateEnemies(7)
animate();
