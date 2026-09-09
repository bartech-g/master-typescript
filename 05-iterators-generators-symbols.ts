// ════════════════════════════════════════════════════════════════════════════
// CHAPTER 05 — ITERATORS, GENERATORS & SYMBOLS                 run: node 05-*.ts
// ════════════════════════════════════════════════════════════════════════════
// Prediction format for iterator results: they're plain objects, so write them
// as { value: X, done: false } / { done: true } — note that a result whose
// value is undefined prints as just {"done":true}.

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
// ── async additions ─────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
async function attemptAsync(fn: () => unknown): Promise<unknown> {
  try { return await fn() } catch (e) { return e instanceof Error ? e.name : `thrown ${show(e)}` }
}
async function sectionAsync(id: string, fn: () => Promise<void>): Promise<void> {
  try { await fn() } catch (e) { _fail++; console.log(`FAIL ${id} — crashed with ${show(e)} (implement the exercise above)`) }
}
// ────────────────────────────────────────────────────────────────────────────

// ═══ EXERCISE 5.1 ★★ — what is actually iterable, and what for...of really does ═══
// TASK: Predict each result.
// VOCAB: iterable protocol, for...of vs for...in, code point vs code unit
// HINT 1: for...in iterates KEYS (as strings, including inherited enumerables);
//         for...of asks Symbol.iterator for VALUES.
// HINT 2: Strings iterate by code POINT: an emoji is one iteration step but
//         two .length units.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols

{
  const arr = ["a", "b"]
  const ofResult: string[] = []
  for (const v of arr) ofResult.push(v)
  check("5.1a", ofResult, TODO)
  const inResult: string[] = []
  for (const k in arr) inResult.push(k)
  check("5.1b", inResult, TODO)
}
check("5.1c", [..."a💙b"], TODO)
check("5.1d", "a💙b".length, TODO)
check("5.1e", attempt(() => [...({ a: 1 } as any)]), TODO)     // are plain objects iterable?
check("5.1f", [...new Set([1, 1, 2])], TODO)
check("5.1g", Array.from({ length: 3 }, (_, i) => i * 2), TODO) // array-LIKE, not iterable

// EXPLAIN IT (2–4 sentences, use the vocab, say it out loud):
/*

*/

// ═══ EXERCISE 5.2 ★★★ — drive an iterator by hand ═══
// TASK: Predict each next() result.
// VOCAB: iterator, next(), IteratorResult, done
// HINT 1: Arrays' iterator ends with { value: undefined, done: true } and
//         stays that way forever.

const it5_2 = ["x", "y"][Symbol.iterator]()
check("5.2a", it5_2.next(), TODO)
check("5.2b", it5_2.next(), TODO)
check("5.2c", it5_2.next(), TODO)
check("5.2d", it5_2.next(), TODO)

// EXPLAIN IT — define "iterable" vs "iterator" in one sentence each. (They are
// different protocols — most people blur them. Don't be most people.)
/*

*/

// ═══ EXERCISE 5.3 ★★★★ — implement range() WITHOUT generators ═══
// TASK: Implement range(start, end, step): an Iterable of numbers
//       [start, end) — by hand, with an object implementing the protocols.
//       Each call to [Symbol.iterator]() must return a FRESH iterator, so the
//       same range can be iterated twice.
// VOCAB: Symbol.iterator, iterator factory, protocol implementation
// HINT 1: return { [Symbol.iterator]() { let i = start; return { next() {...} } } }

function range(start: number, end: number, step = 1): Iterable<number> {
  return TODO // ← your solution
}

section("5.3", () => {
  check("5.3a", [...range(0, 5)], [0, 1, 2, 3, 4])
  check("5.3b", [...range(1, 10, 3)], [1, 4, 7])
  const r = range(0, 3)
  check("5.3c", [...r], [0, 1, 2])
  check("5.3d", [...r], [0, 1, 2])   // second pass must work too!
})

// EXPLAIN IT — why does making the ITERABLE separate from the ITERATOR enable
// 5.3d? What breaks if you return `this` with shared state?
/*

*/

// ═══ EXERCISE 5.4 ★★★ — generator basics: yield vs return ═══
// TASK: Predict each result.
// VOCAB: generator function, generator object, yield, return value of a generator
// HINT 1: `return 3` shows up ONCE as { value: 3, done: true } — and iteration
//         constructs (spread, for...of) IGNORE it.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator

function* gen5_4() { yield 1; yield 2; return 3 }
const g5_4 = gen5_4()
check("5.4a", g5_4.next(), TODO)
check("5.4b", g5_4.next(), TODO)
check("5.4c", g5_4.next(), TODO)
check("5.4d", g5_4.next(), TODO)
check("5.4e", [...gen5_4()], TODO)

// EXPLAIN IT — where does the generator's return value go, and who can see it?
// (Foreshadowing: yield* can.)
/*

*/

