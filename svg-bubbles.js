import { svg } from "https://cdn.jsdelivr.net/npm/nyooom/render.js"

const styles = new CSSStyleSheet()
styles.replaceSync(`
:host {	contain: size draw; display: block; }
`)

class SvgBubbles extends HTMLElement {
	constructor() {
		super()
		this.svg = svg.svg({ style: "width: 100%; height: 100%" })
		this.attachShadow({ mode: "open" }).append(this.svg)
		this.shadowRoot.adoptedStyleSheets = [styles]
		
		this.update()
				
		setInterval(() => { this.update() }, this.interval)
	}
	
	getNumber(attribute, fallback = 0) {
		return this.hasAttribute(attribute) ? Number(this.getAttribute(attribute)) : fallback
	}
	
	get interval() { return this.getNumber("interval", 50) }
	get distance() { return this.getNumber("distance", 200) }
	get travelTime() { return this.getNumber("travel-time", 10) * 1000 }
	get size() { return this.getNumber("size", 4) }
	get shrink() { return this.getNumber("shrink", .2) }
	get density() { return this.getNumber("density", 10) }

	update() {
		const { width, height } = this.svg.getBoundingClientRect()
		this.svg.setAttribute("viewBox", `0 0 ${width} ${height}`)

		const area = width * height
		const circles = (this.density / 1000) * area / (this.travelTime)
		const abs = Math.floor(circles) + Number(Math.random() < (circles % 1))
		
		for (let i=1; i<= abs; i++) {
			this.drawCircle({width, height})
		}
		
		return {width, height}
	}

	drawCircle({width, height}) {		
		const parallax = this.shrink + Math.random() * (1 - this.shrink)
		
		const circle = svg.circle({
			part: "bubble",
			style: `--random: ${Math.random()}; --parallax: ${parallax}`,
			r: parallax * this.size,
			cx: Math.random() * (width + 20) - 10,
			cy: Math.random() * (height + 20 + this.distance) - 10
		})
		this.svg.append(circle)
		length = this.travelTime * 2/3 + Math.random() * this.travelTime * 1/3
		circle.animate([{
			transformOrigin: `50% 50%`,
			transform: "translate(0, 0)"
		}, {
			transform: `translate(0, -${parallax * this.distance}px)`
		}], length).finished.then(() => circle.remove())
		circle.animate([{opacity: 0}, {opacity: 1, offset: .2}, {opacity: 1, offset: .6}, {opacity: 0}], length)
	}
}
