const sleep = time => new Promise(done => setTimeout(done, time*1e3))

const special = new Set(['style'])
const visible = element => !special.has(element.tagName.toLowerCase())

class TypeWriter extends HTMLElement {
	get wait() { return Number(this.getAttribute("wait") || 1) }
	get type() { return Number(this.getAttribute("type") || .1) }
	get back() { return Number(this.getAttribute("back") || .06) }

	get loop() { return this.hasAttribute("loop") }
	set loop(loop) { if (loop) { this.setAttribute("loop", ""); this.run() } else { this.removeAttribute("loop") } }

	#running
	get running() { return this.#running }

	static callbacks = ["Typing", "Typed", "Erasing", "Erased", "Connected", "Resumed"].map(name => {
		Object.defineProperty(TypeWriter.prototype, `on${name}`, {get() { return Function(this.getAttribute(`on${name}`)) }})
		Object.defineProperty(TypeWriter.prototype, name.toLowerCase(), {get() { return  new Promise(resolve => this.addEventListener(name.toLowerCase(), (event) => resolve(event.detail), {once: true})) }})
		return name
	})

	resume() { this.emit("resumed") }

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
		for (let char of text) {
			node.appendData(char)
			if (char != ' ')
				await sleep(this.type)
		}
	}

	async typeElement(target, elem) {
		for (let child of elem.childNodes) {
			if ("data" in child) {
				await this.typeText(target, child.textContent.replace(/\s+/g, ' '))
			} else {
				if (visible(child)) {
					let copy = child.cloneNode(false)
					target.append(copy)
					await this.typeElement(copy, child)
				} else {
					let copy = child.cloneNode(true)
					target.append(copy)
				}
			}
		}
	}

	async emptyText(target) {
		while (target.data.length) {
			target.data = [...target.data].slice(0, -1).join('')
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
				if (visible(child))
					await this.emptyElement(child)
			}
			child.remove()
		}
	}

	async run(wait=self=>sleep(self.wait)) {
		if (this.running) return
		this.#running = true
		while (true) {
			this.emit("start")

			let subject = this.children[0]
			subject.remove()
			let content = (subject.content ?? subject).cloneNode(true)
			if (subject.nodeName.toLowerCase() == "template") {
				let old = subject
				subject = document.createElement("template")
				subject.content.append(old.content)
			}
			this.append(subject)

			this.emit("typing", content)
			await this.typeElement(this.shadowRoot, content)
			this.emit("typed", content)
			await wait(this)

			this.emit("erasing", content)
			await this.emptyElement(this.shadowRoot)
			this.emit("erased", content)

			if (!this.loop) return this.#running=false

			await wait(this)
		}
	}
}

customElements.define('type-writer', TypeWriter)

export default TypeWriter;
