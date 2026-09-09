// ════════════════════════════════════════════════════════════════════════════
// CHAPTER 04 — THE EVENT LOOP & PROMISES                       run: node 04-*.ts
// ════════════════════════════════════════════════════════════════════════════
// The log-order exercises are the heart of this chapter. For each one, write
// the COMPLETE array of log entries in the exact order they happen. Do it on
// paper BEFORE running. This skill — replaying the event loop in your head —
// is the single highest-signal thing in a JS interview.
//
// Prediction format is the same as before; arrays like ["a", "b"] are compared
// element by element.

// ── harness (same in ch. 01–06; don't edit) ─────────────────────────────────
const TODO: any = Symbol.for("ninja.todo")
let _pass = 0, _fail = 0, _skip = 0
function show(v: unknown): string {
  if (typeof v === "string") return JSON.stringify(v)
  if (typeof v === "number") return Object.is(v, -0) ? "-0" : String(v)
  if (typeof v === "bigint") return v + "n"
  if (typeof v === "function") return `function ${v.name || "(anonymous)"}`
  if (typeof v === "symbol") return v.toString()
  if (v === null || v === undefined) return String(v)
  if (Array.isArray(v)) return `[${v.map(show).join(", ")}]`
  if (v instanceof Error) return v.name
  try { return JSON.stringify(v) ?? String(v) } catch { return String(v) }
}
function check(id: string, actual: unknown, predicted: unknown): void {
  if (actual === TODO) { _skip++; console.log(`TODO ${id} — implement the exercise above`); return }
  if (predicted === TODO) { _skip++; console.log(`SKIP ${id} — no prediction yet`); return }
  const a = show(actual), p = show(predicted)
  if (a === p) { _pass++; console.log(`PASS ${id}`) }
  else { _fail++; console.log(`FAIL ${id} — actual: ${a}, you predicted: ${p}`) }
}
function attempt(fn: () => unknown): unknown {
  try { return fn() } catch (e) { return e instanceof Error ? e.name : `thrown ${show(e)}` }
}
function section(id: string, fn: () => void): void {
  try { fn() } catch (e) { _fail++; console.log(`FAIL ${id} — crashed with ${show(e)} (implement the exercise above)`) }
}
// ── async additions for this chapter ────────────────────────────────────────
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
async function attemptAsync(fn: () => unknown): Promise<unknown> {
  try { return await fn() } catch (e) { return e instanceof Error ? e.name : `thrown ${show(e)}` }
}
async function sectionAsync(id: string, fn: () => Promise<void>): Promise<void> {
  try { await fn() } catch (e) { _fail++; console.log(`FAIL ${id} — crashed with ${show(e)} (implement the exercise above)`) }
}
// ────────────────────────────────────────────────────────────────────────────

// ═══ EXERCISE 4.1 ★★ — the fundamental ordering: sync → microtasks → macrotasks ═══
// TASK: Predict the final log array.
// VOCAB: call stack, microtask queue, macrotask (task) queue, event loop tick
// HINT 1: ALL synchronous code finishes first. Then the ENTIRE microtask queue
//         drains (promises). Only then does ONE macrotask (setTimeout) run.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model

async function scenario4_1() {
  const log: string[] = []
  log.push("start")
  setTimeout(() => log.push("timeout"), 0)
  Promise.resolve().then(() => log.push("microtask"))
  log.push("end")
  await sleep(10)
  return log
}
check("4.1", await scenario4_1(), TODO)

// EXPLAIN IT (2–4 sentences, use the vocab, say it out loud):
/*

*/

// ═══ EXERCISE 4.2 ★★★ — two chains interleave, they don't run to completion ═══
// TASK: Predict the final log array.
// VOCAB: microtask scheduling, then-callback enqueueing
// HINT 1: Each .then callback is a SEPARATE microtask. Finishing A's first
//         .then enqueues A's second — at the BACK of the queue.

async function scenario4_2() {
  const log: string[] = []
  const p = Promise.resolve()
  p.then(() => log.push("A")).then(() => log.push("B"))
  p.then(() => log.push("C")).then(() => log.push("D"))
  await sleep(1)
  return log
}
check("4.2", await scenario4_2(), TODO)

// EXPLAIN IT — why isn't it A, B, C, D?
/*

*/

