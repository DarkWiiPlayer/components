const sleep = time => new Promise(done => setTimeout(done, time*1e3))

class TypeWriter extends HTMLElement {
	get wait() { return Number(this.getAttribute("wait") || 1) }
	get type() { return Number(this.getAttribute("type") || .1) }
	get back() { return Number(this.getAttribute("back") || .06) }

	get loop() { return this.hasAttribute("loop") }
	set loop(loop) { if (loop) { this.setAttribute("loop", ""); this.run() } else { this.removeAttribute("loop") } }

	#running
	get running() { return this.#running }

	static callbacks = ["Start", "Typed", "Erased", "Connected"].map(name => {
		Object.defineProperty(TypeWriter.prototype, `on${name}`, {get() { return Function(this.getAttribute(`on${name}`)) }})
		Object.defineProperty(TypeWriter.prototype, name.toLowerCase(), {get() { return  new Promise(resolve => this.addEventListener(name.toLowerCase(), (event) => resolve(event.detail), {once: true})) }})
		return name
	})

	constructor() {
		super()
		TypeWriter.callbacks.forEach(name => {
			this.addEventListener(name.toLowerCase(), event => this[`on${name}`](event))
		})
	}

	connectedCallback() {
		this.attachShadow({mode: 'open'})
		if (this.loop)
			this.run()
		this.emit("Connected")
	}

	emit(description, detail=undefined) {
		this.dispatchEvent(new CustomEvent(description.toLowerCase(), {detail}))
	}

	async typeText(target, text) {
		let node = document.createTextNode('')
		target.append(node)
		for (let char of text.split('')) {
			node.appendData(char)
			await sleep(this.type)
		}
	}

	async typeElement(target, elem) { for (let child of elem.childNodes) {
			if ("data" in child) {
				await this.typeText(target, child.textContent.replace(/\s+/g, ' '))
			} else {
				let copy = child.cloneNode(false)
				target.append(copy)
				await this.typeElement(copy, child)
			}
		}
	}

	async emptyText(target) {
		while (target.data.length) {
			target.data = target.data.slice(0, -1)
			await sleep(this.back)
		}
	}

	async emptyElement(target) {
		let children = target.childNodes
		while (children.length) {
			let child = children[children.length-1]
			if ("data" in child) {
				await this.emptyText(child)
			} else {
				await this.emptyElement(child)
			}
			child.remove()
		}
	}

	async run() {
		if (this.running) return
		this.#running = true
		while (true) {
			this.emit("start")

			let subject = this.children[0]
			subject.remove()
			this.append(subject)

			await this.typeElement(this.shadowRoot, subject.cloneNode(true))
			this.emit("typed", subject)
			await sleep(this.wait)

			await this.emptyElement(this.shadowRoot)
			this.emit("erased", subject)
			await sleep(this.wait)

			if (!this.loop) return this.#running=false
		}
	}
}

customElements.define('type-writer', TypeWriter)

export default TypeWriter;
