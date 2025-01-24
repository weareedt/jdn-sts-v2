import * as THREE from 'three'
import Experience from './Experience'
import vertexShader from './shaders/sphere/vertex.glsl'
import fragmentShader from './shaders/sphere/fragment.glsl'
import AudioService from '../services/AudioService'

export default class Sphere
{
    constructor()
    {
        this.experience = new Experience()
        // this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.updateCounter = 0;

        this.timeFrequency = 0.0003
        this.elapsedTime = 0

        // if(this.debug)
        // {
        //     this.debugFolder = this.debug.addFolder({
        //         title: 'sphere',
        //         expanded: true
        //     })
        //
        //     this.debugFolder.addInput(
        //         this,
        //         'timeFrequency',
        //         { min: 0, max: 0.001, step: 0.000001 }
        //     )
        // }
        
        this.setVariations()
        this.setGeometry()
        this.setLights()
        this.setOffset()
        this.setMaterial()
        this.setMesh()
    }

    setVariations()
{
    this.variations = {}

    this.variations.volume = {}
    this.variations.volume.target = 0
    this.variations.volume.current = 0
    this.variations.volume.upEasing = 0.1
    this.variations.volume.downEasing = 0.005
    this.variations.volume.getValue = () =>
    {
        const levels = AudioService.getLevels()
        const level0 = levels[0] || 0
        const level1 = levels[1] || 0
        const level2 = levels[2] || 0

        return Math.max(level0, level1, level2) * 0.5
    }
    this.variations.volume.getDefault = () =>
    {
        return 0.152
    }

    this.variations.lowLevel = {}
    this.variations.lowLevel.target = 0
    this.variations.lowLevel.current = 0
    this.variations.lowLevel.upEasing = 0.01
    this.variations.lowLevel.downEasing = 0.004
    this.variations.lowLevel.getValue = () =>
    {
        let value = AudioService.getLevels()[0] || 0
        value *= 0.01
        value += 0.0001
        value = Math.max(0, value)

        return value
    }
    this.variations.lowLevel.getDefault = () =>
    {
        return 0.0003
    }
    
    this.variations.mediumLevel = {}
    this.variations.mediumLevel.target = 0
    this.variations.mediumLevel.current = 0
    this.variations.mediumLevel.upEasing = 0.02
    this.variations.mediumLevel.downEasing = 0.01
    this.variations.mediumLevel.getValue = () =>
    {
        let value = AudioService.getLevels()[1] || 0
        value *= 3
        value += 5
        value = Math.max(5, value)

        return value
    }
    this.variations.mediumLevel.getDefault = () =>
    {
        return 5
    }
    
    this.variations.highLevel = {}
    this.variations.highLevel.target = 0
    this.variations.highLevel.current = 0
    this.variations.highLevel.upEasing = 0.05
    this.variations.highLevel.downEasing = 0.002
    this.variations.highLevel.getValue = () =>
    {
        let value = AudioService.getLevels()[2] || 0
        value *= 8
        value += 1
        value = Math.max(1, value)

        return value
    }
    this.variations.highLevel.getDefault = () =>
    {
        return 0.65
    }
}


    setLights()
    {
        this.lights = {}

        // Light A
        this.lights.a = {}

        this.lights.a.intensity = 1.2

        this.lights.a.color = {}
        this.lights.a.color.value = '#ff3e00'
        this.lights.a.color.instance = new THREE.Color(this.lights.a.color.value)

        this.lights.a.spherical = new THREE.Spherical(1, 0.615, 2.049)

        // Light B
        this.lights.b = {}

        this.lights.b.intensity = 1.0

        this.lights.b.color = {}
        this.lights.b.color.value = '#0063ff'
        this.lights.b.color.instance = new THREE.Color(this.lights.b.color.value)

        this.lights.b.spherical = new THREE.Spherical(1, 2.561, - 1.844)

        // // Debug
        // if(this.debug)
        // {
        //     for(const _lightName in this.lights)
        //     {
        //         const light = this.lights[_lightName]
        //
        //         const debugFolder = this.debugFolder.addFolder({
        //             title: _lightName,
        //             expanded: true
        //         })
        //
        //         debugFolder
        //             .addInput(
        //                 light.color,
        //                 'value',
        //                 { view: 'color', label: 'color' }
        //             )
        //             .on('change', () =>
        //             {
        //                 light.color.instance.set(light.color.value)
        //             })
        //
        //         debugFolder
        //             .addInput(
        //                 light,
        //                 'intensity',
        //                 { min: 0, max: 10 }
        //             )
        //             .on('change', () =>
        //             {
        //                 this.material.uniforms[`uLight${_lightName.toUpperCase()}Intensity`].value = light.intensity
        //             })
        //
        //         debugFolder
        //             .addInput(
        //                 light.spherical,
        //                 'phi',
        //                 { label: 'phi', min: 0, max: Math.PI, step: 0.001 }
        //             )
        //             .on('change', () =>
        //             {
        //                 this.material.uniforms[`uLight${_lightName.toUpperCase()}Position`].value.setFromSpherical(light.spherical)
        //             })
        //
        //         debugFolder
        //             .addInput(
        //                 light.spherical,
        //                 'theta',
        //                 { label: 'theta', min: - Math.PI, max: Math.PI, step: 0.001 }
        //             )
        //             .on('change', () =>
        //             {
        //                 this.material.uniforms.uLightAPosition.value.setFromSpherical(light.spherical)
        //             })
        //     }
        // }
    }

