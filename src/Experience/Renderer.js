import * as THREE from 'three';
import Experience from './Experience.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export default class Renderer {
    constructor(_options = {}) {
        this.experience = new Experience();
        this.config = this.experience.config;
        this.debug = this.experience.debug;
        this.stats = this.experience.stats;
        this.time = this.experience.time;
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.camera = this.experience.camera;

        this.usePostprocess = true;

        // if(this.debug)
        // {
        //     this.debugFolder = this.debug.addFolder({
        //         title: 'renderer'
        //     })
        // }

        // Prevent user interaction
        this.targetElement = this.experience.targetElement; // Ensure targetElement is passed from Experience.js
        this.disableUserInteraction();

        this.setInstance();
        this.setPostProcess();
    }

    disableUserInteraction() {
        if (this.targetElement) {
            this.targetElement.addEventListener('wheel', (event) => {
                event.preventDefault(); // Disable scroll zoom
            });

            this.targetElement.addEventListener(
              'touchmove',
              (event) => {
                  if (event.touches.length > 1) {
                      event.preventDefault(); // Disable pinch zoom
                  }
              },
              { passive: false }
            );
        }
    }

    setInstance() {
        this.clearColor = '#010101';

        // Renderer
        this.instance = new THREE.WebGLRenderer({
            alpha: false,
            antialias: false,
        });
        this.instance.domElement.style.position = 'absolute';
        this.instance.domElement.style.top = 0;
        this.instance.domElement.style.left = 0;
        this.instance.domElement.style.width = '100%';
        this.instance.domElement.style.height = '100%';

        // this.instance.setClearColor(0x414141, 1)
        this.instance.setClearColor(this.clearColor, 1);
        this.instance.setSize(this.config.width, this.config.height);
        this.instance.setPixelRatio(this.config.pixelRatio);

        // this.instance.physicallyCorrectLights = true
        // this.instance.gammaOutPut = true
        // this.instance.outputEncoding = THREE.sRGBEncoding
        // this.instance.shadowMap.type = THREE.PCFSoftShadowMap
        // this.instance.shadowMap.enabled = false
        // this.instance.toneMapping = THREE.ReinhardToneMapping
        // this.instance.toneMapping = THREE.ReinhardToneMapping
        // this.instance.toneMappingExposure = 1.3

        this.context = this.instance.getContext();

        // Add stats panel
        // if(this.stats)
        // {
        //     this.stats.setRenderPanel(this.context)
        // }
    }

    setPostProcess() {
        this.postProcess = {};

        // **Add check for uninitialized camera**
        if (!this.camera || !this.camera.instance) {
            console.error('Camera instance is not initialized. Post-process cannot be set.');
            return;
        }

        /**
         * Passes
         */
        // Render pass
        this.postProcess.renderPass = new RenderPass(this.scene, this.camera.instance);

        // Bloom pass
        this.postProcess.unrealBloomPass = new UnrealBloomPass(
          new THREE.Vector2(this.sizes.width, this.sizes.height),
          0.8,
          0.315,
          0
        );
        this.postProcess.unrealBloomPass.enabled = true;

        this.postProcess.unrealBloomPass.tintColor = {};
        this.postProcess.unrealBloomPass.tintColor.value = '#7f00ff';
        this.postProcess.unrealBloomPass.tintColor.instance = new THREE.Color(
          this.postProcess.unrealBloomPass.tintColor.value
        );

        this.postProcess.unrealBloomPass.compositeMaterial.uniforms.uTintColor = {
            value: this.postProcess.unrealBloomPass.tintColor.instance,
        };
        this.postProcess.unrealBloomPass.compositeMaterial.uniforms.uTintStrength = {
            value: 0.15,
        };
        this.postProcess.unrealBloomPass.compositeMaterial.fragmentShader = `
varying vec2 vUv;
uniform sampler2D blurTexture1;
uniform sampler2D blurTexture2;
uniform sampler2D blurTexture3;
uniform sampler2D blurTexture4;
uniform sampler2D blurTexture5;
uniform sampler2D dirtTexture;
uniform float bloomStrength;
uniform float bloomRadius;
uniform float bloomFactors[NUM_MIPS];
uniform vec3 bloomTintColors[NUM_MIPS];
uniform vec3 uTintColor;
uniform float uTintStrength;

float lerpBloomFactor(const in float factor) {
    float mirrorFactor = 1.2 - factor;
    return mix(factor, mirrorFactor, bloomRadius);
}

void main() {
    vec4 color = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
        lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
        lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
        lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
        lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );

    color.rgb = mix(color.rgb, uTintColor, uTintStrength);
    gl_FragColor = color;
}
        `;

        /**
         * Effect composer
         */
        const RenderTargetClass =
          this.config.pixelRatio >= 2 ? THREE.WebGLRenderTarget : THREE.WebGLMultisampleRenderTarget;
        // const RenderTargetClass = THREE.WebGLRenderTarget
        this.renderTarget = new RenderTargetClass(this.config.width, this.config.height, {
            generateMipmaps: false,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBFormat,
            encoding: THREE.sRGBEncoding,
        });
        this.postProcess.composer = new EffectComposer(this.instance, this.renderTarget);
        this.postProcess.composer.setSize(this.config.width, this.config.height);
        this.postProcess.composer.setPixelRatio(this.config.pixelRatio);

        this.postProcess.composer.addPass(this.postProcess.renderPass);
        this.postProcess.composer.addPass(this.postProcess.unrealBloomPass);
    }

    resize() {
        this.instance.setSize(this.config.width, this.config.height);
        this.instance.setPixelRatio(this.config.pixelRatio);

        if (this.postProcess?.composer) {
            this.postProcess.composer.setSize(this.config.width, this.config.height);
            this.postProcess.composer.setPixelRatio(this.config.pixelRatio);
        }
    }

    update() {
        if (!this.camera || !this.camera.instance) {
            console.warn('Camera instance is not initialized. Skipping renderer update.');
            return;
        }

        if (this.usePostprocess) {
            this.postProcess.composer.render();
        } else {
            this.instance.render(this.scene, this.camera.instance);
        }
    }

    destroy() {
        this.instance.renderLists.dispose();
        this.instance.dispose();
        this.renderTarget.dispose();
        this.postProcess.composer.renderTarget1.dispose();
        this.postProcess.composer.renderTarget2.dispose();
    }
}
