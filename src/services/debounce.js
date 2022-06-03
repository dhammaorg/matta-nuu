export function debounce(fn, delay) {
  let timeoutID = null
  return function () {
    console.log('enter debounce')
    clearTimeout(timeoutID)
    const args = arguments
    const that = this
    timeoutID = setTimeout(() => {
      console.log('finish debounce')
      fn.apply(that, args)
    }, delay)
  }
}

export function debounceDirective(el, binding) {
  if (binding.value !== binding.oldValue) { // change debounce only if interval has changed
    el.oninput = debounce(() => {
      console.log('dispatch change', el)
      el.dispatchEvent(new Event('change'))
    }, parseInt(binding.value) || 500)
  }
}