// ═══ EXERCISE 4.3 ★★★ — async functions run synchronously until the first await ═══
// TASK: Predict the final log array.
// VOCAB: synchronous prefix, suspension point, continuation
// HINT 1: Calling an async function is NOT scheduling — its body runs NOW,
//         on the current stack, until the first await.
// HINT 2: `await null` still suspends: the rest of the function becomes a
//         microtask queued at that moment.

async function scenario4_3() {
  const log: string[] = []
  log.push("sync-1")
  const task = (async () => { log.push("async-sync"); await null; log.push("async-resumed") })()
  log.push("sync-2")
  Promise.resolve().then(() => log.push("then"))
  await sleep(1)
  void task
  return log
}
check("4.3", await scenario4_3(), TODO)

// EXPLAIN IT — why does "async-resumed" beat "then" even though the .then line
// comes later... or does it? Justify with queue positions:
/*

*/

// ═══ EXERCISE 4.4 ★★★ — what .then actually returns ═══
// TASK: Predict each awaited value.
// VOCAB: promise chaining, flattening (assimilation), non-function passthrough
// HINT 1: .then returns a NEW promise resolved with the callback's return
//         value — and if that value is a promise/thenable, it's unwrapped.
// HINT 2: .then(notAFunction) silently passes the value through.

check("4.4a", await Promise.resolve(1).then(v => v + 1).then(v => v * 10), TODO)
check("4.4b", await Promise.resolve(1).then(2 as any), TODO)
check("4.4c", await Promise.resolve(1).then(() => Promise.resolve(7)), TODO)
check("4.4d", await Promise.resolve(1).then(() => {}), TODO)
check("4.4e", await Promise.resolve(Promise.resolve(5)), TODO)

// EXPLAIN IT — "promises auto-flatten". What would Promise<Promise<number>>
// even mean, and why did the designers forbid it?
/*

*/

// ═══ EXERCISE 4.5 ★★★ — error propagation is just another channel ═══
// TASK: Predict each result.
// VOCAB: rejection propagation, recovery, catch-then chaining, finally passthrough
// HINT 1: A throw inside .then rejects the RETURNED promise; the nearest
//         downstream rejection handler gets it; everything between is skipped.
// HINT 2: catch RETURNS a normal promise — after recovery the chain is healthy.

check("4.5a", await Promise.reject(new Error("boom")).catch(e => "caught:" + (e as Error).message), TODO)
check("4.5b", await Promise.resolve(1).then(() => { throw new Error("mid") }).then(() => "skipped").catch(() => "recovered"), TODO)
check("4.5c", await Promise.resolve(1).catch(() => 99).then(v => v + 1), TODO)
check("4.5d", await Promise.reject(new Error("x")).catch(() => 10).then(v => v + 1), TODO)
check("4.5e", await attemptAsync(() => Promise.reject(new TypeError("t"))), TODO)
check("4.5f", await Promise.resolve(3).finally(() => 999), TODO)

// EXPLAIN IT — trace 4.5b hop by hop: which promise rejects, who reacts:
/*

*/

// ═══ EXERCISE 4.6 ★★★ — the Promise constructor: synchronous and single-shot ═══
// TASK: Predict the log and the settled value.
// VOCAB: executor, settled state, resolve idempotence
// HINT 1: The executor runs SYNCHRONOUSLY inside `new Promise(...)`.
// HINT 2: A promise settles exactly once — later resolve/reject calls are
//         silently ignored.

async function scenario4_6() {
  const log: string[] = []
  log.push("before")
  const p = new Promise<number>((resolve, reject) => {
    log.push("executor")
    resolve(1)
    resolve(2)
    reject(new Error("late"))
  })
  log.push("after")
  return { log, value: await p }
}
{
  const r = await scenario4_6()
  check("4.6a", r.log, TODO)
  check("4.6b", r.value, TODO)
}

// EXPLAIN IT — why does "executor runs synchronously" matter in practice
// (think: when do side effects inside new Promise() happen)?
/*

*/

// ═══ EXERCISE 4.7 ★★★★ — the four combinators ═══
// TASK: Predict each result.
// VOCAB: Promise.all (fail-fast), allSettled, race (first settle), any
//        (first FULFILLMENT, AggregateError)

