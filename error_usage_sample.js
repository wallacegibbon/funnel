import { Funnel } from "./mod.js";

const myfunnel = new Funnel(3);
myfunnel.on("size", size => console.log(">>>>>", size));

let wrapped_fn1, wrapped_fn2;

/// You can NOT call a wrapped fn inside another wrapped fn of the same funnel.

async function fn1() {
  console.log("fn1 is started.");
  await wrapped_fn2(); // this will cause DEADLOCK
  //await fn2();
  console.log("fn1 is finished.");
}

async function fn2() {
  console.log("...");
}

wrapped_fn1 = myfunnel.wrap(fn1);
wrapped_fn2 = myfunnel.wrap(fn2);

await wrapped_fn1();

