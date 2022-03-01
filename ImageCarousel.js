const slot = name => {
	const element = document.createElement("slot")
	element.name = name
	return element
}

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
	console.log(from, center, to)
	if (array[center] < value)
		return lastSmaller(value, array, center, to)
	else
		return lastSmaller(value, array, from, center)
}

const css = `
	:host { display: block; }
	#container {
		position: relative;
		width: 100%;
	}
	#outer {
		scroll-behavior: smooth;
		overflow: hidden;
		position: relative;
	}
	#inner {
		display: block;
		width: max-content;
		overflow: hidden;
	}
	.button {
		fill: white;
		height: 2em;
		top: calc(50% - 1em);
		width: 1.2em;
		position: absolute;
		cursor: pointer;
	}
	#left { left: 1em; }
	#right { right: 1em; transform: rotateZ(180deg) }
`

const arrow = (id) => {
	let button = document.createElementNS('http://www.w3.org/2000/svg', 'svg') 
	button.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
	button.setAttribute('viewBox', '0 0 100 100')
	button.setAttribute('preserveAspectRatio', 'none')
	button.id = id
	button.part = "controls"
	button.classList.add("button")
	let path = button.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path'))
	path.setAttribute('d', 'M 0,50 100,0 100,100 0,50')
	button.addEventListener('click', () => {scroll(outer, component, 1); reset()})
	return button
}

class ImageCarousel extends HTMLElement {
	#timer

	constructor() {
		super()
	}

	connectedCallback() {
		this.attachShadow({mode: "open"}).innerHTML = `
			<style>${css}</style>
			<div id="container">
				<div id="outer">
					<slot id="inner" name="image"></slot>
				</div>
				${arrow("right").outerHTML}
				${arrow("left").outerHTML}
			</div>
		`
		this.shadowRoot
			.getElementById('right')
			.addEventListener("click", event => { this.advance(); this.startTimer() })
		this.shadowRoot
			.getElementById('left')
			.addEventListener("click", event => { this.rewind(); this.startTimer() })
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

	get inner() { return this.shadowRoot.getElementById("inner") }
	get outer() { return this.shadowRoot.getElementById("outer") }
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
			this.position = offsets[firstLarger(this.position, offsets) % offsets.length]
		} else {
			this.position = 0
		}
	}

	rewind() {
		if (0 < this.position) {
			const offsets = this.offsets
			this.position = offsets[lastSmaller(this.position, offsets) % offsets.length]
		} else {
			this.position = this.width
		}
	}
}

customElements.define("image-carousel", ImageCarousel)
