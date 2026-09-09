// ════════════════════════════════════════════════════════════════════════════
// CHAPTER 06 — COLLECTIONS, REFERENCES & MUTATION              run: node 06-*.ts
// ════════════════════════════════════════════════════════════════════════════
// Formatting notes for predictions: array HOLES print as empty slots — a
// sparse array like [1, <hole>, 3] prints as [1, , 3], which is NOT the same
// as [1, undefined, 3]. That difference is one of the lessons.

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
// ────────────────────────────────────────────────────────────────────────────

// ═══ EXERCISE 6.1 ★★ — variables hold references, not objects ═══
// TASK: Predict each result.
// VOCAB: reference semantics, aliasing, pass-by-sharing
// HINT 1: Assignment copies the REFERENCE. Mutation through any alias is
//         visible through all of them. Reassigning a parameter changes nothing
//         outside.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures

{
  const a = { n: 1 }
  const b = a
  b.n = 2
  check("6.1a", a.n, TODO)

  function bump(o: { n: number }) { o.n++ }
  bump(a)
  check("6.1b", a.n, TODO)

  function replace(o: { n: number }) { o = { n: 100 }; return o }
  replace(a)
  check("6.1c", a.n, TODO)

  const xs = [1]
  const ys = xs
  ys.push(2)
  check("6.1d", xs, TODO)
}

// EXPLAIN IT — "JavaScript is pass-by-value, and the value is a reference."
// Unpack that sentence (2–4 sentences, out loud):
/*

*/

// ═══ EXERCISE 6.2 ★★ — const is not immutability; freeze is not deep ═══
// TASK: Predict each result.
// VOCAB: binding immutability vs value immutability, Object.freeze, shallow freeze

const frozen = Object.freeze({ n: 1, nested: { deep: 1 } })
check("6.2a", attempt(() => { (frozen as any).n = 99; return frozen.n }), TODO)
check("6.2b", attempt(() => { (frozen as any).nested.deep = 99; return frozen.nested.deep }), TODO)
check("6.2c", Object.isFrozen(frozen), TODO)
check("6.2d", Object.isFrozen(frozen.nested), TODO)

// EXPLAIN IT — precisely: what does const protect, what does freeze protect,
// and what protects nested objects?
/*

*/

// ═══ EXERCISE 6.3 ★★★ — spread is a SHALLOW copy ═══
// TASK: Predict each result.
// VOCAB: shallow copy, one level deep, shared substructure

{
  const orig = [{ v: 1 }, { v: 2 }]
  const copy = [...orig]
  copy[0]!.v = 99
  check("6.3a", orig[0]!.v, TODO)
  check("6.3b", copy === orig, TODO)
  check("6.3c", copy[0] === orig[0], TODO)
}

// EXPLAIN IT — draw the memory picture: what did spread actually copy?
/*

*/

// ═══ EXERCISE 6.4 ★★★ — sort(): the default is a trap, and it mutates ═══
// TASK: Predict each result.
// VOCAB: lexicographic default sort, comparator, in-place mutation, toSorted
// HINT 1: Without a comparator, elements are converted to STRINGS and compared
//         by code units. Yes, even numbers.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort

check("6.4a", [10, 9, 1].sort(), TODO)
check("6.4b", [10, 9, 1].sort((a, b) => a - b), TODO)
{
  const arr = [3, 1]
  check("6.4c", arr.sort() === arr, TODO)
}
{
  const arr = [3, 1]
  const sorted = arr.toSorted()
  check("6.4d", arr, TODO)
  check("6.4e", sorted, TODO)
}
check("6.4f", ["b", "a", "C"].sort(), TODO)

// EXPLAIN IT — why is the string default arguably the worst default in the
// language, and name the three modern non-mutating array methods (to___):
/*

*/

// ═══ EXERCISE 6.5 ★★★ — slice reads, splice surgery ═══
// TASK: Predict each result IN ORDER (state carries between checks!).
// VOCAB: slice (pure), splice (mutating), deleteCount, negative indices

{
  const arr = ["a", "b", "c", "d", "e"]
  check("6.5a", arr.slice(1, 3), TODO)
  check("6.5b", arr, TODO)
  check("6.5c", arr.splice(1, 2), TODO)     // what does splice RETURN?
  check("6.5d", arr, TODO)                   // and what's left?
  check("6.5e", arr.splice(1, 0, "X"), TODO)
  check("6.5f", arr, TODO)
  check("6.5g", arr.slice(-2), TODO)
}

// EXPLAIN IT — a mnemonic to never confuse them again (invent your own):
/*

*/

// ═══ EXERCISE 6.6 ★★★ — sparse arrays: the holes are real ═══
// TASK: Predict each result. Remember: holes print as [1, , 3]; to PREDICT a
//       hole, write the same sparse literal (or Array(n)).
// VOCAB: sparse array, hole, index-in-array, materialization
// HINT 1: map/forEach SKIP holes but keep them; spread and Array.from
//         MATERIALIZE them into undefined.

