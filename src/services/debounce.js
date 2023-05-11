export function debounce(fn, delay) {
  let timeoutID = null
  return function () {
    clearTimeout(timeoutID)
    const args = arguments
    const that = this
    timeoutID = setTimeout(() => {
      fn.apply(that, args)
    }, delay)
  }
}

export function debounceDirective(el, binding) {
  if (binding.value !== binding.oldValue) { // change debounce only if interval has changed
    el.oninput = debounce(() => {
      el.dispatchEvent(new Event('change'))
    }, parseInt(binding.value) || 500)
  }
}
