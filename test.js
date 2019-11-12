const Funnel = require('./')

const funnel = new Funnel()

funnel.on('size', size => console.log('-----------------------> current queue size:', size))

async function task(group, name, x, y, z)
{
	await sleep(100)
	console.log(`position of group-${group} task-${name} is (${x}-${y}-${z}), 1`)
	await sleep(100)
	console.log(`position of group-${group} task-${name} is (${x}-${y}-${z}), 2`)
	await sleep(100)
	console.log(`position of group-${group} task-${name} is (${x}-${y}-${z}), 3`)
	return name
}

function sleep(ms)
{
	return new Promise((res) => setTimeout(res, ms))
}

async function withoutFunnel(group)
{
	console.log(`\n\ntesting without funnel ${group}...`)
	for (let n = 0; n < 3; n++)
	{
		console.log(`starting group-${group} task-${n}...`)
		const r = await task(group, n, 1, 2, 3)
		console.log(`result of group-${group} task-${n}: ${r}`)
	}
}

async function withFunnel(group)
{
	console.log(`\n\ntesting with funnel ${group}...`)
	const taskF = funnel.wrap(task)
	for (let n = 0; n < 5; n++)
	{
		console.log(`starting group-${group} task-${n}...`)
		const r = await taskF(group, n, 1, 2, 3)
		console.log(`result of group-${group} task-${n}: ${r}`)
	}
}

// Promise.all([ withoutFunnel('A'), withoutFunnel('B') ])
// 	.catch(e => console.error(`>> without funnel: ${e.message}`))
// 	.then(() => Promise.all([ withFunnel('A'), withFunnel('B') ]))
// 	.catch(e => console.error(`>> with funnel: ${e.message}`))


function testOverflow()
{
	const funnel = new Funnel(3)
	funnel.on('size', s => console.log(`>> s: funnel size change: ${s}`))
	const fn = (
		async (idx) =>
		{
			await sleep(3000)
			return idx
		}
	)
	const taskF = funnel.wrap(fn)
	for (let i = 0; i < 10; i++)
	{
		taskF(i).then(
			r => console.log(`>> r(${i}): ${r}`),
			e => console.log(`>> e(${i}): ${e.message}`)
		)
	}
}

testOverflow()
