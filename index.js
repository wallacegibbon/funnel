const EventEmitter = require('events')

class Funnel extends EventEmitter
{
	/**
	 * Create a funnel object, then use the funnel to wrap the functions you want to
	 * execute in sequence.
	 */
	constructor()
	{
		super()
		this.taskQueue = []
		this.running = false
	}

	/**
	 * No matter fn is aync function or not, wrap will return a function that
	 * returns a Promise object.
	 */
	wrap(fn)
	{
		return (...args) =>
		{
			return new Promise(
				(res, rej) =>
				{
					this.taskQueue.push({ fn, args, res, rej })
					this.emit('size', this.taskQueue.length)
					if (!this.running)
					{
						this.running = true
						this.run()
					}
				}
			)
		}
	}

	/**
	 * run all the tasks in the task queue.
	 */
	async run()
	{
		while (await this.next())
		{}
		this.running = false
	}

	/**
	 * run the next task in this.taskQueue, and return the result to its caller.
	 */
	async next()
	{
		const task = this.taskQueue.shift()
		if (!task)
		{
			return false
		}
		this.emit('size', this.taskQueue.length)
		try
		{
			const r = task.fn(...task.args)
			if (r.constructor === Promise)
			{
				task.res(await r)
			}
			else
			{
				task.res(r)
			}
		}
		catch (e)
		{
			task.rej(e)
		}
		return true
	}
}

module.exports = Funnel
