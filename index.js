class Funnel {
  /**
   * Create a funnel object, then use the funnel to wrap the functions you want to
   * execute in sequence.
   */
  constructor() {
    this.taskQueue = []
    this.running = false
  }

  /**
   * No matter fn is aync function or not, wrap will return a function that
   * returns a Promise object.
   */
  wrap(fn) {
    return (...args) => new Promise((res, rej) => this.add(fn, args, res, rej))
  }

  /**
   * run the tasks in this.taskQueue, and return the result to its caller
   */
  async run() {
    for (let task; task = this.taskQueue.shift(); ) {
      try {
        const r = task.fn(...task.args)
        if (r.constructor === Promise) {
          task.res(await r)
        } else {
          task.res(r)
        }
      } catch (e) {
        task.rej(e)
      }
    }
    this.running = false
  }

  add(fn, args, res, rej) {
    this.taskQueue.push({ fn, args, res, rej })
    if (!this.running) {
      this.running = true
      this.run()
    }
  }
}


module.exports = Funnel
