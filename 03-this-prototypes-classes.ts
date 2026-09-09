// ════════════════════════════════════════════════════════════════════════════
// CHAPTER 03 — this, PROTOTYPES & CLASSES                      run: node 03-*.ts
// ════════════════════════════════════════════════════════════════════════════
// Same rules: replace TODO with your prediction, run, PASS/FAIL.
// You'll see `this: any` annotations on some standalone functions — TypeScript
// (correctly) refuses to compile functions with untyped floating `this`
// (TS2683); the annotation re-enables the raw-JS behavior we're studying.
// Reminder: this file is an ES module, so it runs in STRICT mode — a lost
// `this` is `undefined`, never the global object.

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

// ═══ EXERCISE 3.1 ★★ — this is decided at the CALL, not the definition ═══
// TASK: Predict each result.
// VOCAB: receiver, call-site binding, method extraction, strict mode
// HINT 1: obj.f() sets this = obj. A bare f() sets this = undefined (strict).
//         The DOT AT THE CALL SITE is everything; where f was written is nothing.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this

const account3_1 = {
  owner: "Ada",
  describe(this: any) { return `owner:${this?.owner}` },
}
check("3.1a", account3_1.describe(), TODO)
const extracted = account3_1.describe
check("3.1b", extracted(), TODO)                       // what is this?.owner now?
const other = { owner: "Grace", describe: account3_1.describe }
check("3.1c", other.describe(), TODO)
check("3.1d", (true ? account3_1.describe : extracted)(), TODO) // parenthesized expression loses the receiver!

// EXPLAIN IT (2–4 sentences, use the vocab, say it out loud):
/*

*/

// ═══ EXERCISE 3.2 ★★ — call, apply, bind ═══
// TASK: Predict each result.
// VOCAB: explicit binding, partial application, bound function
// HINT 1: call(thisArg, a, b), apply(thisArg, [a, b]), bind returns a NEW
//         function with this (and optionally leading args) locked in.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind

function introduce(this: any, greeting: string, punct: string) {
  return `${greeting}, I am ${this?.name}${punct}`
}
const ada = { name: "Ada" }
check("3.2a", introduce.call(ada, "Hi", "!"), TODO)
check("3.2b", introduce.apply(ada, ["Yo", "?"]), TODO)
const bound = introduce.bind(ada, "Hello")
check("3.2c", bound("."), TODO)
check("3.2d", bound.call({ name: "Eve" }, "."), TODO)   // can call() override bind()?
const reBound = bound.bind({ name: "Eve" })
check("3.2e", reBound("!"), TODO)                        // can a second bind() override the first?

// EXPLAIN IT — why is bind permanent? What does that mean for security-ish
// patterns (hardened methods)?
/*

*/

// ═══ EXERCISE 3.3 ★★★ — arrow functions don't HAVE a this ═══
// TASK: Predict each result.
// VOCAB: lexical this, enclosing scope, arrow function
// HINT 1: An arrow uses the this of the scope where it was WRITTEN. Module
//         top level: this is undefined. Inside a method: the method's this.

const gadget = {
  name: "gizmo",
  regular(this: any) { return this?.name },
  arrow: ((): any => {
    // `this` here would be the module's this = undefined; we return the fact:
    return undefined
  }),
  viaHelper(this: any) {
    const helper = () => this?.name   // arrow INSIDE a method
    return helper()
  },
}
check("3.3a", gadget.regular(), TODO)
check("3.3b", gadget.viaHelper(), TODO)
const looseHelper = gadget.viaHelper
check("3.3c", looseHelper(), TODO)   // arrow inherits from... which call of viaHelper?
check("3.3d", gadget.viaHelper.call({ name: "borrowed" }), TODO)

// EXPLAIN IT — "an arrow function has no this of its own". Explain what it has
// instead, and why 3.3c differs from 3.3b:
/*

*/

// ═══ EXERCISE 3.4 ★★★ — the prototype chain: lookup, not copy ═══
// TASK: Predict each result.
// VOCAB: prototype chain, [[Prototype]], own property, delegation
// HINT 1: Reading a.x walks up the chain until found. hasOwnProperty checks
//         only the object itself; `in` walks the chain.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain

const base3_4 = { kind: "base", greet() { return "hello" } }
const child3_4 = Object.create(base3_4) as any
child3_4.name = "kiddo"