// ═══ EXERCISE 5.5 ★★★ — generators are lazy coroutines ═══
// TASK: Predict the complete log.
// VOCAB: lazy evaluation, suspension, resumption
// HINT 1: NOTHING in the body runs until the first next(). Each next() runs
//         exactly up to (and including) the next yield.

const log5_5: string[] = []
function* lazy5_5() {
  log5_5.push("A"); yield 1
  log5_5.push("B"); yield 2
  log5_5.push("C")
}
const g5_5 = lazy5_5()
log5_5.push("created")
g5_5.next(); log5_5.push("first")
g5_5.next(); log5_5.push("second")
g5_5.next()
check("5.5", log5_5, TODO)

// EXPLAIN IT — why does laziness make infinite sequences possible?
/*

*/

// ═══ EXERCISE 5.6 ★★★★ — talking BACK to a generator: next(arg) ═══
// TASK: Predict each .value.
// VOCAB: two-way protocol, yield as an expression, first-next discard
// HINT 1: `const a = yield "..."` — the yield EXPRESSION evaluates to whatever
//         the NEXT next(arg) passes in.
// HINT 2: The argument to the FIRST next() has nowhere to land — it's discarded.

function* echo5_6(): Generator<string, void, number> {
  const a = yield "give me a number"
  const b = yield `got ${a}`
  yield `sum ${a + b}`
}
const g5_6 = echo5_6()
check("5.6a", g5_6.next().value, TODO)
check("5.6b", g5_6.next(10).value, TODO)
check("5.6c", g5_6.next(32).value, TODO)

// EXPLAIN IT — draw the timeline: which next() call delivers which value to
// which yield? (This asymmetry is THE thing to be able to articulate.)
/*

*/

// ═══ EXERCISE 5.7 ★★★★ — yield* delegation ═══
// TASK: Predict the spread result.
// VOCAB: delegation, yield*, inner return value
// HINT 1: yield* forwards every yield of the inner generator, and EVALUATES TO
//         the inner generator's return value.

function* inner5_7() { yield "i1"; yield "i2"; return "inner-done" }
function* outer5_7() {
  yield "o1"
  const r = yield* inner5_7()
  yield `r:${r}`
}
check("5.7", [...outer5_7()], TODO)

// EXPLAIN IT — so THAT's who sees a generator's return value. Explain how
// yield* differs from `for (const v of inner()) yield v`:
/*

*/

// ═══ EXERCISE 5.8 ★★★ — early termination runs your finally ═══
// TASK: Predict each result.
// VOCAB: generator .return(), finally-based cleanup, break-triggered close
// HINT 1: `break` out of for...of calls the iterator's .return() — which, in a
//         generator, runs pending finally blocks. This is how generators do
//         resource cleanup.

const log5_8: string[] = []
function* resource5_8() {
  try { yield 1; yield 2; yield 3 }
  finally { log5_8.push("cleanup") }
}
for (const v of resource5_8()) { if (v === 2) break }
check("5.8a", log5_8, TODO)

const g5_8 = resource5_8()
g5_8.next()
check("5.8b", g5_8.return(99 as any), TODO)
check("5.8c", g5_8.next(), TODO)
check("5.8d", log5_8, TODO)

// EXPLAIN IT — why is this mechanism essential for generators that hold files,
// sockets, or locks?
/*

*/

// ═══ EXERCISE 5.9 ★★★★ — infinite sequences + take ═══
// TASK: Implement naturals() (yields 0, 1, 2, ... forever) and take(it, n)
//       (first n values as an array — WITHOUT exhausting the iterable).
// VOCAB: infinite generator, lazy consumption, early break
// HINT 1: take: for...of with a counter and break. Spreading an infinite
//         generator is a one-way trip to a hung process.

function* naturals(): Generator<number> {
  yield TODO // ← your solution
}

function take<T>(it: Iterable<T>, n: number): T[] {
  return TODO // ← your solution
}

section("5.9", () => {
  check("5.9a", take(naturals(), 5), [0, 1, 2, 3, 4])
  check("5.9b", take(naturals(), 0), [])
  check("5.9c", take(["a", "b", "c"], 2), ["a", "b"])
  check("5.9d", take(["a", "b"], 5), ["a", "b"])
})

// EXPLAIN IT — what pair of language features makes "infinite list" a safe,
// ordinary thing here, when an infinite array is impossible?
/*

*/

// ═══ EXERCISE 5.10 ★★★★ — implement zip ═══
// TASK: zip pairs up two iterables, stopping at the shorter one.
// VOCAB: parallel iteration, manual next(), heterogeneous tuple
// HINT 1: You need BOTH iterators advanced in lockstep — for...of can only
//         drive one, so call [Symbol.iterator]() and .next() yourself.

function* zip<A, B>(as: Iterable<A>, bs: Iterable<B>): Generator<[A, B]> {
  yield TODO // ← your solution
}

