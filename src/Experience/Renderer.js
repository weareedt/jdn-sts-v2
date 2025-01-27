import * as THREE from 'three';
import Experience from './Experience.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

//Rendering the sphere
export default class Renderer {
    constructor(_options = {}) {
        // Function: Initializes the Renderer class and its dependencies.
        // Effect: Sets up rendering configuration, post-processing, and user interaction controls.
        this.experience = new Experience();
        this.config = this.experience.config;
        this.debug = this.experience.debug;
        this.stats = this.experience.stats;
        this.time = this.experience.time;
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.camera = this.experience.camera;

        this.usePostprocess = true; // Enables or disables post-processing effects.

        this.targetElement = this.experience.targetElement; // Element where the renderer attaches.
        this.disableUserInteraction(); // Prevents user interactions like zoom or pinch gestures.

        this.setInstance(); // Initializes the renderer instance.
        this.setPostProcess(); // Sets up post-processing effects like bloom.
    }

    disableUserInteraction() {
        // Function: Disables unwanted user interactions such as zoom and pinch gestures.
        // Effect: Ensures consistent rendering by preventing user manipulation.
        if (this.targetElement) {
            this.targetElement.addEventListener('wheel', (event) => {
                event.preventDefault(); // Disables scroll zoom.
            });

            this.targetElement.addEventListener(
              'touchmove',
              (event) => {
                  if (event.touches.length > 1) {
                      event.preventDefault(); // Disables pinch zoom.
                  }
              },
              { passive: false }
            );
        }
    }

    setInstance() {
        // Function: Sets up the WebGL renderer.
        // Effect: Configures the renderer with basic settings like size, clear color, and pixel ratio.
        this.clearColor = '#010101';

        this.instance = new THREE.WebGLRenderer({
            alpha: false, // Disables transparency.
            antialias: false, // Disables antialiasing for performance.
        });
        this.instance.domElement.style.position = 'absolute';
        this.instance.domElement.style.top = 0;
        this.instance.domElement.style.left = 0;
        this.instance.domElement.style.width = '100%';
        this.instance.domElement.style.height = '100%';

        this.instance.setClearColor(this.clearColor, 1); // Sets the background color of the renderer.
        this.instance.setSize(this.config.width, this.config.height); // Matches the renderer size to the viewport.
        this.instance.setPixelRatio(this.config.pixelRatio); // Adjusts pixel ratio for high-DPI screens.

        this.context = this.instance.getContext(); // Retrieves the WebGL context for advanced operations.
    }

    setPostProcess() {
        // Function: Sets up post-processing pipeline with effects like bloom.
        // Effect: Enhances visual appearance by applying additional rendering passes.

        this.postProcess = {};

        // Ensures the camera instance is available for post-processing.
        if (!this.camera || !this.camera.instance) {
            console.error('Camera instance is not initialized. Post-process cannot be set.');
            return;
        }

        // Render pass: Renders the scene as the base pass.
        this.postProcess.renderPass = new RenderPass(this.scene, this.camera.instance);

        // Unreal Bloom Pass: Adds a glowing bloom effect to bright areas.
        this.postProcess.unrealBloomPass = new UnrealBloomPass(
          new THREE.Vector2(this.sizes.width, this.sizes.height), // Resolution of the bloom effect.
          0.8, // Strength of the bloom effect.
          0.315, // Radius of the bloom effect.
          0 // Threshold for the bloom effect.
        );
        this.postProcess.unrealBloomPass.enabled = true;

        // Custom tint color for the bloom effect.
        this.postProcess.unrealBloomPass.tintColor = {
            value: '#7f00ff', // Bloom tint color.
            instance: new THREE.Color('#7f00ff'),
        };
        this.postProcess.unrealBloomPass.compositeMaterial.uniforms.uTintColor = {
            value: this.postProcess.unrealBloomPass.tintColor.instance,
        };
        this.postProcess.unrealBloomPass.compositeMaterial.uniforms.uTintStrength = {
            value: 0.15, // Strength of the tint applied to the bloom.
        };

        // Custom fragment shader for the bloom effect with tint support.
        this.postProcess.unrealBloomPass.compositeMaterial.fragmentShader = `
varying vec2 vUv;
uniform sampler2D blurTexture1;
uniform sampler2D blurTexture2;
uniform sampler2D blurTexture3;
uniform sampler2D blurTexture4;
uniform sampler2D blurTexture5;
uniform vec3 uTintColor;
uniform float uTintStrength;

void main() {
    vec4 color = texture2D(blurTexture1, vUv) + texture2D(blurTexture2, vUv);
    color.rgb = mix(color.rgb, uTintColor, uTintStrength);
    gl_FragColor = color;
}
        `;

        // Effect Composer: Combines render passes for final output.
        const RenderTargetClass =
          this.config.pixelRatio >= 2 ? THREE.WebGLRenderTarget : THREE.WebGLMultisampleRenderTarget;
        this.renderTarget = new RenderTargetClass(this.config.width, this.config.height, {
            generateMipmaps: false, // Disables mipmap generation for performance.
            minFilter: THREE.LinearFilter, // Smooth texture filtering.
            magFilter: THREE.LinearFilter, // Smooth texture filtering.
            format: THREE.RGBFormat, // RGB format for color textures.
            encoding: THREE.sRGBEncoding, // Accurate color rendering.
        });

        this.postProcess.composer = new EffectComposer(this.instance, this.renderTarget);
        this.postProcess.composer.setSize(this.config.width, this.config.height);
        this.postProcess.composer.setPixelRatio(this.config.pixelRatio);

        this.postProcess.composer.addPass(this.postProcess.renderPass); // Adds the render pass.
        this.postProcess.composer.addPass(this.postProcess.unrealBloomPass); // Adds the bloom pass.
    }

    resize() {
        // Function: Adjusts renderer and post-processing sizes on window resize.
        // Effect: Maintains visual consistency by matching new viewport dimensions.
        this.instance.setSize(this.config.width, this.config.height);
        this.instance.setPixelRatio(this.config.pixelRatio);

        if (this.postProcess?.composer) {
            this.postProcess.composer.setSize(this.config.width, this.config.height);
            this.postProcess.composer.setPixelRatio(this.config.pixelRatio);
        }
    }

    update() {
        // Function: Renders the scene or applies post-processing.
        // Effect: Provides real-time updates with or without post-processing effects.
        if (!this.camera || !this.camera.instance) {
            console.warn('Camera instance is not initialized. Skipping renderer update.');
            return;
        }

        if (this.usePostprocess) {
            this.postProcess.composer.render(); // Renders with post-processing.
        } else {
            this.instance.render(this.scene, this.camera.instance); // Renders without post-processing.
        }
    }

    destroy() {
        // Function: Cleans up resources used by the renderer.
        // Effect: Prevents memory leaks by disposing of objects and render targets.
        this.instance.renderLists.dispose();
        this.instance.dispose();
        this.renderTarget.dispose();
        this.postProcess.composer.renderTarget1.dispose();
        this.postProcess.composer.renderTarget2.dispose();
    }
}
