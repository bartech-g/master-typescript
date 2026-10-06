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
check("2.1a", ex2_1a(), 1)

function ex2_1b() {
  // the let-version of the same code is a compile error in TS and a
  // ReferenceError in JS — proof via eval:
  return attempt(() => eval("if (true) { let l = 1 }; l"))
}
check("2.1b", ex2_1b(), "ReferenceError")

function ex2_1c() {
  var x = 1
  { var x = 2 } // same variable or a new one?
  return x
}
check("2.1c", ex2_1c(), 2)

function ex2_1d() {
  let x = 1
  { let x = 2 } // same variable or a new one?
  return x
}
check("2.1d", ex2_1d(), 1)

// EXPLAIN IT (2–4 sentences, use the vocab, say it out loud):
/*
Var is funtion or globab scoped, gets hoisted and declared with undifined in the initialization pahes. let and cost block scoped cant be redeclared let can be reassigned with an other value
*/

// ═══ EXERCISE 2.2 ★★ — hoisting: three different behaviors ═══
// TASK: Predict each result. Each eval runs an isolated mini-program.
// VOCAB: hoisting, temporal dead zone (TDZ), function declaration vs expression
// HINT 1: var declarations hoist and initialize to undefined. Function
//         DECLARATIONS hoist with their body. let/const hoist too — but stay
//         uninitialized (TDZ) until their line runs.
// DOCS: https://developer.mozilla.org/en-US/docs/Glossary/Hoisting

check("2.2a", attempt(() => eval("var r = x; var x = 5; r")), undefined)
check("2.2b", attempt(() => eval("var r = f(); function f() { return 5 } r")), 5)
check("2.2c", attempt(() => eval("var r = x; let x = 5; r")), "ReferenceError")
check("2.2d", attempt(() => eval("var r = f(); var f = function () { return 5 }; r")), "TypeError")
check("2.2e", attempt(() => eval("typeof x")), "undefined")              // x never declared at all
check("2.2f", attempt(() => eval("var r = typeof x; let x = 1; r")), "ReferenceError") // typeof does NOT save you from TDZ

// EXPLAIN IT — why is 2.2e safe but 2.2f isn't? What does that say about TDZ
// vs "not declared"?
/*
typeof is safe on an undeclared name: no binding exists, so the engine
just returns "undefined" instead of throwing.
In 2.2f the binding for x DOES exist (let is hoisted), but it is
uninitialized (TDZ) until its line runs. Touching an uninitialized
binding always throws ReferenceError, and typeof is no exception.
So TDZ is not "not declared": the name is declared and known, but
forbidden to access yet. "Not declared" means no binding at all.
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
check("2.3a", ex2_3a(), [3, 3, 3])

function ex2_3b() {
  const fns: Array<() => number> = []
  for (let i = 0; i < 3; i++) fns.push(() => i)
  return fns.map(f => f())
}
check("2.3b", ex2_3b(), [0, 1, 2])

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
    fns.push(((captured) => () => captured)(i)) // ← change only this line
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
check("2.5a", addA(1), 11)
check("2.5b", addA(1), 12)
check("2.5c", addB(1), 101)  // does addB see addA's total?
check("2.5d", addA(0), 12)

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
check("2.6a", pair.get(), 2)
const pair2 = makePair()
check("2.6b", pair2.get(), 0)

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
check("2.7", ex2_7(), ["middle", "inner", "middle"])

// EXPLAIN IT — describe how the engine resolves the name `outer` (scope chain):
/*
When the engine sees a name, it looks in the current scope first.
If not found, it moves outward to the enclosing scope, and so on
(block -> function -> global): this is the scope chain.
The first match wins, so a closer variable with the same name
"shadows" (hides) the outer ones. Here, inside the block `outer` is
"inner", after the block it is "middle", and the global "outer" is
never reached because a nearer declaration is always found first.
*/

