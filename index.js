const EventEmitter = require('events')

class Funnel extends EventEmitter
{
	/**
	 * Create a funnel object, then use the funnel to wrap the functions you want to
	 * execute in sequence.
	 */
	constructor(maxQueueSize)
	{
		super()
		this.maxQueueSize
		this.taskQueue = []
		this.running = false
		this.maxQueueSize = maxQueueSize
	}

	/**
	 * No matter fn is aync function or not, wrap will return a function that
	 * returns a Promise object.
	 */
	wrap(fn)
	{
		return (
			(...args) =>
			new Promise(
				(res, rej) =>
				{
					if (!this.maxQueueSize ||
						(this.taskQueue.length < this.maxQueueSize))
					{
						this.taskQueue.push({ fn, args, res, rej })
						this.emit('size', this.taskQueue.length)
						if (!this.running)
						{
							this.running = true
							this.run()
						}
					}
					else
					{
						rej(new Error(`funnel reached max size ${this.maxQueueSize}`))
					}
				}
			)
		)
	}

	/**
	 * run all the tasks in the task queue.
	 */
	async run()
	{
		while (true)
		{
			const task = this.taskQueue.shift()
			this.emit('size', this.taskQueue.length)
			if (!task)
			{
				this.running = false
				return
			}
			await this.exec(task)
		}
	}

	/**
	 * execute the task and return the calculated result
	 */
	async exec(task)
	{
		try
		{
			task.res(await task.fn(...task.args))
		}
		catch (e)
		{
			task.rej(e)
		}
	}
}

module.exports = Funnel
