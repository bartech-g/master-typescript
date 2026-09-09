// ════════════════════════════════════════════════════════════════════════════
// CHAPTER 02 — SCOPE, CLOSURES & HOISTING                      run: node 02-*.ts
// ════════════════════════════════════════════════════════════════════════════
// Same rules as chapter 01: replace TODO with your prediction, run, PASS/FAIL.
// A few exercises use eval("...") — that's not laziness: the raw JavaScript
// inside is ILLEGAL TypeScript (TS statically rejects it), and experiencing
// what JS does anyway is the exercise. eval smuggles it past the compiler.

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

// ═══ EXERCISE 2.1 ★ — var is function-scoped, let is block-scoped ═══
// TASK: Predict each result.
// VOCAB: function scope, block scope, lexical scoping
// HINT 1: A block { } means nothing to var. It means everything to let/const.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var

function ex2_1a() {
  if (true) { var v = 1 }
  return v // legal?! what value?
}
check("2.1a", ex2_1a(), TODO)

function ex2_1b() {
  // the let-version of the same code is a compile error in TS and a
  // ReferenceError in JS — proof via eval:
  return attempt(() => eval("if (true) { let l = 1 }; l"))
}
check("2.1b", ex2_1b(), TODO)

function ex2_1c() {
  var x = 1
  { var x = 2 } // same variable or a new one?
  return x
}
check("2.1c", ex2_1c(), TODO)

function ex2_1d() {
  let x = 1
  { let x = 2 } // same variable or a new one?
  return x
}
check("2.1d", ex2_1d(), TODO)

// EXPLAIN IT (2–4 sentences, use the vocab, say it out loud):
/*

*/

// ═══ EXERCISE 2.2 ★★ — hoisting: three different behaviors ═══
// TASK: Predict each result. Each eval runs an isolated mini-program.
// VOCAB: hoisting, temporal dead zone (TDZ), function declaration vs expression
// HINT 1: var declarations hoist and initialize to undefined. Function
//         DECLARATIONS hoist with their body. let/const hoist too — but stay
//         uninitialized (TDZ) until their line runs.
// DOCS: https://developer.mozilla.org/en-US/docs/Glossary/Hoisting

check("2.2a", attempt(() => eval("var r = x; var x = 5; r")), TODO)
check("2.2b", attempt(() => eval("var r = f(); function f() { return 5 } r")), TODO)
check("2.2c", attempt(() => eval("var r = x; let x = 5; r")), TODO)
check("2.2d", attempt(() => eval("var r = f(); var f = function () { return 5 }; r")), TODO)
check("2.2e", attempt(() => eval("typeof x")), TODO)              // x never declared at all
check("2.2f", attempt(() => eval("var r = typeof x; let x = 1; r")), TODO) // typeof does NOT save you from TDZ

// EXPLAIN IT — why is 2.2e safe but 2.2f isn't? What does that say about TDZ
// vs "not declared"?
/*

*/

// ═══ EXERCISE 2.3 ★★★ — the classic: var in a loop ═══
// TASK: Predict what each array of calls returns.
// VOCAB: closure, captured binding, per-iteration binding
// HINT 1: A closure captures the VARIABLE (the binding), not the value at
//         creation time.
// HINT 2: `let` in a for-loop creates a FRESH binding per iteration; `var`
//         gives all iterations one shared binding.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures#creating_closures_in_loops_a_common_mistake

function ex2_3a() {
  const fns: Array<() => number> = []
  for (var i = 0; i < 3; i++) fns.push(() => i)
  return fns.map(f => f())
}
check("2.3a", ex2_3a(), TODO)

function ex2_3b() {
  const fns: Array<() => number> = []
  for (let i = 0; i < 3; i++) fns.push(() => i)
  return fns.map(f => f())
}
check("2.3b", ex2_3b(), TODO)

// EXPLAIN IT — this is THE closure interview question. Explain both results:
/*

*/

// ═══ EXERCISE 2.4 ★★★ — fix it 1995-style ═══
// TASK: WITHOUT changing `var` to `let`, make ex2_4 return [0, 1, 2].
//       (This is how the pre-ES6 world actually fixed it.)
// VOCAB: IIFE (immediately-invoked function expression), capturing by parameter
// HINT 1: A function call copies the CURRENT value of i into a new variable
//         (the parameter) — and parameters get a fresh binding per call.
// HINT 2: fns.push(((captured) => () => captured)(i))
// DOCS: https://developer.mozilla.org/en-US/docs/Glossary/IIFE

function ex2_4() {
  const fns: Array<() => number> = []
  for (var i = 0; i < 3; i++) {
    fns.push(() => i) // ← change only this line
  }
  return fns.map(f => f())
}
check("2.4", ex2_4(), [0, 1, 2])

// EXPLAIN IT — why does introducing a function call fix the capture:
/*

*/