// ═══ EXERCISE 2.8 ★★★ — named function expressions ═══
// TASK: Predict each result.
// VOCAB: named function expression (NFE), function name binding, strict mode
// HINT 1: The name of a function EXPRESSION is visible only INSIDE the
//         function (as a read-only binding) — not in the enclosing scope.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function

const fn = function myself() { return typeof myself }
check("2.8a", fn(), "function")
check("2.8b", attempt(() => eval("var f = function nfe() {}; nfe")), "ReferenceError")  // visible outside?
check("2.8c", attempt(() => eval("(function nfe() { nfe = 5; return nfe })()")), "TypeError") // assign to it? (module = strict mode)
check("2.8d", fn.name, "myself")
const anon = () => { }
check("2.8e", anon.name, "anon")  // "anonymous"... or is it?

// EXPLAIN IT — what is the NFE name binding good for (think recursion), and
// why did 2.8e surprise most people:
/*
The NFE name is a read-only binding visible only inside the function,
so the function can refer to itself (e.g. recursion) without depending
on the outer variable: even if `fn` is reassigned or the function is
passed around anonymously, `myself` still points to this function.
2.8e surprises people because the arrow function has no name of its own,
yet .name is "anon": the engine infers the name from the variable it is
assigned to (name inference), instead of giving "" or "anonymous".
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
check("2.9", ex2_9(), ["Ada", "Grace"])

// EXPLAIN IT — did the closure "capture user.name"? What did it capture exactly?
/*
No, the closure did not capture the value of user.name ("Ada").
It captured the binding `user`, a reference to the object.
The expression user.name is evaluated again on every call, so it
sees the current state of that object. The object lives on the heap
and is shared by reference: changing user.name mutates that same
object, and every closure holding the binding sees the change.
*/

// ═══ EXERCISE 2.10 ★★★ — assigning to undeclared variables ═══
// TASK: Predict each result. This file is an ES module → strict mode ALWAYS.
// VOCAB: strict mode, implicit global, sloppy mode
// HINT 1: In sloppy (non-strict) mode, `leaked = 5` silently creates a global.
//         In strict mode it throws. Modules and classes are always strict.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode

check("2.10a", attempt(() => eval("'use strict'; leaked1 = 5; leaked1")), "ReferenceError")
check("2.10b", attempt(() => { (globalThis as any).legit = 5; return (globalThis as any).legit }), 5)

// EXPLAIN IT — name three things strict mode changes, and why modules made
// "use strict" boilerplate obsolete:
/*
Strict mode changes, among others:
1. Assigning to an undeclared variable throws ReferenceError instead of
   silently creating an implicit global.
2. Assigning to read-only things (e.g. an NFE name, a frozen property)
   throws TypeError instead of failing silently.
3. `this` in a plain function call is undefined instead of the global
   object. (Also: duplicate parameter names and `with` are forbidden.)
ES modules (and classes) are always strict by default, so writing
"use strict" in them is redundant: the safe behavior is already on.
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
`)), "undefined")

check("2.11b", attempt(() => eval(`
  var y = 1
  function test() {
    var r = y   // which y?
    var y = 2
    return r
  }
  test()
`)), undefined)

check("2.11c", attempt(() => eval(`
  function whatAmI() {
    var x = 1
    function x() {}
    return typeof x
  }
  whatAmI()
`)), "number")

check("2.11d", attempt(() => eval(`
  function f() { return 1 }
  var r1 = f()
  function f() { return 2 }
  var r2 = f()
  r1 + "," + r2
`)), "2,2")

// EXPLAIN IT — describe the two-phase model: what happens to var, let, and
// function declarations BEFORE the first line executes?
/*
a függvény-deklaráció a creation fázisban kész értékkel jön létre, a var csak undefined-dal, az értékadása a saját sorában történik meg.
*/

// ═══ EXERCISE 2.12 ★★★★ — default parameters have their own scope rules ═══
// TASK: Predict each result.
// VOCAB: parameter scope, left-to-right initialization, parameter TDZ
// HINT 1: Parameters initialize left to right; each can see the ones BEFORE it.
// HINT 2: Referencing a LATER parameter in a default is a TDZ error at call time.

