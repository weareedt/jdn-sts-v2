import * as THREE from 'three'
import Experience from './Experience.js'
import Sphere from './Sphere.js'

export default class World
{
    constructor(_options)
    {
        this.experience = new Experience()
        this.config = this.experience.config
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        
        this.resources.on('groupEnd', (_group) =>
        {
            if(_group.name === 'base')
            {
                this.setBackground()
                // this.setSphere()
            }
        })
    }

    setBackground()
    {
        const texture = this.resources.items.lennaTexture
        if (texture) {
            texture.encoding = THREE.sRGBEncoding
            texture.generateMipmaps = false
            texture.minFilter = THREE.LinearFilter
            texture.magFilter = THREE.LinearFilter
            texture.wrapS = THREE.ClampToEdgeWrapping
            texture.wrapT = THREE.ClampToEdgeWrapping
            this.scene.background = texture
        } else {
            console.warn('Background texture not loaded')
        }
    }

    setSphere()
    {
        this.sphere = new Sphere()
    }

    resize()
    {
    }

    update()
    {
        if(this.sphere)
            this.sphere.update()
    }

    destroy()
    {
    }
}