    setOffset()
    {
        this.offset = {}
        this.offset.spherical = new THREE.Spherical(1, Math.random() * Math.PI, Math.random() * Math.PI * 2)
        this.offset.direction = new THREE.Vector3()
        this.offset.direction.setFromSpherical(this.offset.spherical)
    }

    setGeometry()
    {
        this.geometry = new THREE.SphereGeometry(1, 128, 128)
        this.geometry.computeTangents()
    }

    setMaterial()
    {
        this.material = new THREE.ShaderMaterial({
            uniforms:
            {
                uLightAColor: { value: this.lights.a.color.instance },
                uLightAPosition: { value: new THREE.Vector3(1, 1, 0) },
                uLightAIntensity: { value: this.lights.a.intensity },

                uLightBColor: { value: this.lights.b.color.instance },
                uLightBPosition: { value: new THREE.Vector3(- 1, - 1, 0) },
                uLightBIntensity: { value: this.lights.b.intensity },

                uSubdivision: { value: new THREE.Vector2(this.geometry.parameters.widthSegments, this.geometry.parameters.heightSegments) },

                uOffset: { value: new THREE.Vector3() },

                uDistortionFrequency: { value: 0.5 },
                uDistortionStrength: { value: 0.3 },
                uDisplacementFrequency: { value: 2.120 },
                uDisplacementStrength: { value: 0.1 },

                uFresnelOffset: { value: -1.609 },
                uFresnelMultiplier: { value: 3.587 },
                uFresnelPower: { value: 1.793 },

                uTime: { value: 0 }
            },
            defines:
            {
                USE_TANGENT: ''
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true
        })

        this.material.uniforms.uLightAPosition.value.setFromSpherical(this.lights.a.spherical)
        this.material.uniforms.uLightBPosition.value.setFromSpherical(this.lights.b.spherical)
        //
        // if(this.debug)
        // {
        //     this.debugFolder.addInput(
        //         this.material.uniforms.uDistortionFrequency,
        //         'value',
        //         { label: 'uDistortionFrequency', min: 0, max: 10, step: 0.01 }
        //     )
        //
        //     this.debugFolder.addInput(
        //         this.material.uniforms.uDistortionStrength,
        //         'value',
        //         { label: 'uDistortionStrength', min: 0, max: 10, step: 0.01 }
        //     )
        //
        //     this.debugFolder.addInput(
        //         this.material.uniforms.uDisplacementFrequency,
        //         'value',
        //         { label: 'uDisplacementFrequency', min: 0, max: 5, step: 0.01 }
        //     )
        //
        //     this.debugFolder.addInput(
        //         this.material.uniforms.uDisplacementStrength,
        //         'value',
        //         { label: 'uDisplacementStrength', min: 0, max: 1, step: 0.01 }
        //     )
        //
        //     this.debugFolder.addInput(
        //         this.material.uniforms.uFresnelOffset,
        //         'value',
        //         { label: 'uFresnelOffset', min: - 2, max: 2, step: 0.01 }
        //     )
        //
        //     this.debugFolder.addInput(
        //         this.material.uniforms.uFresnelMultiplier,
        //         'value',
        //         { label: 'uFresnelMultiplier', min: 0, max: 5, step: 0.01 }
        //     )
        //
        //     this.debugFolder.addInput(
        //         this.material.uniforms.uFresnelPower,
        //         'value',
        //         { label: 'uFresnelPower', min: 0, max: 5, step: 0.01 }
        //     )
        // }
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.scene.add(this.mesh)
    }

    update() {
        this.updateCounter++;
        if (this.updateCounter % 2 === 0) { // Skip every other frame
            return;
        }

        for (let _variationName in this.variations) {
            const variation = this.variations[_variationName];
            variation.target = AudioService.isActive()
              ? variation.getValue()
              : variation.getDefault();

            const easing =
              variation.target > variation.current
                ? variation.upEasing
                : variation.downEasing;
            variation.current +=
              (variation.target - variation.current) *
              easing *
              this.time.delta;
        }

        // Reduced frequency for other calculations
        this.timeFrequency = this.variations.lowLevel.current;
        this.elapsedTime = this.time.delta * this.timeFrequency;

        // Light offset calculation
        const offsetTime = this.elapsedTime * 0.3;
        if (this.updateCounter % 5 === 0) {
            this.offset.spherical.phi =
              ((Math.sin(offsetTime * 0.001) *
                  Math.sin(offsetTime * 0.00321)) *
                0.5 +
                0.5) *
              Math.PI;
            this.offset.spherical.theta =
              ((Math.sin(offsetTime * 0.0001) *
                  Math.sin(offsetTime * 0.000321)) *
                0.5 +
                0.5) *
              Math.PI *
              2;
            this.offset.direction.setFromSpherical(this.offset.spherical);
            this.offset.direction.multiplyScalar(this.timeFrequency * 2);
            this.material.uniforms.uOffset.value.add(this.offset.direction);
        }

        // Time update for material
        this.material.uniforms.uTime.value += this.elapsedTime;
    }
}
