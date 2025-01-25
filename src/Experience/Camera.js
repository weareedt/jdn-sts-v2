import * as THREE from 'three';
import Experience from './Experience.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class Camera {
    constructor(_options) {
        // Options
        this.experience = new Experience();
        this.config = this.experience.config;
        this.debug = this.experience.debug;
        this.time = this.experience.time;
        this.sizes = this.experience.sizes;
        this.targetElement = this.experience.targetElement;
        this.scene = this.experience.scene;

        // Set up
        this.mode = 'debug'; // Modes: defaultCamera or debugCamera

        this.setInstance();
        this.setModes();
    }

    setInstance() {
        try {
            // Set up the main camera instance
            this.instance = new THREE.PerspectiveCamera(30, this.config.width / this.config.height, 0.1, 50);
            this.instance.rotation.reorder('YXZ');

            this.scene.add(this.instance);
        } catch (error) {
            console.error('Failed to set up camera instance:', error);

            // Fallback error message
            const errorElement = document.createElement('div');
            errorElement.style.position = 'fixed';
            errorElement.style.top = '50%';
            errorElement.style.left = '50%';
            errorElement.style.transform = 'translate(-50%, -50%)';
            errorElement.style.color = 'white';
            errorElement.style.backgroundColor = 'red';
            errorElement.style.padding = '20px';
            errorElement.style.borderRadius = '8px';
            errorElement.style.textAlign = 'center';
            errorElement.innerText = 'Camera initialization failed. Please check your settings and refresh.';
            document.body.appendChild(errorElement);
        }
    }

    setModes() {
        try {
            this.modes = {};

            // Default mode
            this.modes.default = {};
            this.modes.default.instance = this.instance.clone();
            this.modes.default.instance.rotation.reorder('YXZ');

            // Debug mode
            this.modes.debug = {};
            this.modes.debug.instance = this.instance.clone();
            this.modes.debug.instance.rotation.reorder('YXZ');
            this.modes.debug.instance.position.set(0, 0, 15); // Move camera further back to make sphere appear smaller

            // Set up OrbitControls for debug mode
            this.modes.debug.orbitControls = new OrbitControls(this.modes.debug.instance, this.targetElement);
            this.modes.debug.orbitControls.enabled = true; // Keep controls enabled for zoom
            this.modes.debug.orbitControls.screenSpacePanning = true;
            this.modes.debug.orbitControls.enableKeys = false;
            this.modes.debug.orbitControls.zoomSpeed = 0.25;
            this.modes.debug.orbitControls.enableDamping = true;
            this.modes.debug.orbitControls.enableRotate = false; // Disable rotation
            this.modes.debug.orbitControls.enablePan = false; // Disable panning
            this.modes.debug.orbitControls.minDistance = 10; // Set minimum zoom distance
            this.modes.debug.orbitControls.maxDistance = 50; // Set maximum zoom distance
            this.modes.debug.orbitControls.update();

            console.log(this.modes.debug.instance.position);
        } catch (error) {
            console.error('Failed to set camera modes:', error);
        }
    }

    resize() {
        try {
            // Resize camera for each mode
            if (this.instance) {
                this.instance.aspect = this.config.width / this.config.height;
                this.instance.updateProjectionMatrix();
            }

            if (this.modes.default?.instance) {
                this.modes.default.instance.aspect = this.config.width / this.config.height;
                this.modes.default.instance.updateProjectionMatrix();
            }

            if (this.modes.debug?.instance) {
                this.modes.debug.instance.aspect = this.config.width / this.config.height;
                this.modes.debug.instance.updateProjectionMatrix();
            }
        } catch (error) {
            console.error('Error resizing the camera:', error);
        }
    }

    update() {
        try {
            // Update debug OrbitControls
            if (this.modes.debug?.orbitControls) {
                this.modes.debug.orbitControls.update();
            }

            // Synchronize main camera position with the active mode
            if (this.modes[this.mode]?.instance) {
                this.instance.position.copy(this.modes[this.mode].instance.position);
                this.instance.quaternion.copy(this.modes[this.mode].instance.quaternion);
                this.instance.updateMatrixWorld(); // Update for projection calculations
            }
        } catch (error) {
            console.error('Error updating the camera:', error);
        }
    }

    destroy() {
        try {
            if (this.modes.debug?.orbitControls) {
                this.modes.debug.orbitControls.destroy();
            }
        } catch (error) {
            console.error('Error destroying camera resources:', error);
        }
    }
}
