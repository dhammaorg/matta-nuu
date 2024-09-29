export function debounce(func, delay) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), delay)
  }
}

export function debounceDirective(el, binding) {
  if (binding.value !== binding.oldValue) { // change debounce only if interval has changed
    el.oninput = debounce(() => {
      el.dispatchEvent(new Event('change'))
    }, parseInt(binding.value) || 500)
  }
}
