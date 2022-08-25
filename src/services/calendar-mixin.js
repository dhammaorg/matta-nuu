export default {
  data() {
    return {
      isMounted: false,
      firstUpdate: true,
    }
  },
  mounted() {
    // delay display of real component so we can display laoding throbber
    setTimeout(() => { this.isMounted = true }, 0)
  },
  updated() {
    const today = document.querySelector('.today')
    if (this.firstUpdate && today) {
      // Scroll to today
      const wrapper = document.querySelector('.p-datatable-wrapper')
      const topLeftCell = document.querySelector('.top-left-cell')
      if (today) wrapper.scrollLeft = today.offsetLeft - topLeftCell.offsetWidth
      this.firstUpdate = false
    }
  },
}