// ═══ EXERCISE 2.5 ★★ — closures have private, persistent state ═══
// TASK: Predict the sequence of results.
// VOCAB: closure, encapsulation, lexical environment
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures

function makeAdder(start: number) {
  let total = start
  return (n: number) => { total += n; return total }
}

const addA = makeAdder(10)
const addB = makeAdder(100)
check("2.5a", addA(1), TODO)
check("2.5b", addA(1), TODO)
check("2.5c", addB(1), TODO)  // does addB see addA's total?
check("2.5d", addA(0), TODO)

// EXPLAIN IT — where does `total` live after makeAdder returns? Why isn't it
// garbage-collected?
/*

*/

// ═══ EXERCISE 2.6 ★★★ — two closures, one binding ═══
// TASK: Predict each result.
// VOCAB: shared lexical environment, aliasing
// HINT 1: Both returned functions close over the SAME `n` — not copies.

function makePair() {
  let n = 0
  return { inc: () => { n++ }, get: () => n }
}

const pair = makePair()
pair.inc()
pair.inc()
check("2.6a", pair.get(), TODO)
const pair2 = makePair()
check("2.6b", pair2.get(), TODO)

// EXPLAIN IT — one sentence: what exactly do the two functions share?
/*

*/

// ═══ EXERCISE 2.7 ★★ — shadowing ═══
// TASK: Predict each result.
// VOCAB: shadowing, scope chain, variable resolution

const outer = "outer"
function ex2_7() {
  const results: string[] = []
  const outer = "middle"
  results.push(outer)
  {
    const outer = "inner"
    results.push(outer)
  }
  results.push(outer)
  return results
}
check("2.7", ex2_7(), TODO)

// EXPLAIN IT — describe how the engine resolves the name `outer` (scope chain):
/*

*/

// ═══ EXERCISE 2.8 ★★★ — named function expressions ═══
// TASK: Predict each result.
// VOCAB: named function expression (NFE), function name binding, strict mode
// HINT 1: The name of a function EXPRESSION is visible only INSIDE the
//         function (as a read-only binding) — not in the enclosing scope.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function

const fn = function myself() { return typeof myself }
check("2.8a", fn(), TODO)
check("2.8b", attempt(() => eval("var f = function nfe() {}; nfe")), TODO)  // visible outside?
check("2.8c", attempt(() => eval("(function nfe() { nfe = 5; return nfe })()")), TODO) // assign to it? (module = strict mode)
check("2.8d", fn.name, TODO)
const anon = () => {}
check("2.8e", anon.name, TODO)  // "anonymous"... or is it?

// EXPLAIN IT — what is the NFE name binding good for (think recursion), and
// why did 2.8e surprise most people:
/*

*/

// ═══ EXERCISE 2.9 ★★★ — closures capture bindings, objects travel by reference ═══
// TASK: Predict each result.
// VOCAB: binding capture vs value snapshot, mutation visibility

function ex2_9() {
  const user = { name: "Ada" }
  const getName = () => user.name
  const before = getName()
  user.name = "Grace"
  const after = getName()
  return [before, after]
}
check("2.9", ex2_9(), TODO)

// EXPLAIN IT — did the closure "capture user.name"? What did it capture exactly?
/*

*/

// ═══ EXERCISE 2.10 ★★★ — assigning to undeclared variables ═══
// TASK: Predict each result. This file is an ES module → strict mode ALWAYS.
// VOCAB: strict mode, implicit global, sloppy mode
// HINT 1: In sloppy (non-strict) mode, `leaked = 5` silently creates a global.
//         In strict mode it throws. Modules and classes are always strict.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode

check("2.10a", attempt(() => eval("'use strict'; leaked1 = 5; leaked1")), TODO)
check("2.10b", attempt(() => { (globalThis as any).legit = 5; return (globalThis as any).legit }), TODO)

// EXPLAIN IT — name three things strict mode changes, and why modules made
// "use strict" boilerplate obsolete:
/*

*/

// ═══ EXERCISE 2.11 ★★★★ — hoisting horror story (interview classic) ═══
// TASK: Predict each result. Draw the two-phase execution (declaration pass,
//       then execution pass) on paper first.
// VOCAB: two-phase execution, declaration instantiation, function-first hoisting

check("2.11a", attempt(() => eval(`
  function outer() {
    var r = typeof x
    var x = 1
    return r
  }
  outer()
`)), TODO)

check("2.11b", attempt(() => eval(`
  var y = 1
  function test() {
    var r = y   // which y?
    var y = 2
    return r
  }
  test()
`)), TODO)

check("2.11c", attempt(() => eval(`
  function whatAmI() {
    var x = 1
    function x() {}
    return typeof x
  }
  whatAmI()
`)), TODO)

check("2.11d", attempt(() => eval(`
  function f() { return 1 }
  var r1 = f()
  function f() { return 2 }
  var r2 = f()
  r1 + "," + r2
`)), TODO)

