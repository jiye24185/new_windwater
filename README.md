# Immersive Waterfall Installation

An interactive art installation featuring three distinct modes that respond to human movement through camera-based body tracking.

![Water Mode](https://img.shields.io/badge/Mode-WATER-blue)
![Wind Mode](https://img.shields.io/badge/Mode-WIND-lightgrey)
![Beam Mode](https://img.shields.io/badge/Mode-BEAM-yellow)

## Features

### Three Immersive Modes

1. **WATER** - Thin graphical lines fall from the top under natural gravity
   - Water flows and spills around the human silhouette
   - Creates a cascading waterfall effect
   - Lines react with splash-like physics

2. **WIND** - Lines flow horizontally from left and right
   - Wind deflects and wraps around the body
   - Wave-like motion creates fluid movement
   - Lines curve around obstacles

3. **BEAM** - Lines cross, dance, and move dynamically
   - Beams reflect off the body and redirect
   - Creates a dynamic grid of intersecting light
   - Multi-directional particle behavior

### Hand Tracking

Uses **ml5.js HandPose** for precise real-time hand detection:
- Tracks 21 hand landmarks per hand
- Supports multiple hands simultaneously
- Each mode has unique interaction physics
- Works with standard webcam
- No special hardware required

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd new_windwater
   ```

2. **Serve the files**

   You need a local web server (files won't work via `file://` due to camera permissions).

   **Option 1: Python**
   ```bash
   python3 -m http.server 8000
   ```

   **Option 2: Node.js**
   ```bash
   npx http-server
   ```

   **Option 3: VS Code**
   - Install "Live Server" extension
   - Right-click `index.html` → "Open with Live Server"

3. **Open in browser**
   ```
   http://localhost:8000
   ```

4. **Allow camera access** when prompted

## Usage

### Switching Modes

Two ways to switch modes:

**1. Icon Buttons** (Primary method)
- Click the **droplet icon** for Water mode
- Click the **wave icon** for Wind mode
- Click the **beam icon** for Beam mode

**2. Keyboard Shortcuts**
- Type `WATER` to activate Water mode
- Type `WIND` to activate Wind mode
- Type `BEAM` to activate Beam mode

### Interaction

Show your hands to the camera and watch the particles react:

- **Water Mode**: Move your hands to create waterfalls and splashes - water flows around your fingers
- **Wind Mode**: The wind deflects and wraps around your hands like obstacles
- **Beam Mode**: Beams bounce and reflect off your hands in dynamic patterns

### Tips

- **Lighting**: Ensure good lighting for better hand tracking
- **Distance**: Position hands 1-3 feet from the camera
- **Movement**: Slow, deliberate hand movements create the most dramatic effects
- **Visibility**: Keep hands clearly visible - avoid overlapping with your body
- **Background**: A simple background improves tracking accuracy

## Technical Details

### Technologies

- **p5.js** - Creative coding framework
- **ml5.js** - Machine learning library
- **HandPose** - Hand tracking model (MediaPipe Hands)
- **HTML5 Canvas** - Rendering
- **WebRTC** - Camera access

### File Structure

```
new_windwater/
├── index.html          # Main HTML file
├── style.css           # Clean, minimal styling
├── sketch.js           # Main p5.js sketch and mode logic
├── particle.js         # Particle system with three modes
├── bodyTracking.js     # ml5.js BodyPose integration
└── README.md          # This file
```

### Performance

- Optimized for 60fps at 1080p
- Adaptive particle counts per mode
- Efficient collision detection
- Automatic cleanup of off-screen particles

### Customization

You can adjust these parameters in `sketch.js`:

```javascript
const modeSettings = {
    WATER: {
        spawnRate: 3,        // Particles per frame
        maxParticles: 300,   // Maximum particle count
        bgAlpha: 25         // Background fade speed
    },
    // ... other modes
};
```

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari (may require enabling camera permissions)

**Requires:**
- WebRTC support
- WebGL support
- Camera access

## Troubleshooting

### Camera not working
- Check browser permissions
- Ensure HTTPS or localhost
- Try a different browser

### Poor performance
- Reduce `maxParticles` in settings
- Close other tabs
- Use a modern browser

### Hand tracking not working
- Improve lighting
- Check camera is working
- Ensure hands are clearly visible and not overlapping
- Wait for "Camera: Ready - Show your hands!" status
- Try moving hands closer to camera

## License

MIT License - feel free to use and modify

## Credits

Inspired by immersive installations that blend typography with flowing natural elements.

Built with ❤️ using p5.js and ml5.js
