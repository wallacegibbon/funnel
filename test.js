import { Funnel } from "./mod.js";

const funnel = new Funnel();

funnel.on("size", size => console.log("--- current queue size:", size));

async function task(group, name) {
  await sleep(100);
  console.log(`message from group-${group} task-${name}, phase 1`);
  await sleep(100);
  console.log(`message from group-${group} task-${name}, phase 2`);
  await sleep(100);
  console.log(`message from group-${group} task-${name}, phase 3`);
  return name;
}

function sleep(milleseconds) {
  return new Promise((res) => setTimeout(res, milleseconds));
}

async function without_funnel(group) {
  for (let n = 0; n < 3; n++) {
    console.log(`starting group-${group} task-${n}...`);
    const r = await task(group, n);
    console.log(`result of group-${group} task-${n}: ${r}`);
  }
}

async function with_funnel(group) {
  const task_wrapped = funnel.wrap(task);
  for (let n = 0; n < 3; n++) {
    console.log(`starting group-${group} task-${n}...`);
    const r = await task_wrapped(group, n);
    console.log(`result of group-${group} task-${n}: ${r}`);
  }
}

async function test1() {
  return Promise.all([without_funnel("A"), without_funnel("B")])
    .catch(e => console.error(`>> without funnel: ${e.message}`));
}

async function test2() {
  return Promise.all([with_funnel("A"), with_funnel("B")])
    .catch(e => console.error(`>> with funnel: ${e.message}`));
}

async function test_normal() {
  console.log(">>>>>>>>>>>>>>> with funnel test\n");
  await test1();
  console.log("\n\n");
  console.log(">>>>>>>>>>>>>>> with funnel test\n");
  await test2();
  console.log("\n\n");
}

function test_overflow() {
  const funnel = new Funnel(3);
  funnel.on("size", s => console.log(`--- funnel size change: ${s}`));
  const task_wrapped = funnel.wrap(async (idx) => {
    if (idx == 1) throw new Error(`fake error`);
    await sleep(1000);
    return idx;
  });
  for (let i = 0; i < 10; i++) {
    task_wrapped(i).then(
      r => console.log(`>> r(${i}): ${r}`),
      e => console.log(`>> e(${i}): ${e.message}`)
    );
  }
}

test_normal();
//test_overflow();