check("3.4a", child3_4.name, TODO)
check("3.4b", child3_4.kind, TODO)
check("3.4c", child3_4.greet(), TODO)
check("3.4d", Object.hasOwn(child3_4, "name"), TODO)
check("3.4e", Object.hasOwn(child3_4, "kind"), TODO)
check("3.4f", "kind" in child3_4, TODO)
check("3.4g", Object.keys(child3_4), TODO)
check("3.4h", Object.getPrototypeOf(child3_4) === base3_4, TODO)

// EXPLAIN IT — describe what happens, step by step, when the engine evaluates
// child3_4.greet():
/*

*/

// ═══ EXERCISE 3.5 ★★★ — writing NEVER walks the chain ═══
// TASK: Predict each result.
// VOCAB: property shadowing, own property creation, read-write asymmetry
// HINT 1: Reads delegate up the chain. Writes (almost) always create/update an
//         OWN property on the receiver — the prototype's property is untouched.

const proto3_5 = { hp: 100 }
const hero = Object.create(proto3_5) as any
const villain = Object.create(proto3_5) as any

hero.hp = hero.hp - 30          // "damage the hero"
check("3.5a", hero.hp, TODO)
check("3.5b", villain.hp, TODO)          // did the villain take damage too?
check("3.5c", proto3_5.hp, TODO)
check("3.5d", Object.hasOwn(hero, "hp"), TODO)
check("3.5e", Object.hasOwn(villain, "hp"), TODO)
delete hero.hp
check("3.5f", hero.hp, TODO)             // after deleting the own property?

// EXPLAIN IT — why is this read-write asymmetry the thing that makes prototype
// sharing safe at all?
/*

*/

// ═══ EXERCISE 3.6 ★★★ — class methods live on the prototype, fields on the instance ═══
// TASK: Predict each result.
// VOCAB: prototype method, instance field, per-instance allocation
// HINT 1: `greet() {}` in a class body → ONE function on the prototype.
//         `greet = () => {}` field → a NEW function created per instance.

class Knight {
  name: string
  constructor(name: string) { this.name = name }
  greet() { return `I am ${this.name}` }
  greetArrow = () => `I am ${this.name}`
}
const k1 = new Knight("Lancelot")
const k2 = new Knight("Galahad")
check("3.6a", k1.greet === k2.greet, TODO)
check("3.6b", k1.greetArrow === k2.greetArrow, TODO)
check("3.6c", Object.hasOwn(k1, "greet"), TODO)
check("3.6d", Object.hasOwn(k1, "greetArrow"), TODO)
const g = k1.greet
check("3.6e", attempt(() => g()), TODO)              // prototype method, extracted
const ga = k1.greetArrow
check("3.6f", ga(), TODO)                             // arrow field, extracted

// EXPLAIN IT — state the memory/behavior tradeoff between 3.6a-style and
// 3.6b-style methods. When is the arrow field worth it?
/*

*/

// ═══ EXERCISE 3.7 ★★★ — instanceof and its escape hatches ═══
// TASK: Predict each result.
// VOCAB: instanceof, Ctor.prototype, Symbol.hasInstance, null prototype
// HINT 1: `x instanceof C` walks x's prototype chain looking for C.prototype.
// HINT 2: Object.create(null) has NO chain at all.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof

check("3.7a", [] instanceof Array, TODO)
check("3.7b", [] instanceof Object, TODO)
check("3.7c", Object.create(null) instanceof Object, TODO)
check("3.7d", (5 as any) instanceof Number, TODO)
check("3.7e", new Date() instanceof Object, TODO)

class Fake { static [Symbol.hasInstance](x: unknown) { return typeof x === "string" } }
check("3.7f", ("hello" as any) instanceof Fake, TODO)

// EXPLAIN IT — why is 3.7d false even though 5 "is a number"? And what does
// 3.7f prove about trusting instanceof?
/*

*/

// ═══ EXERCISE 3.8 ★★★★ — implement instanceof yourself ═══
// TASK: Implement myInstanceof (no `instanceof` inside!) so all checks pass.
// VOCAB: prototype chain traversal, Object.getPrototypeOf, primitive short-circuit
// HINT 1: Primitives are never an instance of anything → false immediately.
// HINT 2: Loop: p = Object.getPrototypeOf(value); compare p === Ctor.prototype;
//         climb until p is null.