// EXPLAIN IT — describe the two-phase model: what happens to var, let, and
// function declarations BEFORE the first line executes?
/*

*/

// ═══ EXERCISE 2.12 ★★★★ — default parameters have their own scope rules ═══
// TASK: Predict each result.
// VOCAB: parameter scope, left-to-right initialization, parameter TDZ
// HINT 1: Parameters initialize left to right; each can see the ones BEFORE it.
// HINT 2: Referencing a LATER parameter in a default is a TDZ error at call time.

check("2.12a", attempt(() => eval("function f(a = 1, b = a + 1) { return b } f()")), TODO)
check("2.12b", attempt(() => eval("function f(a = 1, b = a + 1) { return b } f(5)")), TODO)
check("2.12c", attempt(() => eval("function f(a = 1, b = a + 1) { return b } f(5, 10)")), TODO)
check("2.12d", attempt(() => eval("function g(a = b, b = 2) { return a } g()")), TODO)
check("2.12e", attempt(() => eval("function g(a = b, b = 2) { return a } g(1)")), TODO)

// EXPLAIN IT — why does 2.12d throw but 2.12e doesn't?
/*

*/

// ═══ EXERCISE 2.13 ★★★★ — implement once() and memoize() ═══
// TASK: Implement both using closures.
//       once(fn): fn runs at most one time; later calls return the first result.
//       memoize(fn): cache results by JSON.stringify of the arguments.
// VOCAB: higher-order function, closure state, cache, referential transparency
// HINT 1: once: two closure variables — `called` and `result`.
// HINT 2: memoize: a Map<string, R> in the closure; key = JSON.stringify(args).

function once<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  return TODO // ← your solution
}

function memoize<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  return TODO // ← your solution
}

section("2.13", () => {
  let runs = 0
  const init = once((base: number) => { runs++; return base * 2 })
  check("2.13a", init(21), 42)
  check("2.13b", init(100), 42)   // ignored args, first result sticks
  check("2.13c", runs, 1)

  let calls = 0
  const slowAdd = (a: number, b: number) => { calls++; return a + b }
  const fastAdd = memoize(slowAdd)
  check("2.13d", fastAdd(2, 3), 5)
  check("2.13e", fastAdd(2, 3), 5)
  check("2.13f", calls, 1)
  check("2.13g", fastAdd(3, 2), 5) // different key → real call
  check("2.13h", calls, 2)
})

// EXPLAIN IT — what's the classic bug hiding in JSON.stringify-keyed memoization?
/*

*/

// ═══ EXERCISE 2.14 ★★★★ — the module pattern: real privacy without classes ═══
// TASK: Implement createAccount so all checks pass. `balance` must NOT be a
//       property on the returned object — it must be unreachable except
//       through deposit/withdraw/getBalance.
// VOCAB: module pattern, information hiding, privileged methods
// HINT 1: let balance in the closure; return only functions.
// HINT 2: withdraw returns false and changes nothing if funds are insufficient.

type Account = {
  deposit: (n: number) => void
  withdraw: (n: number) => boolean
  getBalance: () => number
}

function createAccount(initial: number): Account {
  return TODO // ← your solution
}

section("2.14", () => {
  const acc = createAccount(100)
  acc.deposit(50)
  check("2.14a", acc.getBalance(), 150)
  check("2.14b", acc.withdraw(200), false)
  check("2.14c", acc.getBalance(), 150)
  check("2.14d", acc.withdraw(150), true)
  check("2.14e", acc.getBalance(), 0)
  check("2.14f", "balance" in acc, false)                 // no property to reach
  check("2.14g", Object.keys(acc).length, 3)              // only the 3 methods
  ;(acc as any).balance = 99999                            // attacker tries anyway
  check("2.14h", acc.getBalance(), 0)                      // ...and achieves nothing
})

// EXPLAIN IT — compare closure privacy with class #private fields: name one
// advantage of each:
/*

*/

// ═══ EXERCISE 2.15 ★★★★★ — the closure gauntlet ═══
// TASK: Predict the final array. Every trick from this chapter at once.
//       Do it on paper. Slowly. This is the boss fight.

function gauntlet(): number[] {
  const out: number[] = []
  let x = 1
  const fns: Array<() => number> = []

  for (var i = 0; i < 2; i++) {
    fns.push(() => x + i)
  }
  x = 10

  {
    let x = 100
    fns.push(() => x)
    x = 200
  }

  const capture = ((snapshot: number) => () => snapshot)(x)
  x = 1000

  for (const f of fns) out.push(f())
  out.push(capture())
  return out
}
check("2.15", gauntlet(), TODO)

// EXPLAIN IT — for each of the 4 numbers, one sentence on WHY:
/*

*/

console.log(`\nchapter 02: ${_pass} pass, ${_fail} fail, ${_skip} unanswered`)
export {}
