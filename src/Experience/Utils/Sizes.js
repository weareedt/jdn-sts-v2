import EventEmitter from './EventEmitter.js'

export default class Sizes extends EventEmitter
{
    constructor()
    {
        super()

        // Viewport size
        this.viewport = {}
        this.$sizeViewport = document.createElement('div')
        this.$sizeViewport.style.width = '100vw'
        this.$sizeViewport.style.height = '15vh' // Set height to 15% of viewport height
        this.$sizeViewport.style.position = 'absolute'
        this.$sizeViewport.style.top = '5vh' // Position 5% from top
        this.$sizeViewport.style.left = 0
        this.$sizeViewport.style.pointerEvents = 'none'

        // Resize event
        this.resize = this.resize.bind(this)
        window.addEventListener('resize', this.resize)

        this.resize()
    }

    resize()
    {
        document.body.appendChild(this.$sizeViewport)
        this.viewport.width = this.$sizeViewport.offsetWidth
        this.viewport.height = this.$sizeViewport.offsetHeight
        document.body.removeChild(this.$sizeViewport)

        this.width = window.innerWidth
        this.height = window.innerHeight * 0.15 // 15% of viewport height

        this.trigger('resize')
    }
}