check("4.7a", await Promise.all([1, Promise.resolve(2), sleep(1).then(() => 3)]), TODO)
check("4.7b", await attemptAsync(() => Promise.all([Promise.resolve(1), Promise.reject(new RangeError("no"))])), TODO)
check("4.7c", (await Promise.allSettled([Promise.resolve(1), Promise.reject(new Error("e"))])).map(r => r.status), TODO)
check("4.7d", await Promise.race([sleep(50).then(() => "slow"), sleep(1).then(() => "fast")]), TODO)
check("4.7e", await attemptAsync(() => Promise.race([Promise.reject(new EvalError("first")), sleep(1).then(() => "late")])), TODO)
check("4.7f", await Promise.any([Promise.reject(new Error("a")), sleep(1).then(() => "winner")]), TODO)
check("4.7g", await attemptAsync(() => Promise.any([Promise.reject(new Error("a")), Promise.reject(new Error("b"))])), TODO)

// EXPLAIN IT — one sentence per combinator: what settles it, with what?
/*

*/

// ═══ EXERCISE 4.8 ★★★★ — await in a loop: the accidental serializer ═══
// TASK: Predict maxActive for both versions.
// VOCAB: sequential awaiting, concurrency, fan-out/fan-in

let active = 0, maxActive = 0
async function work(): Promise<number> {
  active++
  maxActive = Math.max(maxActive, active)
  await sleep(10)
  active--
  return 1
}

{
  active = 0; maxActive = 0
  for (let i = 0; i < 3; i++) await work()
  check("4.8a", maxActive, TODO)

  active = 0; maxActive = 0
  await Promise.all([work(), work(), work()])
  check("4.8b", maxActive, TODO)
}

// EXPLAIN IT — when is the 4.8a pattern correct and when is it a performance
// bug? What's the middle ground (bounded concurrency)?
/*

*/

// ═══ EXERCISE 4.9 ★★★★ — thenables: duck-typed promises ═══
// TASK: Predict each result.
// VOCAB: thenable, assimilation, duck typing
// HINT 1: `await x` checks: does x have a callable .then? If yes, it's TREATED
//         as a promise — whatever it actually is.

check("4.9a", await { then: (resolve: (v: number) => void) => resolve(42) }, TODO)
check("4.9b", await Promise.resolve({ then: (r: (v: string) => void) => r("unwrapped") }), TODO)
check("4.9c", await { x: 1 }, TODO)

// EXPLAIN IT — why do thenables exist (interop!), and name the subtle danger
// of returning an object with a `then` method from an async function:
/*

*/

// ═══ EXERCISE 4.10 ★★★★ — implement withTimeout ═══
// TASK: withTimeout(p, ms): resolves/rejects with p if p settles within ms,
//       otherwise rejects with new Error("timeout").
// VOCAB: Promise.race, timer cleanup
// HINT 1: race p against a timer promise that rejects.

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return TODO // ← your solution
}

await sectionAsync("4.10", async () => {
  check("4.10a", await withTimeout(sleep(1).then(() => "ok"), 100), "ok")
  check("4.10b", await attemptAsync(() => withTimeout(sleep(100), 5)), "Error")
})

// EXPLAIN IT — your race in one sentence, plus: does losing the race CANCEL
// the slow promise? (Careful — this is a favorite trick question.)
/*

*/

// ═══ EXERCISE 4.11 ★★★★ — implement promisify ═══
// TASK: Convert an error-first-callback function into a promise-returning one.
// VOCAB: error-first callback, continuation-passing style, promisification

type Callback<T> = (err: Error | null, result?: T) => void

function promisify<A, T>(fn: (arg: A, cb: Callback<T>) => void): (arg: A) => Promise<T> {
  return TODO // ← your solution
}

await sectionAsync("4.11", async () => {
  const readFake = (path: string, cb: Callback<string>) => {
    setTimeout(() => path.startsWith("/") ? cb(null, "data:" + path) : cb(new RangeError("bad path")), 1)
  }
  const read = promisify(readFake)
  check("4.11a", await read("/etc/hosts"), "data:/etc/hosts")
  check("4.11b", await attemptAsync(() => read("relative")), "RangeError")
})

// EXPLAIN IT — describe the two calling conventions you just bridged:
/*

*/

// ═══ EXERCISE 4.12 ★★★★★ — implement Promise.all ═══
// TASK: Implement myAll without using Promise.all/allSettled/any/race.
//       Requirements: preserves input order (NOT completion order), accepts
//       plain values, resolves [] for [], rejects with the FIRST rejection.
// VOCAB: fan-in, result slotting, completion counter
// HINT 1: results[i] = value; done++; if (done === n) resolve(results).
// HINT 2: Wrap each item in Promise.resolve() to handle plain values.

