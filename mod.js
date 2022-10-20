import { EventEmitter } from "https://deno.land/std@0.160.0/node/events.ts";

export class Funnel extends EventEmitter {

/// Create a funnel object, then you can use the funnel object to wrap
/// the functions you want to execute in sequence.
constructor(size_limit) {
	super();
	this.size_limit = size_limit;
	this.task_queue = [];
	this.running = false;
}

wrap(fn) {
	return ((...args) => new Promise((res, rej) => {
		if (this.task_queue.length >= this.size_limit) {
			rej(new Error(
				`funnel reached max size ${this.size_limit}`
			));
			return;
		}
		this.task_queue.push({ fn, args, res, rej });
		this.emit("size", this.task_queue.length);
		if (!this.running) {
			this.running = true;
			setTimeout(() => this.run());
		}
	}));
}

/// run all the tasks in the task queue in sequence.
async run() {
	while (true) {
		const task = this.task_queue.shift();
		this.emit("size", this.task_queue.length);
		if (!task) {
			this.running = false;
			return;
		}
		await this.exec(task);
	}
}

async exec({ fn, args, res, rej }) {
	try {
		res(await fn(...args));
	} catch (err) {
		rej(err);
	}
}

} // class Funnel