check("6.6a", [1, , 3].length, TODO)
check("6.6b", 1 in [1, , 3], TODO)
check("6.6c", [1, , 3].map(x => (x as number) * 2), TODO)
check("6.6d", Array(3).length, TODO)
check("6.6e", Array(3).map((_, i) => i), TODO)
check("6.6f", Array.from({ length: 3 }, (_, i) => i), TODO)
check("6.6g", [...Array(3)], TODO)

// EXPLAIN IT — why is 6.6e the classic "why doesn't my map work" bug, and
// which two idioms from above are the fix?
/*

*/

// ═══ EXERCISE 6.7 ★★★ — what mutators RETURN ═══
// TASK: Predict each result.
// VOCAB: return-value conventions, fluent illusion

{
  const arr = [1, 2]
  check("6.7a", arr.push(3), TODO)      // returns...?
  check("6.7b", arr.pop(), TODO)        // returns...?
  check("6.7c", arr, TODO)
}
check("6.7d", [1, 2].concat([3]), TODO)
{
  const r = [1, 2, 3]
  check("6.7e", r.reverse() === r, TODO)
}
check("6.7f", [1, [2, [3]]].flat(Infinity), TODO)

// EXPLAIN IT — why is `const biggest = arr.sort().pop()` a landmine in a
// function that received arr as a parameter?
/*

*/

// ═══ EXERCISE 6.8 ★★★ — Map vs plain object: keys are the difference ═══
// TASK: Predict each result.
// VOCAB: identity keys, key coercion, SameValueZero, insertion order
// HINT 1: Object keys are strings/symbols — everything else gets stringified.
//         Map keys are ANY value, compared by SameValueZero (identity for
//         objects, NaN equals NaN).
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

{
  const m = new Map<unknown, string>()
  const k1 = { id: 1 }, k2 = { id: 1 }
  m.set(k1, "first"); m.set(k2, "second"); m.set(NaN, "not-a-number")
  check("6.8a", m.get(k1), TODO)
  check("6.8b", m.get({ id: 1 }), TODO)
  check("6.8c", m.size, TODO)
  check("6.8d", m.get(NaN), TODO)

  const o: any = {}
  o[k1 as any] = "x"
  check("6.8e", o[k2 as any], TODO)     // different key... right?
  check("6.8f", Object.keys(o), TODO)
}

// EXPLAIN IT — three concrete reasons to reach for Map over object, and one
// reason object still wins:
/*

*/

// ═══ EXERCISE 6.9 ★★★ — Set semantics ═══
// TASK: Predict each result.
// VOCAB: uniqueness by SameValueZero, structural vs identity equality

check("6.9a", new Set([NaN, NaN]).size, TODO)
check("6.9b", new Set([{}, {}]).size, TODO)
check("6.9c", new Set<unknown>([1, 2]).has("1"), TODO)
check("6.9d", [...new Set("hello")], TODO)

// EXPLAIN IT — "Set dedupes" — finish the sentence with the precise rule:
/*

*/

// ═══ EXERCISE 6.10 ★★★★ — WeakMap: metadata that lets its keys die ═══
// TASK: 6.10a: predict. Then implement createTagger — attach labels to
//       arbitrary objects WITHOUT modifying them, using a WeakMap.
// VOCAB: WeakMap, weak reference, garbage collection, object-keyed metadata
// HINT 1: WeakMap keys must be objects — the whole point is the entry dies
//         with the key.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap

check("6.10a", attempt(() => new WeakMap().set(1 as any, "x")), TODO)

function createTagger(): { tag(o: object, label: string): void; getTag(o: object): string | undefined } {
  return TODO // ← your solution
}

section("6.10", () => {
  const t = createTagger()
  const user = { name: "Ada" }
  t.tag(user, "admin")
  check("6.10b", t.getTag(user), "admin")
  check("6.10c", t.getTag({ name: "Ada" }), undefined)
  check("6.10d", Object.keys(user), ["name"])     // the object itself is untouched
})

// EXPLAIN IT — why would a regular Map here leak memory in a long-running
// server? Walk through the GC story:
/*

*/

// ═══ EXERCISE 6.11 ★★★ — structuredClone: the real deep copy ═══
// TASK: Predict each result.
// VOCAB: structured clone algorithm, deep copy, DataCloneError, cycles

const nested6 = { a: { b: 1 }, arr: [1, 2] }
const shallow6 = { ...nested6 }
check("6.11a", shallow6.a === nested6.a, TODO)
const deep6 = structuredClone(nested6)
check("6.11b", deep6.a === nested6.a, TODO)
check("6.11c", deep6.a.b, TODO)
check("6.11d", attempt(() => structuredClone({ f: () => 1 })), TODO)
{
  const c: any = {}
  c.self = c
  const cc = structuredClone(c)
  check("6.11e", cc.self === cc, TODO)   // does it survive cycles?
}

