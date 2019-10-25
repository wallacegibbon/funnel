const Funnel = require('./')

const funnel = new Funnel()

funnel.on('size', size => console.log('-----------------------> current queue size:', size))

async function task(group, name, x, y, z)
{
	await sleep(1000)
	console.log(`position of group-${group} task-${name} is (${x}-${y}-${z}), 1`)
	await sleep(1000)
	console.log(`position of group-${group} task-${name} is (${x}-${y}-${z}), 2`)
	await sleep(1000)
	console.log(`position of group-${group} task-${name} is (${x}-${y}-${z}), 3`)
	return name
}

function sleep(ms)
{
	return new Promise((res) => setTimeout(res, ms))
}

async function withoutFunnel(group)
{
	console.log('testing without funnel...')
	for (let n = 0; n < 3; n++)
	{
		console.log(`starting group-${group} task-${n}...`)
		const r = await task(group, n, 1, 2, 3)
		console.log(`result of group-${group} task-${n}: ${r}`)
	}
}

async function withFunnel(group)
{
	console.log('testing with funnel...')
	const taskF = funnel.wrap(task)
	for (let n = 0; n < 3; n++)
	{
		console.log(`starting group-${group} task-${n}...`)
		const r = await taskF(group, n, 1, 2, 3)
		console.log(`result of group-${group} task-${n}: ${r}`)
	}
}

Promise.all([ withoutFunnel('A'), withoutFunnel('B') ])
	.then(() => Promise.all([ withFunnel('A'), withFunnel('B') ]))
