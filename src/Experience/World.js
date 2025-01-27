import * as THREE from 'three'
import Experience from './Experience.js'
import Sphere from './Sphere.js'

//act as central manager that set and maintain the main components for sphere
//  including the resources
export default class World
{
    constructor(_options)
    {
        // Function: Initializes the World class and sets up key components.
        // Effect: Links the Experience, configuration, scene, and resources together, and sets event listeners for resource loading.
        this.experience = new Experience()
        this.config = this.experience.config
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        // Event Listener: Triggers specific methods once the resource group named 'base' is loaded.
        // Effect: Sets the background and initializes the sphere object in the scene.
        this.resources.on('groupEnd', (_group) =>
        {
            if(_group.name === 'base')
            {
                this.setBackground()
                this.setSphere()
            }
        })
    }

    setBackground()
    {
        // Function: Configures and applies a texture as the scene's background.
        // Effect: Enhances visual appearance with a texture if loaded; otherwise, logs a warning.
        const texture = this.resources.items.lennaTexture
        if (texture) {
            texture.encoding = THREE.sRGBEncoding // Optimizes texture for accurate color rendering.
            texture.generateMipmaps = false // Prevents mipmap generation to save memory and processing power.
            texture.minFilter = THREE.LinearFilter // Ensures smooth texture scaling when minified.
            texture.magFilter = THREE.LinearFilter // Ensures smooth texture scaling when magnified.
            texture.wrapS = THREE.ClampToEdgeWrapping // Prevents texture repetition on the horizontal axis.
            texture.wrapT = THREE.ClampToEdgeWrapping // Prevents texture repetition on the vertical axis.
            this.scene.background = texture // Sets the processed texture as the scene's background.
        } else {
            console.warn('Background texture not loaded') // Logs a warning if the texture is missing.
        }
    }

    setSphere()
    {
        // Function: Instantiates and initializes the Sphere object.
        // Effect: Adds a sphere object to the scene, which can be updated or manipulated later.
        this.sphere = new Sphere()
    }

    resize()
    {
        // Function: Placeholder for handling window resize events.
        // Effect: Can be used to update the scene or objects to adapt to a new screen size.
    }

    update()
    {
        // Function: Updates components of the world that require animation or interaction.
        // Effect: Calls the update method on the Sphere object if it exists, ensuring real-time updates.
        if(this.sphere)
            this.sphere.update()
    }

    destroy()
    {
        // Function: Placeholder for cleaning up resources or listeners when the World is destroyed.
        // Effect: Ensures proper memory management and prevents potential memory leaks.
    }
}
