class Particle {
    constructor(x, y, mode) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.mode = mode;
        this.alpha = 255;
        this.lifespan = 255;
        this.trail = [];
        this.maxTrailLength = 15;

        // Initialize based on mode
        this.initializeByMode();
    }

    initializeByMode() {
        switch(this.mode) {
            case 'WATER':
                this.vel = createVector(random(-0.5, 0.5), random(2, 4));
                this.length = random(40, 100);
                this.weight = random(0.5, 1.5);
                this.alpha = random(100, 200);
                break;

            case 'WIND':
                let direction = random() > 0.5 ? 1 : -1;
                this.vel = createVector(direction * random(3, 6), random(-1, 1));
                this.length = random(60, 150);
                this.weight = random(0.3, 0.8);
                this.alpha = random(80, 150);
                this.waveOffset = random(TWO_PI);
                this.waveSpeed = random(0.02, 0.05);
                break;

            case 'BEAM':
                let angle = random(TWO_PI);
                let speed = random(2, 5);
                this.vel = createVector(cos(angle) * speed, sin(angle) * speed);
                this.length = random(30, 80);
                this.weight = random(0.4, 1);
                this.alpha = random(120, 200);
                this.bounceCount = 0;
                this.maxBounces = 3;
                break;
        }
    }

    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        // Store trail position
        this.trail.push(this.pos.copy());
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        // Update physics
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);

        // Mode-specific updates
        switch(this.mode) {
            case 'WATER':
                this.updateWater();
                break;
            case 'WIND':
                this.updateWind();
                break;
            case 'BEAM':
                this.updateBeam();
                break;
        }
    }

    updateWater() {
        // Gravity
        this.applyForce(createVector(0, 0.3));
        // Air resistance
        let drag = this.vel.copy();
        drag.mult(-0.01);
        this.applyForce(drag);
        // Slight horizontal movement
        this.pos.x += sin(frameCount * 0.02 + this.pos.y * 0.01) * 0.5;
    }

    updateWind() {
        // Wave motion
        this.pos.y += sin(frameCount * this.waveSpeed + this.waveOffset) * 0.8;
        // Slight speed variation
        this.vel.mult(0.99);
        this.vel.x += random(-0.1, 0.1);
    }

    updateBeam() {
        // Constant speed
        this.vel.limit(5);
        // Screen wrap
        if (this.pos.x < 0) this.pos.x = width;
        if (this.pos.x > width) this.pos.x = 0;
        if (this.pos.y < 0) this.pos.y = height;
        if (this.pos.y > height) this.pos.y = 0;
    }

    interactWithBody(bodyParts) {
        if (!bodyParts || bodyParts.length === 0) return;

        switch(this.mode) {
            case 'WATER':
                this.waterBodyInteraction(bodyParts);
                break;
            case 'WIND':
                this.windBodyInteraction(bodyParts);
                break;
            case 'BEAM':
                this.beamBodyInteraction(bodyParts);
                break;
        }
    }

    waterBodyInteraction(bodyParts) {
        // Water flows and spills around hands
        for (let part of bodyParts) {
            if (!part || part.confidence < 0.3) continue;

            let partPos = createVector(part.x, part.y);
            let d = p5.Vector.dist(this.pos, partPos);

            // Smaller radius for hand interactions
            if (d < 50) {
                // Push water particles outward and down
                let force = p5.Vector.sub(this.pos, partPos);
                force.normalize();
                force.mult(map(d, 0, 50, 1.2, 0));
                force.y += 0.3; // Add downward flow
                this.applyForce(force);

                // Increase velocity for splashing effect
                if (d < 25) {
                    this.vel.mult(1.3);
                }
            }
        }
    }

    windBodyInteraction(bodyParts) {
        // Wind deflects and wraps around hands
        for (let part of bodyParts) {
            if (!part || part.confidence < 0.3) continue;

            let partPos = createVector(part.x, part.y);
            let d = p5.Vector.dist(this.pos, partPos);

            // Smaller radius for hand interactions
            if (d < 60) {
                // Calculate deflection perpendicular to approach
                let toParticle = p5.Vector.sub(this.pos, partPos);
                let perpendicular = createVector(-toParticle.y, toParticle.x);
                perpendicular.normalize();

                // Apply wrapping force
                let strength = map(d, 0, 60, 2.0, 0);
                perpendicular.mult(strength);
                this.applyForce(perpendicular);

                // Also push away slightly
                toParticle.normalize();
                toParticle.mult(strength * 0.4);
                this.applyForce(toParticle);
            }
        }
    }

    beamBodyInteraction(bodyParts) {
        // Beams reflect off hands
        for (let part of bodyParts) {
            if (!part || part.confidence < 0.3) continue;

            let partPos = createVector(part.x, part.y);
            let d = p5.Vector.dist(this.pos, partPos);

            // Smaller radius for hand interactions
            if (d < 40 && this.bounceCount < this.maxBounces) {
                // Calculate reflection
                let normal = p5.Vector.sub(this.pos, partPos);
                normal.normalize();

                // Reflect velocity
                let dotProduct = this.vel.dot(normal);
                let reflection = p5.Vector.mult(normal, 2 * dotProduct);
                this.vel.sub(reflection);

                // Add some randomness to reflection
                this.vel.rotate(random(-0.3, 0.3));

                // Move particle away from collision point
                this.pos.add(p5.Vector.mult(normal, 15));

                this.bounceCount++;
                this.alpha = min(255, this.alpha + 50); // Flash on bounce
            }
        }
    }

    isDead() {
        switch(this.mode) {
            case 'WATER':
                return this.pos.y > height + 50;
            case 'WIND':
                return this.pos.x < -100 || this.pos.x > width + 100;
            case 'BEAM':
                return this.bounceCount >= this.maxBounces && this.alpha < 10;
            default:
                return false;
        }
    }

    display() {
        push();
        stroke(255, this.alpha);
        strokeWeight(this.weight);

        // Draw line based on velocity direction
        let endPos = p5.Vector.sub(this.pos, p5.Vector.mult(this.vel, this.length / this.vel.mag()));
        line(this.pos.x, this.pos.y, endPos.x, endPos.y);

        // Optional: draw subtle trail for beams
        if (this.mode === 'BEAM' && this.trail.length > 2) {
            for (let i = 0; i < this.trail.length - 1; i++) {
                let alpha = map(i, 0, this.trail.length, 0, this.alpha * 0.3);
                stroke(255, alpha);
                strokeWeight(this.weight * 0.5);
                line(this.trail[i].x, this.trail[i].y,
                     this.trail[i + 1].x, this.trail[i + 1].y);
            }
        }

        pop();
    }
}
