import * as THREE from 'three';
import { Pane } from 'tweakpane';

import Time from './Utils/Time.js';
import Sizes from './Utils/Sizes.js';
import Stats from './Utils/Stats.js';
import EventEmitter from './Utils/EventEmitter.js';

import Resources from './Resources.js';
import Renderer from './Renderer.js';
import Camera from './Camera.js';
import World from './World.js';

import assets from './assets.js';
import Microphone from './Microphone.js';

export default class Experience extends EventEmitter {
    static instance;

    constructor(_options = {}) {
        super();

        if (Experience.instance) {
            return Experience.instance;
        }
        Experience.instance = this;

        // Options
        this.targetElement = _options.targetElement;
        this.setTranscription = _options.setTranscription;

        // Add a flag to enable or disable the camera
        this.useCamera = _options.useCamera ?? true; // Enable camera by default

        if (!this.targetElement) {
            console.warn("Missing 'targetElement' property");
            return;
        }

        this.time = new Time();
        this.sizes = new Sizes();
        this.setConfig();
        // this.setStats();
        // this.setDebug();
        this.setScene();
        if (this.useCamera) this.setCamera(); // Initialize camera only if enabled
        this.setRenderer();
        this.setResources();
        this.setMicrophone();
        this.setWorld();

        this.sizes.on('resize', () => {
            this.resize();
        });

        this.update();
    }

    setConfig() {
        this.config = {};

        // Debug
        // this.config.debug = window.location.hash === '#debug'

        // Pixel ratio
        this.config.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2);

        // Width and height
        const boundings = this.targetElement.getBoundingClientRect();
        this.config.width = boundings.width;
        this.config.height = boundings.height || window.innerHeight;
    }

    // setStats()
    // {
    //     if(this.config.debug)
    //     {
    //         this.stats = new Stats(true)
    //     }
    // }

    // setDebug()
    // {
    //     if(this.config.debug)
    //     {
    //         this.debug = new Pane()
    //         this.debug.containerElem_.style.width = '320px'
    //     }
    // }

    setScene() {
        this.scene = new THREE.Scene();
    }

    setCamera() {
        try {
            this.camera = new Camera();
        } catch (error) {
            console.error('Error initializing camera:', error);

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
            errorElement.innerText =
              'An error occurred while initializing the camera. Please check permissions and refresh the page.';
            document.body.appendChild(errorElement);
        }
    }

    setRenderer() {
        this.renderer = new Renderer({
            rendererInstance: this.rendererInstance,
            camera: this.useCamera ? this.camera : null, // Pass the camera only if enabled
        });

        this.targetElement.appendChild(this.renderer.instance.domElement);
    }

    setResources() {
        this.resources = new Resources(assets);
    }

    setMicrophone() {
        this.microphone = new Microphone(this.setTranscription);
    }

    setWorld() {
        this.world = new World();
    }

    update() {
        try {
            // if (this.stats) this.stats.update();

            if (this.useCamera && this.camera) this.camera.update();

            if (this.microphone) this.microphone.update();

            if (this.world) this.world.update();

            if (this.renderer) this.renderer.update();

            window.requestAnimationFrame(() => {
                this.update();
            });
        } catch (error) {
            console.error('Error during update loop:', error);
        }
    }

    resize() {
        try {
            const boundings = this.targetElement.getBoundingClientRect();
            this.config.width = boundings.width;
            this.config.height = boundings.height;

            this.config.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2);

            if (this.useCamera && this.camera) this.camera.resize();

            if (this.renderer) this.renderer.resize();

            if (this.world) this.world.resize();
        } catch (error) {
            console.error('Error during resize:', error);
        }
    }

    destroy() {
        try {
            if (this.microphone) {
                if (this.microphone.recorder) {
                    this.microphone.stopRecording();
                }
                if (this.microphone.audioContext) {
                    this.microphone.audioContext.close();
                }
            }
        } catch (error) {
            console.error('Error during destruction:', error);
        }
    }
}
