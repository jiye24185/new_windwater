class HandTracker {
    constructor() {
        this.video = null;
        this.handPose = null;
        this.hands = [];
        this.ready = false;
        this.modelLoaded = false;
    }

    async init() {
        try {
            // Create video capture
            this.video = createCapture(VIDEO);
            this.video.size(640, 480);
            this.video.hide();

            // Wait for video to load
            await new Promise(resolve => {
                this.video.elt.onloadedmetadata = resolve;
            });

            console.log('Video initialized');
            this.updateStatus('Camera: Loading hand model...');

            // Initialize HandPose
            this.handPose = ml5.handPose({ flipped: true });

            // Wait for model to load
            await this.handPose.ready;
            this.modelLoaded = true;

            console.log('HandPose model loaded');
            this.updateStatus('Camera: Ready - Show your hands!');

            // Start detection
            this.handPose.detectStart(this.video, this.gotHands.bind(this));
            this.ready = true;

        } catch (error) {
            console.error('Error initializing hand tracking:', error);
            this.updateStatus('Camera: Error - ' + error.message);
        }
    }

    gotHands(results) {
        this.hands = results;
    }

    getHandPoints() {
        if (!this.hands || this.hands.length === 0) return [];

        let allPoints = [];

        // Process all detected hands
        for (let hand of this.hands) {
            // Get all keypoints from this hand
            for (let keypoint of hand.keypoints) {
                allPoints.push({
                    x: map(keypoint.x, 0, this.video.width, 0, width),
                    y: map(keypoint.y, 0, this.video.height, 0, height),
                    confidence: keypoint.confidence || 1.0,
                    name: keypoint.name
                });
            }
        }

        return allPoints;
    }

    getHandCenters() {
        // Returns center points of detected hands with larger radius
        if (!this.hands || this.hands.length === 0) return [];

        let centers = [];

        for (let hand of this.hands) {
            if (hand.keypoints && hand.keypoints.length > 0) {
                // Calculate center of hand
                let sumX = 0, sumY = 0;
                let validPoints = 0;

                for (let kp of hand.keypoints) {
                    sumX += kp.x;
                    sumY += kp.y;
                    validPoints++;
                }

                if (validPoints > 0) {
                    centers.push({
                        x: map(sumX / validPoints, 0, this.video.width, 0, width),
                        y: map(sumY / validPoints, 0, this.video.height, 0, height),
                        confidence: 1.0,
                        name: 'hand_center'
                    });
                }
            }
        }

        return centers;
    }

    updateStatus(message) {
        let statusElement = document.getElementById('camera-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    drawDebug() {
        // Optional: draw hand landmarks for debugging
        if (!this.ready || this.hands.length === 0) return;

        push();

        for (let hand of this.hands) {
            // Draw keypoints
            fill(255, 100);
            noStroke();
            for (let keypoint of hand.keypoints) {
                let x = map(keypoint.x, 0, this.video.width, 0, width);
                let y = map(keypoint.y, 0, this.video.height, 0, height);
                circle(x, y, 8);
            }

            // Draw connections
            stroke(255, 80);
            strokeWeight(2);
            if (hand.keypoints.length >= 21) {
                // Draw hand skeleton
                this.drawHandSkeleton(hand.keypoints);
            }
        }

        pop();
    }

    drawHandSkeleton(keypoints) {
        // Finger connections
        const fingers = [
            [0, 1, 2, 3, 4],     // thumb
            [0, 5, 6, 7, 8],     // index
            [0, 9, 10, 11, 12],  // middle
            [0, 13, 14, 15, 16], // ring
            [0, 17, 18, 19, 20]  // pinky
        ];

        for (let finger of fingers) {
            for (let i = 0; i < finger.length - 1; i++) {
                let kp1 = keypoints[finger[i]];
                let kp2 = keypoints[finger[i + 1]];
                let x1 = map(kp1.x, 0, this.video.width, 0, width);
                let y1 = map(kp1.y, 0, this.video.height, 0, height);
                let x2 = map(kp2.x, 0, this.video.width, 0, width);
                let y2 = map(kp2.y, 0, this.video.height, 0, height);
                line(x1, y1, x2, y2);
            }
        }
    }
}
