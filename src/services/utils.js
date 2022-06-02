export function utils() {
  Date.prototype.addDays = function (days) {
    const date = new Date(this.valueOf())
    date.setDate(date.getDate() + days)
    return date
  }
  Date.prototype.removeDays = function (days) {
    const date = new Date(this.valueOf())
    date.setDate(date.getDate() - days)
    return date
  }
  Date.prototype.isToday = function () {
    const today = new Date()
    return this.getDate() === today.getDate()
    && this.getMonth() === today.getMonth()
    && this.getFullYear() === today.getFullYear()
  }

  Number.prototype.round = function (decimals = 2) {
    return Number(`${Math.round(`${this}e${decimals}`)}e-${decimals}`)
  }

  Number.prototype.decimalsCount = function () {
    if (Math.floor(this) !== this) return this.toString().split('.')[1].length || 0
    return 0
  }
}