function myAll<T>(items: Array<T | Promise<T>>): Promise<T[]> {
  return TODO // ← your solution
}

await sectionAsync("4.12", async () => {
  check("4.12a", await myAll([sleep(20).then(() => "slow"), sleep(1).then(() => "fast")]), ["slow", "fast"])
  check("4.12b", await myAll([]), [])
  check("4.12c", await myAll([1, 2, 3]), [1, 2, 3])
  const doomed = Promise.reject(new SyntaxError("nope"))
  doomed.catch(() => {}) // pre-handled so an unfinished myAll can't crash the file
  check("4.12d", await attemptAsync(() => myAll([Promise.resolve(1), doomed])), "SyntaxError")
})

// EXPLAIN IT — why does the naive `for (const p of ps) results.push(await p)`
// version differ from yours in BOTH ordering guarantees and total time?
/*

*/

// ═══ EXERCISE 4.13 ★★★★★ — return vs return await: the try/catch trap ═══
// TASK: Predict both results.
// VOCAB: return await, rejection timing, try/catch scope
// HINT 1: `return somePromise` LEAVES the try block immediately — the
//         rejection happens later, outside, where no one is catching.

const failLater = () => sleep(1).then(() => { throw new TypeError("late-fail") })

async function bad4_13(): Promise<unknown> {
  try { return failLater() } catch { return "caught" }
}
async function good4_13(): Promise<unknown> {
  try { return await failLater() } catch { return "caught" }
}
check("4.13a", await attemptAsync(bad4_13), TODO)
check("4.13b", await good4_13(), TODO)

// EXPLAIN IT — this bug ships to production constantly. Explain it like you're
// reviewing a teammate's PR:
/*

*/

// ═══ EXERCISE 4.14 ★★★★★ — the grand ordering gauntlet ═══
// TASK: Predict the COMPLETE log. Take 10 minutes. Use paper. Draw the queues.
// VOCAB: everything in this chapter at once

async function scenario4_14() {
  const log: string[] = []
  log.push("sync-1")
  setTimeout(() => {
    log.push("macro-1")
    Promise.resolve().then(() => log.push("micro-in-macro"))
  }, 0)
  const t = (async () => {
    log.push("async-sync")
    await null
    log.push("async-resumed")
  })()
  Promise.resolve().then(() => {
    log.push("micro-1")
    queueMicrotask(() => log.push("nested-micro"))
  })
  queueMicrotask(() => log.push("qmicro"))
  log.push("sync-2")
  await sleep(10)
  void t
  return log
}
check("4.14", await scenario4_14(), TODO)

// EXPLAIN IT — narrate the whole run: stack, microtask queue, task queue at
// each step. If you can do this fluently, you own the event loop:
/*

*/

// ═══ EXERCISE 4.15 ★★★★ — AbortController: cancellation that composes ═══
// TASK: Implement cancellableDelay(ms, signal): resolves "done" after ms;
//       rejects with an error whose .name === "AbortError" if the signal
//       aborts first (or was already aborted). Must clear the timer on abort.
// VOCAB: AbortController, AbortSignal, cooperative cancellation, cleanup
// HINT 1: signal.aborted for the already-aborted case; signal.addEventListener
//         ("abort", ...) for the future case; clearTimeout in the abort path.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/API/AbortController

function cancellableDelay(ms: number, signal: AbortSignal): Promise<string> {
  return TODO // ← your solution
}

await sectionAsync("4.15", async () => {
  check("4.15a", await cancellableDelay(1, new AbortController().signal), "done")

  const c1 = new AbortController()
  const p1 = cancellableDelay(100, c1.signal)
  c1.abort()
  check("4.15b", await attemptAsync(() => p1), "AbortError")

  const c2 = new AbortController()
  c2.abort()
  check("4.15c", await attemptAsync(() => cancellableDelay(100, c2.signal)), "AbortError")
})

// EXPLAIN IT — why did the platform standardize on PASSING A SIGNAL IN rather
// than a .cancel() method on promises?
/*

*/

console.log(`\nchapter 04: ${_pass} pass, ${_fail} fail, ${_skip} unanswered`)
export {}