check("2.12a", attempt(() => eval("function f(a = 1, b = a + 1) { return b } f()")), 2)
check("2.12b", attempt(() => eval("function f(a = 1, b = a + 1) { return b } f(5)")), 6)
check("2.12c", attempt(() => eval("function f(a = 1, b = a + 1) { return b } f(5, 10)")), 10)
check("2.12d", attempt(() => eval("function g(a = b, b = 2) { return a } g()")), "ReferenceError")
check("2.12e", attempt(() => eval("function g(a = b, b = 2) { return a } g(1)")), 1)

// EXPLAIN IT — why does 2.12d throw but 2.12e doesn't?
/*
Parameters are initialized left to right, and a default expression is
evaluated only when its argument is missing (undefined).
In 2.12d, a has no argument, so its default `b` runs. But b is declared
later and still in its TDZ (not initialized yet), so reading it throws
ReferenceError.
In 2.12e, a receives 1, so its default expression is never evaluated.
b is never touched early, so no error occurs.
*/


// ═══ EXERCISE 2.13 ★★★★ — implement once() and memoize() ═══
// TASK: Implement both using closures.
//       once(fn): fn runs at most one time; later calls return the first result.
//       memoize(fn): cache results by JSON.stringify of the arguments.
// VOCAB: higher-order function, closure state, cache, referential transparency
// HINT 1: once: two closure variables — `called` and `result`.
// HINT 2: memoize: a Map<string, R> in the closure; key = JSON.stringify(args).

function once<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  let called = false
  let result: R
  return (...args: A) => {
    if (!called) {
      called = true
      result = fn(...args)
    }
    return result
  }
}

function memoize<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  const cache = new Map<string, R>()
  return (...args: A) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key) as R
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
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
JSON.stringify drops or rewrites values JSON can't represent, so
different arguments can produce the same key (collisions):
undefined, NaN, Infinity and -Infinity all become null, so f(NaN)
and f(null) share a cache entry; -0 becomes 0; functions/symbols
become null in arrays. Objects with different key order produce
different keys ({a:1,b:2} vs {b:2,a:1}) even though they are equal,
so you get needless cache misses. It also throws on BigInt and
circular references, and the key says nothing about `this`.
Result: wrong cached value returned for different inputs, or
the cache silently not working.
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
  let amount: number = initial;
  function deposit(d: number) {
    if (d <= 0) return
    amount += d
  }
  function getBalance() {
    return amount
  }
  function withdraw(w: number) {
    if (amount - w >= 0) {
      if (w <= 0) return false
      amount = amount - w
      return true
    } else {
      return false
    }
  }
  return { deposit, getBalance, withdraw }
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
    ; (acc as any).balance = 99999                            // attacker tries anyway
  check("2.14h", acc.getBalance(), 0)                      // ...and achieves nothing
})

// EXPLAIN IT — compare closure privacy with class #private fields: name one
// advantage of each:
/*
with closure is simpler for one function
with classes the class can be combined and more structured
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
check("2.15", gauntlet(), [1002, 1002, 200, 10])

// EXPLAIN IT — for each of the 4 numbers, one sentence on WHY:
/*
1002 (1st): closure captured the BINDING of outer x (not the value 1) and the
  shared var i; at call time x is 1000 and i is 2 -> 1002.
1002 (2nd): same shared x and same shared var i (not 0/1), so identical result.
200: the block's `let x` shadows the outer x; the closure holds that inner
  binding, which was reassigned to 200 before the call. The later x = 1000
  changes the OUTER x only.
10: the IIFE copied the value of x (10) into its parameter `snapshot`,
  so it is a value snapshot, unaffected by x = 1000.
*/

console.log(`\nchapter 02: ${_pass} pass, ${_fail} fail, ${_skip} unanswered`)
export { }
