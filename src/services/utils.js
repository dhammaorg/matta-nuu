/* eslint-disable no-extend-native */
/* eslint-disable import/prefer-default-export */
/* eslint-disable func-names */
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
    return this.equals(new Date())
  }
  Date.prototype.isTodayOrAfter = function () {
    if (this.isToday()) return true
    return this >= new Date()
  }
  Date.prototype.equals = function (date) {
    return this.getDate() === date.getDate()
      && this.getMonth() === date.getMonth()
      && this.getFullYear() === date.getFullYear()
  }

  Number.prototype.round = function (decimals = 2) {
    return Number(`${Math.round(`${this}e${decimals}`)}e-${decimals}`)
  }

  Number.prototype.decimalsCount = function () {
    if (Math.floor(this) !== this) return this.toString().split('.')[1].length || 0
    return 0
  }

  String.prototype.crop = function (length) {
    if (this.length <= length) return this
    return `${this.slice(0, length)}.`
  }

  Array.prototype.last = function () {
    return this[this.length - 1]
  }
}