section("5.10", () => {
  check("5.10a", [...zip([1, 2, 3], "ab")], [[1, "a"], [2, "b"]])
  check("5.10b", [...zip([], "abc")], [])
  check("5.10c", take(zip(naturals(), "xyz"), 2), [[0, "x"], [1, "y"]])
})

// EXPLAIN IT — why couldn't you write zip with nested for...of loops?
/*

*/

// ═══ EXERCISE 5.11 ★★★ — symbols: guaranteed-unique keys ═══
// TASK: Predict each result.
// VOCAB: symbol, description, global symbol registry, hidden properties
// HINT 1: Every Symbol() is unique. Symbol.for(key) checks a global registry.
// HINT 2: Symbol keys are invisible to Object.keys, for...in, and JSON — but
//         NOT actually private (Object.getOwnPropertySymbols sees them).
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol

check("5.11a", Symbol("x") === Symbol("x"), TODO)
check("5.11b", Symbol.for("x") === Symbol.for("x"), TODO)
{
  const secret = Symbol("secret")
  const obj = { [secret]: 1, visible: 2 }
  check("5.11c", Object.keys(obj), TODO)
  check("5.11d", JSON.stringify(obj), TODO)
  check("5.11e", obj[secret], TODO)
  check("5.11f", Object.getOwnPropertySymbols(obj).length, TODO)
}
check("5.11g", Symbol("desc").description, TODO)
check("5.11h", attempt(() => `${Symbol("x") as any}`), TODO)   // implicit string coercion?
check("5.11i", String(Symbol("x")), TODO)                       // explicit conversion?

// EXPLAIN IT — name two real uses for symbol keys (one is in this very file's
// harness) and state precisely what "hidden" does and doesn't mean:
/*

*/

// ═══ EXERCISE 5.12 ★★★★ — well-known symbols: the language's extension points ═══
// TASK: 5.12a-b: predict. 5.12c: make the plain object `deck` spreadable by
//       giving it a Symbol.iterator generator method.
// VOCAB: well-known symbol, protocol hook, Symbol.toStringTag
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#well-known_symbols

class Duck5_12 { get [Symbol.toStringTag]() { return "Duck" } }
check("5.12a", Object.prototype.toString.call(new Duck5_12()), TODO)
check("5.12b", Object.prototype.toString.call([]), TODO)

const deck: any = {
  cards: ["A", "K", "Q"],
  // ← your solution here: *[Symbol.iterator]() { ... }
}
section("5.12c", () => {
  check("5.12c", [...deck], ["A", "K", "Q"])
})

// EXPLAIN IT — list three well-known symbols you now know and what protocol
// each one hooks into:
/*

*/

// ═══ EXERCISE 5.13 ★★★★ — async iteration ═══
// TASK: Predict each result.
// VOCAB: async generator, Symbol.asyncIterator, for await...of
// HINT 1: An async generator yields promises-of-results; for await unwraps.
// HINT 2: Sync spread [...x] asks for Symbol.iterator — which async
//         generators do NOT have.

async function* ticker(n: number) {
  for (let i = 1; i <= n; i++) { await sleep(1); yield i }
}
{
  const seen: number[] = []
  for await (const v of ticker(3)) seen.push(v)
  check("5.13a", seen, TODO)
}
check("5.13b", typeof (ticker(1) as any)[Symbol.asyncIterator], TODO)
check("5.13c", typeof (ticker(1) as any)[Symbol.iterator], TODO)
check("5.13d", attempt(() => [...(ticker(2) as any)]), TODO)

// EXPLAIN IT — what kind of real-world data sources are async iterables?
// Name three from platforms you use:
/*

*/

// ═══ EXERCISE 5.14 ★★★★★ — implement the async pipeline ═══
// TASK: Implement collect (async iterable → array) and mapAsync (lazy async
//       map over an async iterable).
// VOCAB: async pipeline, lazy transformation, backpressure-by-pull

async function collect<T>(it: AsyncIterable<T>): Promise<T[]> {
  return TODO // ← your solution
}

async function* mapAsync<T, U>(it: AsyncIterable<T>, f: (t: T) => U | Promise<U>): AsyncGenerator<U> {
  yield TODO // ← your solution
}

await sectionAsync("5.14", async () => {
  check("5.14a", await collect(ticker(3)), [1, 2, 3])
  check("5.14b", await collect(mapAsync(ticker(3), n => n * 10)), [10, 20, 30])
  check("5.14c", await collect(mapAsync(ticker(2), async n => { await sleep(1); return `#${n}` })), ["#1", "#2"])
})

// EXPLAIN IT — "pull-based streams have built-in backpressure." Connect that
// sentence to the code you just wrote:
/*

*/

console.log(`\nchapter 05: ${_pass} pass, ${_fail} fail, ${_skip} unanswered`)
export {}
