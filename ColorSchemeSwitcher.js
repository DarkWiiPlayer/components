export default class extends HTMLElement {
	connectedCallback() {
		if (this.stored) {
			this.set(this.stored)
		}
		this.setCurrent()
	}

	setCurrent() {
		this.setAttribute("current", this.current)
	}

	get current() {
		const root = document.documentElement
		if (root.hasAttribute("color-scheme"))
			return root.getAttribute("color-scheme")
		else
			return window.matchMedia('(prefers-color-scheme: dark)') ? "dark" : "light"
	}

	toggle() {
		const scheme = (this.current == "dark") ? "light" : "dark"
		this.set(scheme)
	}

	set(scheme) {
		const root = document.documentElement
		root.setAttribute("color-scheme", scheme)
		localStorage?.setItem("color-scheme", scheme)
		this.setCurrent()
	}

	get stored() {
		return localStorage?.getItem("color-scheme")
	}
}
