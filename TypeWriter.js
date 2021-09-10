const sleep = time => new Promise(done => setTimeout(done, time*1e3))

class TypeWriter extends HTMLElement {
	get wait() { return Number(this.getAttribute("wait") || 1) }
	get type() { return Number(this.getAttribute("type") || .1) }
	get back() { return Number(this.getAttribute("back") || .06) }

	connectedCallback() {
		this.loop(this.attachShadow({mode: 'open'}))
	}

	async typeText(target, text) {
		let node = document.createTextNode('')
		target.append(node)
		for (let char of text.split('')) {
			node.appendData(char)
			await sleep(this.type)
		}
	}

	async typeElement(target, elem) {
		for (let child of elem.childNodes) {
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

	async loop(root) {
		while (true) {
			let subject = this.children[0]
			subject.remove()
			this.append(subject)
			await this.typeElement(root, subject.cloneNode(true))
			await sleep(this.wait)
			await this.emptyElement(root)
			await sleep(this.wait)
		}
	}
}

customElements.define('type-writer', TypeWriter)

export default TypeWriter;
