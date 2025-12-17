let particles = [];
let currentMode = 'WATER';
let bodyTracker;
let typedText = '';
let lastKeyTime = 0;
let keyTimeout = 1500; // Reset typed text after 1.5 seconds

// Mode-specific settings
const modeSettings = {
    WATER: {
        spawnRate: 3,
        maxParticles: 300,
        bgAlpha: 25
    },
    WIND: {
        spawnRate: 2,
        maxParticles: 250,
        bgAlpha: 30
    },
    BEAM: {
        spawnRate: 4,
        maxParticles: 200,
        bgAlpha: 40
    }
};

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container');

    // Initialize body tracking
    bodyTracker = new BodyTracker();
    bodyTracker.init();

    // Initial particles
    for (let i = 0; i < 50; i++) {
        spawnParticle();
    }

    console.log('Setup complete. Type WATER, WIND, or BEAM to switch modes.');
}

function draw() {
    // Semi-transparent background for trail effect
    let settings = modeSettings[currentMode];
    background(0, settings.bgAlpha);

    // Spawn new particles
    for (let i = 0; i < settings.spawnRate; i++) {
        if (particles.length < settings.maxParticles) {
            spawnParticle();
        }
    }

    // Get body parts for interaction
    let bodyParts = bodyTracker.ready ? bodyTracker.getBodySilhouette() : [];

    // Update and display particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].interactWithBody(bodyParts);
        particles[i].update();
        particles[i].display();

        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }

    // Optional: Draw debug skeleton (uncomment to see body tracking)
    // bodyTracker.drawDebug();
}

function spawnParticle() {
    let x, y;

    switch(currentMode) {
        case 'WATER':
            x = random(width);
            y = random(-100, -20);
            break;

        case 'WIND':
            // Spawn from left or right edge
            if (random() > 0.5) {
                x = random() > 0.5 ? -50 : width + 50;
                y = random(height);
            } else {
                x = random(width);
                y = random() > 0.5 ? -50 : height + 50;
            }
            break;

        case 'BEAM':
            // Spawn from random edge
            let edge = floor(random(4));
            switch(edge) {
                case 0: x = random(width); y = 0; break;
                case 1: x = width; y = random(height); break;
                case 2: x = random(width); y = height; break;
                case 3: x = 0; y = random(height); break;
            }
            break;
    }

    particles.push(new Particle(x, y, currentMode));
}

function switchMode(newMode) {
    if (newMode === currentMode) return;

    currentMode = newMode;

    // Update UI
    let indicator = document.getElementById('mode-indicator');
    indicator.textContent = currentMode;
    indicator.style.color = getModeColor();

    // Clear existing particles for clean transition
    particles = [];

    // Spawn initial particles for new mode
    for (let i = 0; i < 50; i++) {
        spawnParticle();
    }

    console.log('Switched to mode:', currentMode);
}

function getModeColor() {
    switch(currentMode) {
        case 'WATER': return 'rgba(100, 150, 255, 0.2)';
        case 'WIND': return 'rgba(200, 200, 200, 0.2)';
        case 'BEAM': return 'rgba(255, 255, 150, 0.2)';
        default: return 'rgba(255, 255, 255, 0.15)';
    }
}

function keyPressed() {
    // Update last key time
    lastKeyTime = millis();

    // Add to typed text if it's a letter
    if (key.length === 1 && key.match(/[a-z]/i)) {
        typedText += key.toUpperCase();

        // Check if typed text matches any mode
        if (typedText === 'WATER') {
            switchMode('WATER');
            typedText = '';
        } else if (typedText === 'WIND') {
            switchMode('WIND');
            typedText = '';
        } else if (typedText === 'BEAM') {
            switchMode('BEAM');
            typedText = '';
        }

        // Limit typed text length
        if (typedText.length > 5) {
            typedText = typedText.slice(-5);
        }
    }

    // Reset on Escape or Enter
    if (keyCode === ESCAPE || keyCode === ENTER) {
        typedText = '';
    }
}

function keyTyped() {
    // Check if enough time has passed since last key
    if (millis() - lastKeyTime > keyTimeout) {
        typedText = '';
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
