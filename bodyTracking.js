class BodyTracker {
    constructor() {
        this.video = null;
        this.bodyPose = null;
        this.poses = [];
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
            this.updateStatus('Camera: Loading model...');

            // Initialize BodyPose
            this.bodyPose = ml5.bodyPose('MoveNet', { flipped: true });

            // Wait for model to load
            await this.bodyPose.ready;
            this.modelLoaded = true;

            console.log('BodyPose model loaded');
            this.updateStatus('Camera: Ready');

            // Start detection
            this.bodyPose.detectStart(this.video, this.gotPoses.bind(this));
            this.ready = true;

        } catch (error) {
            console.error('Error initializing body tracking:', error);
            this.updateStatus('Camera: Error - ' + error.message);
        }
    }

    gotPoses(results) {
        this.poses = results;
    }

    getBodyParts() {
        if (!this.poses || this.poses.length === 0) return [];

        // Get all keypoints from the first detected pose
        let keypoints = this.poses[0].keypoints;

        // Scale keypoints to canvas size
        return keypoints.map(kp => ({
            x: map(kp.x, 0, this.video.width, 0, width),
            y: map(kp.y, 0, this.video.height, 0, height),
            confidence: kp.confidence,
            name: kp.name
        }));
    }

    getBodySilhouette() {
        // Returns main body points for silhouette detection
        let parts = this.getBodyParts();
        if (parts.length === 0) return [];

        // Filter for main body parts with good confidence
        const mainParts = ['nose', 'left_shoulder', 'right_shoulder',
                          'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist',
                          'left_hip', 'right_hip', 'left_knee', 'right_knee'];

        return parts.filter(p => mainParts.includes(p.name) && p.confidence > 0.3);
    }

    updateStatus(message) {
        let statusElement = document.getElementById('camera-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    drawDebug() {
        // Optional: draw skeleton for debugging
        if (!this.ready || this.poses.length === 0) return;

        push();
        stroke(255, 100);
        strokeWeight(2);
        noFill();

        let parts = this.getBodyParts();
        for (let part of parts) {
            if (part.confidence > 0.3) {
                circle(part.x, part.y, 10);
            }
        }

        pop();
    }
}