function myInstanceof(value: unknown, Ctor: { prototype: object }): boolean {
  return TODO // ← your solution
}

section("3.8", () => {
  check("3.8a", myInstanceof([], Array), true)
  check("3.8b", myInstanceof([], Object), true)
  check("3.8c", myInstanceof({}, Array), false)
  check("3.8d", myInstanceof(Object.create(null), Object), false)
  check("3.8e", myInstanceof(5, Number), false)
  check("3.8f", myInstanceof(new Date(), Date), true)
  class A {}
  class B extends A {}
  check("3.8g", myInstanceof(new B(), A), true)
  check("3.8h", myInstanceof(new A(), B), false)
})

// EXPLAIN IT — recite your loop as prose. This is the canonical "explain
// prototypes" interview answer:
/*

*/

// ═══ EXERCISE 3.9 ★★★ — property descriptors: the hidden switches ═══
// TASK: Predict each result. Strict mode matters here!
// VOCAB: property descriptor, writable, enumerable, configurable
// HINT 1: writable:false + strict mode assignment → TypeError (sloppy mode
//         fails SILENTLY — the historical footgun).
// HINT 2: enumerable:false hides from Object.keys, for...in, JSON.stringify,
//         spread — but NOT from direct access.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty

const artifact: any = {}
Object.defineProperty(artifact, "power", { value: 9001, writable: false, enumerable: false, configurable: false })
artifact.visible = 1

check("3.9a", artifact.power, TODO)
check("3.9b", attempt(() => { artifact.power = 1; return artifact.power }), TODO)
check("3.9c", Object.keys(artifact), TODO)
check("3.9d", JSON.stringify(artifact), TODO)
check("3.9e", attempt(() => { delete artifact.power; return artifact.power }), TODO)
check("3.9f", attempt(() => Object.defineProperty(artifact, "power", { value: 2 })), TODO)

// EXPLAIN IT — name the three descriptor flags and one real-world API that
// relies on non-enumerable properties (hint: every class you've ever written):
/*

*/

// ═══ EXERCISE 3.10 ★★★ — getters and setters ═══
// TASK: Implement the `celsius` accessor pair on Thermometer: reading returns
//       (fahrenheit - 32) * 5/9, writing updates fahrenheit accordingly.
// VOCAB: accessor property, computed property, data property
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get

class Thermometer {
  fahrenheit = 32
  // ← your solution here (get celsius / set celsius)
}

section("3.10", () => {
  const t = new Thermometer() as any
  check("3.10a", t.celsius, 0)
  t.fahrenheit = 212
  check("3.10b", t.celsius, 100)
  t.celsius = 37
  check("3.10c", Math.round(t.fahrenheit * 10) / 10, 98.6)
})

// EXPLAIN IT — when do accessors beat getX()/setX() methods, and what's the
// hidden risk of heavy logic in a getter?
/*

*/

// ═══ EXERCISE 3.11 ★★★ — extends, super, and construction order ═══
// TASK: Predict the recorded construction/call log.
// VOCAB: super(), derived class, method override, super.method()
// HINT 1: A derived constructor MUST call super() before touching `this`.
// HINT 2: Field initializers of the derived class run AFTER super() returns.

const log3_11: string[] = []
class Animal3 {
  legs = (log3_11.push("animal-field"), 4)
  constructor() { log3_11.push("animal-ctor") }
  speak() { return "..." }
}
class Dog3 extends Animal3 {
  tail = (log3_11.push("dog-field"), true)
  constructor() { super(); log3_11.push("dog-ctor") }
  speak() { return "woof (was: " + super.speak() + ")" }
}
const d3 = new Dog3()
check("3.11a", log3_11, TODO)
check("3.11b", d3.speak(), TODO)
check("3.11c", d3.legs, TODO)

// EXPLAIN IT — why does the language FORCE super() before `this`? What could
// go wrong otherwise?
/*

*/

// ═══ EXERCISE 3.12 ★★★ — #private fields are a brand, not sugar ═══
// TASK: Predict each result.
// VOCAB: private field, brand check, WeakMap-like privacy, `#x in obj`
// HINT 1: #fields are installed by the constructor. A method borrowed onto a
//         foreign object throws when touching #fields — the brand is missing.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties

