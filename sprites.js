class Sprite {
  constructor({ position, color = "red", width = 40, height = 40, image }) {
    this.position = position;
    this.color = color;
    this.image = image;

    this.width = width;
    this.height = height;
  }

  draw() {
    if (!this.image) {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    } else {
      ctx.drawImage(
        this.image,

        // Cropping
        0, 0, this.image.width, this.image.height,

        // Position
        this.position.x,
        this.position.y,
        this.width,
        this.height
      )
    }
  }
}

class BulletSprite extends Sprite {
  constructor({ position, image }) {
    super({
      position: position,
      color: "white",
      width: 30,
      height: 30,
    });
    this.speed = 5;
    this.image = image
  }

  update() {
    this.position.y -= this.speed; // move upward
  }
}

class EnemySprite extends Sprite {
  constructor({ position, color = "blue", width = 50, height = 74, velocity = 50, image }) {
    super({
      position,
      width,
      height,
      color,
    });
    this.image = image;
    
    this.targetX = position.x;
    this.targetY = position.y;

    this.velocity = velocity;
    this.moving = {
      isMoving: false,
      right: true,
    }
  }

  shiftRight() {
    this.targetX = this.position.x + this.velocity;
  }

  shiftLeft() {
    this.targetX = this.position.x - this.velocity;
  }

  shiftDown() {
    this.targetY = this.position.y + this.height + 10;
  }

  switchDirection() {
    if (this.moving.right) {
      this.moving.right = false;
    } else {
      this.moving.right = true;
    }

    this.shiftDown();
  }

  animateMovement(duration = 1000) {
    if (this.moving.isMoving) return;

    this.moving.isMoving = true;

    const isAtLeftBoundary = this.position.x <= 0;
    const isAtRightBoundary = this.position.x + this.width >= canvas.width;

    if (isAtLeftBoundary || isAtRightBoundary) {
      this.switchDirection();
    }
    
    if (this.moving.right) {
      this.shiftRight()
    } else {
      this.shiftLeft();
    }

    const startX = this.position.x;
    const startY = this.position.y;
    const startTime = performance.now();

    const move = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easedProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      if (Math.round(this.targetY) !== Math.round(this.position.y)) {
        this.position.y = startY + (this.targetY - startY) * easedProgress;
      } else {
        this.position.x = startX + (this.targetX - startX) * easedProgress;
      }

      if (progress < 1) {
        requestAnimationFrame(move);
      } else {
        this.moving.isMoving = false;
      }
    };

    requestAnimationFrame(move);
  }
}