// EXPLAIN IT — what does structuredClone handle that JSON.parse(JSON.stringify(x))
// silently ruins? List at least four value types:
/*

*/

// ═══ EXERCISE 6.12 ★★★★★ — implement deepClone with cycle support ═══
// TASK: Implement deepClone: primitives as-is, plain objects & arrays deeply,
//       Date by value — and CYCLES must not blow the stack (use a WeakMap of
//       already-cloned objects).
// VOCAB: recursive descent, seen-map, cycle detection, identity preservation
// HINT 1: On entry: if seen.has(value) return seen.get(value). Register the
//         EMPTY clone in `seen` BEFORE recursing into children.

function deepClone<T>(value: T, seen = new WeakMap<object, unknown>()): T {
  return TODO // ← your solution
}

section("6.12", () => {
  check("6.12a", deepClone(42), 42)
  check("6.12b", deepClone("x"), "x")
  const obj = { a: { b: [1, { c: 2 }] } }
  const clone = deepClone(obj)
  check("6.12c", clone.a.b[1], { c: 2 })
  check("6.12d", clone.a === obj.a, false)
  clone.a.b.push("new" as any)
  check("6.12e", obj.a.b.length, 2)
  const d = deepClone(new Date(1000))
  check("6.12f", d.getTime(), 1000)
  check("6.12g", d instanceof Date, true)
  const cyc: any = { name: "loop" }
  cyc.self = cyc
  const cloned = deepClone(cyc)
  check("6.12h", cloned.self === cloned, true)
  check("6.12i", cloned === cyc, false)
})

// EXPLAIN IT — why must the clone be registered in `seen` BEFORE recursing?
// What exactly happens if you register it after?
/*

*/

// ═══ EXERCISE 6.13 ★★★★ — implement deepEqual ═══
// TASK: Structural equality: primitives via Object.is (so NaN equals NaN),
//       arrays and plain objects recursively, everything else by identity.
// VOCAB: structural equality, key-count check, Object.is

function deepEqual(a: unknown, b: unknown): boolean {
  return TODO // ← your solution
}

section("6.13", () => {
  check("6.13a", deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }), true)
  check("6.13b", deepEqual({ a: NaN }, { a: NaN }), true)
  check("6.13c", deepEqual({ a: 1 }, { a: 1, extra: 2 }), false)
  check("6.13d", deepEqual([1, 2], { 0: 1, 1: 2 }), false)
  check("6.13e", deepEqual(null, {}), false)
  check("6.13f", deepEqual([[]], [[]]), true)
})

// EXPLAIN IT — why does === fail at this job, and what's the complexity cost
// of deepEqual on big structures?
/*

*/

// ═══ EXERCISE 6.14 ★★★★★ — immutable updates with structural sharing ═══
// TASK: Implement setIn(obj, path, value): returns a NEW object with the value
//       at the path replaced — WITHOUT mutating the original, and REUSING
//       (sharing) every untouched branch. This is the heart of Redux/Immer.
// VOCAB: structural sharing, copy-on-write path, persistent data structure
// HINT 1: Copy only the spine: { ...obj, [head]: setIn(obj[head], rest, value) }

function setIn<T extends object>(obj: T, path: string[], value: unknown): T {
  return TODO // ← your solution
}

section("6.14", () => {
  const state = { user: { name: "Ada", prefs: { theme: "dark" } }, posts: [1, 2] }
  const next = setIn(state, ["user", "prefs", "theme"], "light")
  check("6.14a", next.user.prefs.theme, "light")
  check("6.14b", state.user.prefs.theme, "dark")
  check("6.14c", next.posts === state.posts, true)     // untouched branch SHARED
  check("6.14d", next.user === state.user, false)      // touched spine COPIED
  check("6.14e", next === state, false)
})

// EXPLAIN IT — why does structural sharing make "did anything change?" checks
// O(1) in React/Redux land?
/*

*/

// ═══ EXERCISE 6.15 ★★★ — object key ordering (yes, it's specified) ═══
// TASK: Predict the result.
// VOCAB: integer-like keys, insertion order, OrdinaryOwnPropertyKeys
// HINT 1: Integer-like string keys come first in ASCENDING numeric order;
//         then everything else in INSERTION order.

check("6.15", Object.keys({ b: 1, 2: "x", a: 3, 1: "y" }), TODO)

// EXPLAIN IT — why should you still never DEPEND on object key order for
// program logic, even though it's specified?
/*

*/

console.log(`\nchapter 06: ${_pass} pass, ${_fail} fail, ${_skip} unanswered`)
export {}
