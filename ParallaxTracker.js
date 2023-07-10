const observer = new IntersectionObserver(events => {
	for (const event of events) {
		if (event.isIntersecting)
			event.target.listen()
		else
			event.target.unlisten()
	}
})

class ParallaxTracker extends HTMLElement {
	#abortController

	connectedCallback() {
		observer.observe(this)
	}

	get parallaxY() {
		const screen = window.innerHeight
		const { height, top } = this.getBoundingClientRect()
		const raw = -(top-screen) / (height+screen)
		return Math.max(0, Math.min(raw, 1))
	}

	update() {
		this.style.setProperty("--parallax-y", this.parallaxY)
		this.style.setProperty("--parallax-h", `${this.getBoundingClientRect().height}px`)
	}

	listen() {
		this.update()
		document.addEventListener("scroll", this.update.bind(this), {signal: this.signal})
	}

	unlisten() {
		this.update()
		this.abort()
	}

	get signal() {
		if (!this.#abortController) this.#abortController = new AbortController()
		return this.#abortController.signal
	}

	abort() {
		if (this.#abortController) {
			this.#abortController.abort()
			this.#abortController = undefined
		}
	}
}

customElements.define('parallax-tracker', ParallaxTracker)

export default ParallaxTracker;