class Vault {
  #secret: string
  constructor(secret: string) { this.#secret = secret }
  reveal() { return this.#secret }
  static isVault(o: object) { return #secret in o }
}
const v = new Vault("42")
check("3.12a", v.reveal(), TODO)
check("3.12b", Vault.isVault(v), TODO)
check("3.12c", Vault.isVault({ reveal: () => "fake" }), TODO)
check("3.12d", attempt(() => v.reveal.call({} as any)), TODO)
check("3.12e", Object.keys(v), TODO)
check("3.12f", JSON.stringify(v), TODO)

// EXPLAIN IT — compare #private with closure privacy (ch. 2.14) and with the
// `private` keyword of TypeScript. Which is enforced at RUNTIME?
/*

*/

// ═══ EXERCISE 3.13 ★★★★ — implement bind yourself ═══
// TASK: Implement myBind (don't use .bind inside). Support preset arguments.
// VOCAB: closure over thisArg, apply, partial application

function myBind<R>(
  fn: (this: any, ...args: any[]) => R,
  thisArg: unknown,
  ...preset: unknown[]
): (...args: unknown[]) => R {
  return TODO // ← your solution
}

section("3.13", () => {
  function describe(this: any, sep: string, punct: string) {
    return `${this?.kind}${sep}${this?.name}${punct}`
  }
  const cat = { kind: "cat", name: "Mia" }
  const boundDescribe = myBind(describe, cat)
  check("3.13a", boundDescribe(":", "!"), "cat:Mia!")
  const partial = myBind(describe, cat, "=")
  check("3.13b", partial("?"), "cat=Mia?")
  check("3.13c", boundDescribe.call({ kind: "dog", name: "Rex" } as any, ":", "!"), "cat:Mia!") // must stay bound
})

// EXPLAIN IT — your implementation in one sentence; then: what does the REAL
// bind do that yours doesn't (think `new`):
/*

*/

// ═══ EXERCISE 3.14 ★★★★ — a taste of Proxy ═══
// TASK: Implement withDefault(target, def): reading a MISSING key returns def
//       instead of undefined; everything else behaves normally.
// VOCAB: Proxy, get trap, Reflect.get, transparent virtualization
// HINT 1: new Proxy(target, { get(t, key, receiver) { ... } })
// HINT 2: `key in t` decides missing vs present; Reflect.get for the normal path.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy

function withDefault<T>(target: Record<string, T>, def: T): Record<string, T> {
  return TODO // ← your solution
}

section("3.14", () => {
  const scores = withDefault({ alice: 10 }, 0)
  check("3.14a", scores.alice, 10)
  check("3.14b", scores.bob, 0)
  check("3.14c", "bob" in scores, false)     // reading gave a default, but it's NOT there
  scores.carol = 7
  check("3.14d", scores.carol, 7)
  check("3.14e", Object.keys(scores), ["alice", "carol"])
})

// EXPLAIN IT — name two legit Proxy use cases and one reason to avoid Proxies
// in hot paths:
/*

*/

// ═══ EXERCISE 3.15 ★★★★★ — the this gauntlet ═══
// TASK: Predict each result. On paper. This is the chapter boss.
// VOCAB: everything above at once

const boss = {
  hp: 100,
  hit(this: any) { this.hp -= 10; return this?.hp },
}

check("3.15a", boss.hit(), TODO)
const hit = boss.hit
check("3.15b", attempt(() => hit()), TODO)
check("3.15c", [boss.hit][0]!(), TODO)                  // who is `this` for an array-member call?
const arena = { hp: 1, boss, strike(this: any) { return this.boss.hit() } }
check("3.15d", arena.strike(), TODO)                    // whose hp changed?
check("3.15e", boss.hp, TODO)
const strike = arena.strike
check("3.15f", attempt(() => strike()), TODO)
check("3.15g", (boss.hit)(), TODO)                      // parens around property access — receiver kept?
check("3.15h", boss?.hit?.(), TODO)                     // optional-call — receiver kept?

// EXPLAIN IT — write your personal 3-rule algorithm for answering ANY
// "what is this?" question (rule 1 should mention the call site):
/*

*/

console.log(`\nchapter 03: ${_pass} pass, ${_fail} fail, ${_skip} unanswered`)
export {}
