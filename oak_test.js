import { Application } from "https://deno.land/x/oak/mod.ts";
import { Funnel } from "./mod.js";

const app = new Application();

const myfunnel = new Funnel(3);
myfunnel.on("size", size => console.log(">>>>>", size));

function sleep(milliseconds) {
	return new Promise((res, _) => setTimeout(res, milliseconds));
}

async function async_fn1(tag) {
	console.log(">>>>>>>> async_fn1 start, ", tag);
	await sleep(1000);
	console.log(">>>>>>>> async_fn1 end, ", tag);
}

//const async_fn = async_fn1;
const async_fn = myfunnel.wrap(async_fn1); /// this will NOT cause DEADLOCK.

async function mid1(ctx, next) {
	console.log("start of mid1");
	await async_fn("mid1");
	await next();
	console.log("end of mid1");
}

async function mid2(ctx, next) {
	console.log("start of mid2");
	await async_fn("mid2");
	await next();
	console.log("end of mid2");
}

async function mid3(ctx, next) {
	console.log("start of mid3");
	await async_fn("mid3");
	await next();
	console.log("end of mid3");
}

/* this will cause DEADLOCK. see `error_usage_sample.js`
app.use(myfunnel.wrap(mid1));
app.use(myfunnel.wrap(mid2));
app.use(myfunnel.wrap(mid3));
*/

app.use(mid1);
app.use(mid2);
app.use(mid3);

console.log("starting server...");
await app.listen({ port: 8888 });

