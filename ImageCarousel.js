const firstLarger = (value, array, from=-1, to=array.length) => {
	if (from+1 === to)
		return to
	const center = Math.ceil((from+to)/2)
	if (array[center] <= value)
		return firstLarger(value, array, center, to)
	else
		return firstLarger(value, array, from, center)
}

const lastSmaller = (value, array, from=-1, to=array.length) => {
	if (from+1 === to)
		return from
	const center = Math.floor((from+to)/2)
	if (array[center] < value)
		return lastSmaller(value, array, center, to)
	else
		return lastSmaller(value, array, from, center)
}

const css = `
	:host { display: block; }
	.container {
		position: relative;
		width: 100%;
	}
	.outer {
		scroll-behavior: smooth;
		overflow: hidden;
		position: relative;
	}
	.inner {
		display: block;
		width: max-content;
		overflow: hidden;
	}
	[part="controls"] {
		display: contents;
	}
	.button {
		fill: white;
		height: 2em;
		top: calc(50% - 1em);
		width: 1.2em;
		position: absolute;
		cursor: pointer;
	}
	.left { left: 1em; }
	.right { right: 1em; transform: rotateZ(180deg) }
`

class ImageCarousel extends HTMLElement {
	#timer

	constructor() {
		super()
	}

	connectedCallback() {
		this.attachShadow({mode: "open"}).innerHTML = `
			<style>${css}</style>
			<div class="container">
				<div class="outer">
					<slot class="inner"></slot>
				</div>
				<div part="controls">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none" class="button right">
						<path d="M 0,50 100,0 100,100 0,50"></path>
					</svg>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none" class="button left">
						<path d="M 0,50 100,0 100,100 0,50"></path>
					</svg>
				</div>
			</div>
		`
		this.shadowRoot
			.querySelector(".right")
			.addEventListener("click", () => { this.advance(); this.startTimer() })
		this.shadowRoot
			.querySelector(".left")
			.addEventListener("click", () => { this.rewind(); this.startTimer() })
		Array.from(this.childNodes)
			.filter(element => element.nodeName == "#text")
			.forEach(element => element.remove())
		this.startTimer(2e3)
	}

	disconnectedCallback() {
		this.cancelTimer()
	}

	startTimer() {
		this.cancelTimer()
		if (this.interval)
			this.#timer = setInterval(() => this.advance(), this.interval)
	}

	get interval() { return Number(this.getAttribute("interval")) }

	get inner() { return this.shadowRoot.querySelector(".inner") }
	get outer() { return this.shadowRoot.querySelector(".outer") }
	get images() { return this.inner.assignedNodes() }
	get offsets() {
		const start = this.inner.getBoundingClientRect().x
		return this.images.map(element => element.getBoundingClientRect().x - start)
	}
	get position() { return this.outer.scrollLeft }
	set position(pos) { this.outer.scrollLeft = pos }
	get width() { return this.outer.scrollWidth }
	get boxWidth() { return this.outer.getBoundingClientRect().width }

	cancelTimer() {
		clearInterval(this.#timer)
		this.#timer = undefined
	}

	advance() {
		if (this.position < this.width - this.boxWidth) {
			const offsets = this.offsets
			this.position = offsets[firstLarger(this.position+5, offsets) % offsets.length]
		} else {
			this.position = 0
		}
	}

	rewind() {
		if (0 < this.position) {
			const offsets = this.offsets
			this.position = offsets[lastSmaller(this.position-5, offsets) % offsets.length]
		} else {
			this.position = this.width
		}
	}
}

customElements.define("image-carousel", ImageCarousel)
