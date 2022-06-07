const encoder = new TextEncoder()

console.warn("This module is still work in progress!")

const hex = data => Array.from(data).map(byte => byte.toString(16).padStart(2, "0")).join('')

const bits = array => {
	for (const count in array) {
		const sum = count*8
		const byte = array[count]
		if (byte) {
			if (byte >= 128)
				return sum
			if (byte >= 64)
				return sum+1
			if (byte >= 32)
				return sum+2
			if (byte >= 16)
				return sum+3
			if (byte >= 8)
				return sum+4
			if (byte >= 4)
				return sum+5
			if (byte >= 2)
				return sum+6
			return sum+7
		}
	}
	return array.length * 8
}

export const generate = async (payload, {difficulty = 8, length = 8, digest = "SHA-256", signal}={}) => {
	const data = new Uint8Array(payload.length + length)
	const salt = new Uint8Array(data.buffer, payload.length)
	data.set(payload)
	for (let count=1; true; count++) {
		if (signal && signal.aborted) throw new DOMError("AbortError", `Aborted via signal (${signal.reason ? signal.reason : "no reason given"}) after ${count-1} attempts`)

		crypto.getRandomValues(salt)

		let hash = await crypto.subtle
			.digest(digest, data)
			.then(buffer => new Uint8Array(buffer))

		if (bits(hash) >= difficulty) {
			console.log(`Found acceptable salt after ${count} attempts: ${hex(salt)}`)
			console.log(`Digest: ${hex(hash)}`)
			return salt
		}
	}
}

class ProofOfWork extends HTMLInputElement {
	#abortController
	#callback
	#form

	constructor() {
		super()
		this.#abortController = new AbortController()
		this.#callback = event => this.update("Form changed callback")
	}

	/* Form update handling */

	connectedCallback() {
		if (this.form) {
			this.form.addEventListener("change", this.#callback)
			this.#form = this.form
		}
		this.update()
	}
	disconnectedCallback() {
		if (this.#form) {
			this.#form.removeEventListener("change", this.#callback)
			this.#form = undefined
		}
	}

	/* Attribute Observers */

	static observedAttributes = Object.freeze(['timestamp', 'difficulty'])

	attributeChangedCallback(attribute, from, to) { this.update(`attribute changed: ${attribute}`) }

	/* Abort Controller */

	get signal() {
		if (this.#abortController.signal.aborted) {
			this.#abortController = new AbortController()
		}
		return this.#abortController.signal
	}

	abort(reason) { this.#abortController.abort(reason) }

	/* Update */

	async update(reason="update") {
		this.abort(`New update triggered -- ${reason}`)

		const payload = this.form
			? Array.from(this.form.querySelectorAll("input[pow]")).map(input => input.value).join("\n")
			: new Date().toISOString()

		const encoded = encoder.encode(payload)

		try {
			this.setCustomValidity("Proof of Work is being generated...")
			const salt = await generate(encoded, this)
			this.value = btoa(salt)
			this.setCustomValidity('')
		} catch (exception) {
			console.warn(exception.message)
		}
	}

	/* Difficulty */

	set difficulty(difficulty) { this.setAttribute("difficulty", difficulty) }
	get difficulty() {
		let difficulty = parseInt(this.getAttribute("difficulty"))
		if (difficulty)
			return difficulty
		else
			return undefined
	}

	/* Defaults */

	get attempts() { return 256*256*256 }
	get digest() { return this.getAttribute("digest") || undefined }
	get length() { return 8 }
}

customElements.define("proof-of-work", ProofOfWork, {extends: "input"})
