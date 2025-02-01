import * as THREE from 'three'
import Experience from './Experience'
import vertexShader from './shaders/sphere/vertex.glsl'
import fragmentShader from './shaders/sphere/fragment.glsl'
import AudioService from '../services/AudioService'

//sphere movement and behavior
export default class Sphere
{
    constructor()
    {
        // Function: Initializes the Sphere class and its dependencies.
        // Effect: Sets up the scene, time, variations, geometry, lights, material, and mesh.
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.updateCounter = 0

        this.timeFrequency = 0.0003 // Base frequency for time calculations.
        this.elapsedTime = 0 // Tracks the total elapsed time for animations.

        this.setVariations()
        this.setGeometry()
        this.setLights()
        this.setOffset()
        this.setMaterial()
        this.setMesh()
    }

    setVariations()
    {
        // Function: Configures dynamic variations for audio-based visual effects.
        // Effect: Defines volume, low, medium, and high-level variations with easing and default values.
        this.variations = {}

        this.variations.volume = {
            target: 0,
            current: 0,
            upEasing: 0.1,
            downEasing: 0.005,
            getValue: () => {
                const levels = AudioService.getLevels()
                const maxLevel = Math.max(levels[0] || 0, levels[1] || 0, levels[2] || 0)
                return maxLevel * 0.5
            },
            getDefault: () => 0.152
        }

        this.variations.lowLevel = {
            target: 0,
            current: 0,
            upEasing: 0.01,
            downEasing: 0.004,
            getValue: () => {
                let value = (AudioService.getLevels()[0] || 0) * 0.01 + 0.0001
                return Math.max(0, value)
            },
            getDefault: () => 0.0003
        }

        this.variations.mediumLevel = {
            target: 0,
            current: 0,
            upEasing: 0.02,
            downEasing: 0.01,
            getValue: () => {
                let value = (AudioService.getLevels()[1] || 0) * 3 + 5
                return Math.max(5, value)
            },
            getDefault: () => 5
        }

        this.variations.highLevel = {
            target: 0,
            current: 0,
            upEasing: 0.05,
            downEasing: 0.002,
            getValue: () => {
                let value = (AudioService.getLevels()[2] || 0) * 8 + 1
                return Math.max(1, value)
            },
            getDefault: () => 0.65
        }
    }

    setLights()
    {
        // Function: Sets up the lighting configuration for the sphere.
        // Effect: Creates two dynamic lights (A and B) with intensity, color, and spherical positions.
        this.lights = {}

        this.lights.a = {
            intensity: 1.2,
            color: { value: '#ff3e00', instance: new THREE.Color('#ff3e00') },
            spherical: new THREE.Spherical(1, 0.615, 2.049)
        }

        this.lights.b = {
            intensity: 1.0,
            color: { value: '#0063ff', instance: new THREE.Color('#0063ff') },
            spherical: new THREE.Spherical(1, 2.561, -1.844)
        }
    }

    setOffset()
    {
        // Function: Initializes the offset values for dynamic movement of the sphere.
        // Effect: Creates a spherical offset and sets a direction for motion based on random angles.
        this.offset = {
            spherical: new THREE.Spherical(1, Math.random() * Math.PI, Math.random() * Math.PI * 2),
            direction: new THREE.Vector3()
        }
        this.offset.direction.setFromSpherical(this.offset.spherical)
    }

    setGeometry()
    {
        // Function: Creates the sphere geometry.
        // Effect: Generates a sphere with specified dimensions and computes tangents for shader use.
        this.geometry = new THREE.SphereGeometry(1, 128, 128)
        this.geometry.computeTangents()
    }

    setMaterial()
    {
        // Function: Sets up the material using custom shaders and uniforms.
        // Effect: Controls the appearance of the sphere, including lighting, distortions, and transparency.
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uLightAColor: { value: this.lights.a.color.instance },
                uLightAPosition: { value: new THREE.Vector3(1, 1, 0) },
                uLightAIntensity: { value: this.lights.a.intensity },
                uLightBColor: { value: this.lights.b.color.instance },
                uLightBPosition: { value: new THREE.Vector3(-1, -1, 0) },
                uLightBIntensity: { value: this.lights.b.intensity },
                uSubdivision: { value: new THREE.Vector2(this.geometry.parameters.widthSegments, this.geometry.parameters.heightSegments) },
                uOffset: { value: new THREE.Vector3() },
                uDistortionFrequency: { value: 0.5 },
                uDistortionStrength: { value: 0.3 },
                uDisplacementFrequency: { value: 2.12 },
                uDisplacementStrength: { value: 0.1 },
                uFresnelOffset: { value: -1.609 },
                uFresnelMultiplier: { value: 3.587 },
                uFresnelPower: { value: 1.793 },
                uTime: { value: 0 }
            },
            defines: {
                USE_TANGENT: ''
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true
        })

        // Setting initial light positions from spherical coordinates.
        this.material.uniforms.uLightAPosition.value.setFromSpherical(this.lights.a.spherical)
        this.material.uniforms.uLightBPosition.value.setFromSpherical(this.lights.b.spherical)
    }

    setMesh()
    {
        // Function: Combines geometry and material to create the sphere mesh.
        // Effect: Adds the sphere mesh to the scene for rendering.
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.set(0.06, 1, 0);
        this.scene.add(this.mesh)
    }

    update()
    {
        // Function: Updates the sphere's variations, offset, and time for animations.
        // Effect: Creates dynamic visual effects based on audio levels and elapsed time.

        this.updateCounter++
        if (this.updateCounter % 2 === 0) return // Skip every other frame for performance.

        for (let _variationName in this.variations) {
            const variation = this.variations[_variationName]
            variation.target = AudioService.isActive() ? variation.getValue() : variation.getDefault()

            const easing = variation.target > variation.current ? variation.upEasing : variation.downEasing
            variation.current += (variation.target - variation.current) * easing * this.time.delta
        }

        this.timeFrequency = this.variations.lowLevel.current
        this.elapsedTime = this.time.delta * this.timeFrequency

        const offsetTime = this.elapsedTime * 0.3
        if (this.updateCounter % 5 === 0) {
            this.offset.spherical.phi = ((Math.sin(offsetTime * 0.001) * Math.sin(offsetTime * 0.00321)) * 0.5 + 0.5) * Math.PI
            this.offset.spherical.theta = ((Math.sin(offsetTime * 0.0001) * Math.sin(offsetTime * 0.000321)) * 0.5 + 0.5) * Math.PI * 2
            this.offset.direction.setFromSpherical(this.offset.spherical)
            this.offset.direction.multiplyScalar(this.timeFrequency * 2)
            this.material.uniforms.uOffset.value.add(this.offset.direction)
        }

        this.material.uniforms.uTime.value += this.elapsedTime
    }
}
