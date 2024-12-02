import * as THREE from 'three'
import { Pane } from 'tweakpane'

import Time from './Utils/Time.js'
import Sizes from './Utils/Sizes.js'
import Stats from './Utils/Stats.js'
import EventEmitter from './Utils/EventEmitter.js'

import Resources from './Resources.js'
import Renderer from './Renderer.js'
import Camera from './Camera.js'
import World from './World.js'

import assets from './assets.js'
import Microphone from './Microphone.js'

export default class Experience extends EventEmitter
{
    static instance

    constructor(_options = {})
    {
        super()
        
        if(Experience.instance)
        {
            return Experience.instance
        }
        Experience.instance = this

        // Options
        this.targetElement = _options.targetElement
        this.setTranscription = _options.setTranscription

        if(!this.targetElement)
        {
            console.warn('Missing \'targetElement\' property')
            return
        }

        this.time = new Time()
        this.sizes = new Sizes()
        this.setConfig()
        this.setStats()
        this.setDebug()
        this.setScene()
        this.setCamera()
        this.setRenderer()
        this.setResources()
        this.setPTTButton()
        this.setMicrohopne()
        this.setWorld()
        
        this.sizes.on('resize', () =>
        {
            this.resize()
        })

        this.update()
    }

    setConfig()
    {
        this.config = {}
    
        // Debug
        this.config.debug = window.location.hash === '#debug'

        // Pixel ratio
        this.config.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2)

        // Width and height
        const boundings = this.targetElement.getBoundingClientRect()
        this.config.width = boundings.width
        this.config.height = boundings.height || window.innerHeight
    }

    setStats()
    {
        if(this.config.debug)
        {
            this.stats = new Stats(true)
        }
    }

    setDebug()
    {
        if(this.config.debug)
        {
            this.debug = new Pane()
            this.debug.containerElem_.style.width = '320px'
        }
    }
    
    setScene()
    {
        this.scene = new THREE.Scene()
    }

    setCamera()
    {
        this.camera = new Camera()
    }

    setRenderer()
    {
        this.renderer = new Renderer({ rendererInstance: this.rendererInstance })

        this.targetElement.appendChild(this.renderer.instance.domElement)
    }

    setResources()
    {
        this.resources = new Resources(assets)
    }

    setPTTButton() {
        // Create button element
        this.pttButton = document.createElement('button')
        this.pttButton.className = 'push-to-talk'
        
        // Add microphone icon using SVG
        this.pttButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
        `
        
        // Style the button
        this.pttButton.style.position = 'fixed'
        this.pttButton.style.bottom = '20px'
        this.pttButton.style.left = '50%'
        this.pttButton.style.transform = 'translateX(-50%)'
        this.pttButton.style.width = '60px'
        this.pttButton.style.height = '60px'
        this.pttButton.style.padding = '0'
        this.pttButton.style.backgroundColor = '#8B5CF6' // Purple color
        this.pttButton.style.color = 'white'
        this.pttButton.style.border = 'none'
        this.pttButton.style.borderRadius = '50%'
        this.pttButton.style.cursor = 'pointer'
        this.pttButton.style.display = 'flex'
        this.pttButton.style.alignItems = 'center'
        this.pttButton.style.justifyContent = 'center'
        this.pttButton.style.boxShadow = '0 4px 6px rgba(139, 92, 246, 0.3)' // Purple shadow
        this.pttButton.style.transition = 'all 0.3s ease'
        this.pttButton.style.zIndex = '1000'

        // Add hover effect
        this.pttButton.onmouseover = () => {
            this.pttButton.style.backgroundColor = '#7C3AED' // Darker purple
            this.pttButton.style.transform = 'translateX(-50%) scale(1.1)'
        }
        this.pttButton.onmouseout = () => {
            this.pttButton.style.backgroundColor = '#8B5CF6'
            this.pttButton.style.transform = 'translateX(-50%) scale(1)'
        }

        // Add active state style
        this.pttButton.onmousedown = () => {
            this.pttButton.style.backgroundColor = '#6D28D9' // Even darker purple
            this.pttButton.style.transform = 'translateX(-50%) scale(0.95)'
        }
        this.pttButton.onmouseup = () => {
            this.pttButton.style.backgroundColor = '#8B5CF6'
            this.pttButton.style.transform = 'translateX(-50%) scale(1)'
        }

        // Add button to DOM
        document.body.appendChild(this.pttButton)
    }

    setMicrohopne()
    {
        this.microphone = new Microphone(this.setTranscription, this.pttButton)
    }

    setWorld()
    {
        this.world = new World()
    }

    update()
    {
        if(this.stats)
            this.stats.update()
        
        this.camera.update()

        if(this.microphone)
            this.microphone.update()

        if(this.world)
            this.world.update()
        
        if(this.renderer)
            this.renderer.update()

        window.requestAnimationFrame(() =>
        {
            this.update()
        })
    }

    resize()
    {
        // Config
        const boundings = this.targetElement.getBoundingClientRect()
        this.config.width = boundings.width
        this.config.height = boundings.height

        this.config.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2)

        if(this.camera)
            this.camera.resize()

        if(this.renderer)
            this.renderer.resize()

        if(this.world)
            this.world.resize()
    }

    destroy()
    {
        if(this.microphone)
        {
            if(this.microphone.recorder)
            {
                this.microphone.stopRecording()
            }
            // Clean up audio context
            if(this.microphone.audioContext)
            {
                this.microphone.audioContext.close()
            }
        }
    }
}
