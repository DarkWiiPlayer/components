const sleep = time => new Promise(done => setTimeout(done, time*1e3))

class TypeWriter extends HTMLElement {
	get words() {
		return this.innerHTML
			.split(/[\n]+/g)
			.map(word => word.replace(/^[ \t]*/g, ''))
	}
	get wait() { return Number(this.getAttribute("wait") || 1) }
	get type() { return Number(this.getAttribute("type") || .1) }
	get back() { return Number(this.getAttribute("back") || .06) }
	
	set words(words) { this.innerHTML = words.join("\n") }
	connectedCallback() {
		this.loop(this.attachShadow({mode: 'open'}))
	}
	async loop(shadow) {
		let content = document.createElement('span')
		content.setAttribute("part", "text")
		shadow.append(content)
		while (true) {
			while(this.words[0].match(new RegExp(`${content.innerText}.+$`))) {
				console.log()
				content.innerText = content.innerText + this.words[0][content.innerText.length]
				await sleep(this.type)
			}
			await sleep(this.wait)
			while(content.innerText.length) {
				content.textContent = content.innerText.slice(0, -1)
				await sleep(this.back)
			}
			await sleep(.5)
			let words = this.words
			this.words = [...words.slice(1), words[0]]
		}
	}
}

customElements.define('type-writer', TypeWriter)

export default TypeWriter;
