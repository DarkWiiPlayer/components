const styles = `
	light-mode-only, dark-mode-only { display: none; }
	:root[color-scheme="dark"] dark-mode-only { display: initial; }
	@media (prefers-color-scheme: dark) {
		:root:not([color-scheme]) dark-mode-only { display: initial; }
	}
	:root[color-scheme="light"] light-mode-only { display: initial; }
	@media (prefers-color-scheme: light) {
		:root:not([color-scheme]) light-mode-only { display: initial; }
	}
	:root:not([color-scheme]) override-scheme-only { display: none }
	:root[color-scheme] automatic-scheme-only { display: none }
`

export default class extends HTMLElement {
	static installHelperStyles() {
		const style = document.createElement("style")
		style.innerHTML = styles
		document.head.append(style)
	}

	connectedCallback() {
		if (this.stored) {
			this.set(this.stored)
		} else {
			this.setCurrent()
		}
	}

	setCurrent() {
		this.setAttribute("current", this.current)
	}

	get current() {
		const root = document.documentElement
		if (root.hasAttribute("color-scheme"))
			return root.getAttribute("color-scheme")
		else
			return window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light"
	}

	get automatic() {
		const root = document.documentElement
		return !root.hasAttribute("color-scheme")
	}

	toggle() {
		this.set((this.current == "dark") ? "light" : "dark")
	}

	triToggle() {
		if (this.automatic)
			this.set("light")
		else if (this.current == "light")
			this.set("dark")
		else
			this.reset()
	}

	reset() {
		localStorage?.removeItem?.("color-scheme")
		document.documentElement.removeAttribute("color-scheme")
		this.setCurrent()
	}

	/** @param {string} scheme */
	set(scheme) {
		const root = document.documentElement
		root.setAttribute("color-scheme", scheme)
		localStorage?.setItem?.("color-scheme", scheme)
		this.setCurrent()
	}

	get stored() {
		return localStorage?.getItem?.("color-scheme")
	}
}
