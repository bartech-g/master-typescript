// ════════════════════════════════════════════════════════════════════════════
// CHAPTER 01 — VALUES, TYPES & COERCION                        run: node 01-*.ts
// ════════════════════════════════════════════════════════════════════════════
// HOW THIS CHAPTER WORKS
//   Every `check(id, actual, prediction)` call computes `actual` at runtime and
//   compares it to YOUR prediction. Replace each TODO with the exact value you
//   believe the expression produces (write it as a real JS value: "12", NaN,
//   null, ["a"], "TypeError"...). Then run the file. PASS = you were right.
//   Don't guess-and-rerun to brute force it — predict first, that's the rep.
//
//   `attempt(fn)` runs fn and returns its result, or the error's name (e.g.
//   "TypeError") if it throws. So a prediction for attempt(...) is either a
//   value or an error-name string.
//
//   Implementation exercises (where you write code instead of predicting) show
//   FAIL until your code works — that's a normal red→green test loop.

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
// You'll see `as any` sprinkled on some expressions below. That's because
// TypeScript refuses to even COMPILE many of these comparisons (TS2367: "no
// overlap") — which is itself the first lesson: TS exists to make this whole
// chapter's bug class impossible. The casts re-enable raw JavaScript.

// ═══ EXERCISE 1.1 ★ — typeof, the seven-and-a-half answers ═══
// TASK: Predict what typeof returns for each value. Every answer is a string.
// VOCAB: primitive, dynamic typing, historical bug (typeof null)
// HINT 1: There are exactly 8 possible results of typeof. One of them is wrong
//         on purpose (kept for web compatibility since 1995).
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof

check("1.1a", typeof 42, "number")
check("1.1b", typeof "42", "string")
check("1.1c", typeof null, "object")
check("1.1d", typeof undefined, "undefined")
check("1.1e", typeof NaN, "number")
check("1.1f", typeof [], "object")
check("1.1g", typeof (() => { }), "function")
check("1.1h", typeof Symbol(), "symbol")
check("1.1i", typeof 10n, "bigint")
check("1.1j", typeof typeof 42, "string")

// EXPLAIN IT (2–4 sentences, use the vocab, say it out loud):
/*
The typeof operator returns a string indicating the type of the operand's value.
- array is type "object" and null also. typeof typeof is indicating as "string"
*/

// ═══ EXERCISE 1.2 ★ — strict equality is not "the safe one", it's "the simple one" ═══
// TASK: Predict each result (true/false).
// VOCAB: strict equality, IEEE 754, NaN, signed zero
// HINT 1: Two of these are the ONLY cases where === disagrees with "same value".
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness

check("1.2a", 1 === 1.0, true)
check("1.2b", (NaN as any) === (NaN as any), false)
check("1.2c", 0 === -0, true)
check("1.2d", "a" === "a", true)
check("1.2e", ([] as any) === ([] as any), false)
check("1.2f", (({}) as any) === ({}), false)

// EXPLAIN IT — why do 1.2e/f behave that way while 1.2d doesn't? What does ===
// actually compare for objects vs primitives?
/*
obecjt and arrays stored separeted referencpoints in memory, primitive values stored directly. and the strickly and loosly equal compare reference values.
*/

// ═══ EXERCISE 1.3 ★★ — Object.is: the third kind of equality ═══
// TASK: Predict each result.
// VOCAB: SameValue, SameValueZero, reference identity
// HINT 1: Object.is fixes exactly the two === anomalies from 1.2 — nothing else.
// HINT 2: Array.prototype.includes uses SameValueZero; indexOf uses ===.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is

check("1.3a", Object.is(NaN, NaN), true)
check("1.3b", Object.is(0, -0), false)
check("1.3c", Object.is(1, 1), true)
check("1.3d", [NaN].includes(NaN), true)
check("1.3e", [NaN].indexOf(NaN), -1)
check("1.3f", [0].includes(-0), true)

// EXPLAIN IT — name the three equality algorithms and where the language uses each:
/*

*/

// ═══ EXERCISE 1.4 ★★ — loose equality, part 1: the rules you must actually know ═══
// TASK: Predict each result. Then read the hint and check yourself against the
//       real algorithm, not vibes.
// VOCAB: loose equality, ToNumber coercion, nullish pairing
// HINT 1: The == algorithm in one breath: null and undefined equal each other
//         and NOTHING else; string vs number → string becomes number; boolean
//         anywhere → boolean becomes number FIRST; object vs primitive →
//         object becomes primitive (ToPrimitive), then repeat.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality

check("1.4a", null == undefined, true)
check("1.4b", null == 0, false)
check("1.4c", undefined == 0, false)
check("1.4d", ("" as any) == 0, true)
check("1.4e", ("0" as any) == 0, true)
check("1.4f", ("" as any) == "0", false)
check("1.4g", (true as any) == 1, true)
check("1.4h", (true as any) == "1", true)
check("1.4i", (false as any) == "", true)
check("1.4j", null == false, false)

// EXPLAIN IT — recite the == algorithm from HINT 1 in your own words:
/*

*/

// ═══ EXERCISE 1.5 ★★★ — loose equality, part 2: objects enter the chat ═══
// TASK: Predict each result. Work through the algorithm ON PAPER for 1.5d.
// VOCAB: ToPrimitive, valueOf, toString, hint "default"
// HINT 1: An array becomes a primitive via toString: [] → "", [0] → "0",
//         [1,2] → "1,2".
// HINT 2: For 1.5d: !arr evaluates FIRST (plain boolean logic), then ==.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#type_coercion

check("1.5a", ([] as any) == 0, true) // "" -> 0 -> false
check("1.5b", ([] as any) == "", true)
check("1.5c", ([0] as any) == false, true)
const arr: any = []
check("1.5d", arr == !arr, true) // i.e. [] == ![] "" == !"" 0 !0
check("1.5e", ([null] as any) == 0, true)
check("1.5f", ([undefined] as any) == 0, true)
check("1.5g", (({}) as any) == "[object Object]", true)
check("1.5h", ([[]] as any) == 0, true)

// EXPLAIN IT — walk through 1.5d step by step (this is a classic interview trap):
/*
first run the ! operation that means ![] = ![]  →  !true  →  false = 0, then emopty array is "" qhich is 0 so 0 = 0
*/

// ═══ EXERCISE 1.6 ★★ — the + operator: concatenation wins ═══
// TASK: Predict each result. Mind the types AND the values.
// VOCAB: operator overloading, string concatenation, unary plus
// HINT 1: Binary + : if EITHER side is a string (after ToPrimitive), it
//         concatenates. Every other arithmetic operator (-, *, /) only knows
//         numbers.
// HINT 2: 1.6g contains a UNARY plus. Find it.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Addition

check("1.6a", 1 + ("2" as any), "12")
check("1.6b", ("3" as any) - 1, 2)
check("1.6c", 1 + 2 + "3", "33")
check("1.6d", "1" + 2 + 3, "123")
check("1.6e", ([] as any) + [], "")
check("1.6f", ([] as any) + {}, "[object Object]")
check("1.6g", ("b" as any) + "a" + +"a" + "a", "baNaNa")
check("1.6h", (true as any) + true, 2)
check("1.6i", (({}) as any) + [], "[object Object]")
// Note for 1.6i: in an old REPL, typing `{} + []` at the prompt gives a
// DIFFERENT answer, because `{}` parses as an empty BLOCK, not an object.
// Here the parentheses force expression position.

// EXPLAIN IT — state the + rule and contrast it with - :
/*
+ as an unary is the same as Number(n) + as a binary add numbers and is one operand is a string than converts number to string and  concatenate it. - is a mathematical - operator works only on numbers.
*/

// ═══ EXERCISE 1.7 ★★ — truthiness: the exact list ═══
// TASK: Predict each result.
// VOCAB: falsy, truthy, boxed primitive
// HINT 1: There are exactly 8 falsy values: false, 0, -0, 0n, "", null,
//         undefined, NaN. EVERYTHING else is truthy. Everything.
// DOCS: https://developer.mozilla.org/en-US/docs/Glossary/Falsy

check("1.7a", Boolean(""), false)
check("1.7b", Boolean("0"), true)
check("1.7c", Boolean("false"), true)
check("1.7d", Boolean([]), true)
check("1.7e", Boolean({}), true)
const boxedFalse: unknown = new Boolean(false)
check("1.7f", Boolean(boxedFalse), true)
check("1.7g", Boolean(0n), false)
check("1.7h", Boolean(" "), true)
check("1.7i", Boolean(NaN), false)

// EXPLAIN IT — why is 1.7f the nastiest one on this list? What general rule
// about objects does it demonstrate?
/*

*/

// ═══ EXERCISE 1.8 ★★★ — Number() vs parseInt(): different species ═══
// TASK: Predict each result.
// VOCAB: ToNumber, leading-garbage parsing, radix
// HINT 1: Number() converts the WHOLE string or fails to NaN; parseInt reads
//         digits from the left until it can't, and gives up gracefully.
// HINT 2: Number(null) and Number(undefined) disagree. So do Number("") and
//         parseInt("").
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt

check("1.8a", Number(""), 0)
check("1.8b", Number("  12  "), 12)
check("1.8c", Number("12px"), NaN)
check("1.8d", parseInt("12px"), 12)
check("1.8e", parseInt(""), NaN)
check("1.8f", Number(null), 0)
check("1.8g", Number(undefined), NaN)
check("1.8h", Number("0x10"), 16)
check("1.8i", Number([5]), 5)
check("1.8j", Number([1, 2]), NaN)
check("1.8k", parseInt("08"), 8)
check("1.8l", Number(true), 1)

// EXPLAIN IT — when would you pick Number(), parseInt(), and parseFloat() and why:
/*

*/

// ═══ EXERCISE 1.9 ★★★ — ToPrimitive: who gets called, valueOf or toString? ═══
// TASK: The object below records which conversion methods run. Predict the
//       RESULT and the CALL LOG for each operation.
// VOCAB: ToPrimitive, hint ("number" | "string" | "default"), OrdinaryToPrimitive
// HINT 1: hint "number" and "default" try valueOf first, then toString.
//         Hint "string" (template literals, String()) tries toString first.
//         Plain objects' default valueOf returns the object itself → skipped.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive

function makeSpy() {
  const log: string[] = []
  const obj = {
    valueOf() { log.push("valueOf"); return 10 },
    toString() { log.push("toString"); return "ten" },
  }
  return { obj, log }
}

{
  const { obj, log } = makeSpy()
  check("1.9a", (obj as any) + 1, 11)          // result?
  check("1.9b", log, ["valueOf"])                        // which methods ran, in order? e.g. ["valueOf"]
}
{
  const { obj, log } = makeSpy()
  check("1.9c", `${obj}`, "ten")                   // result?
  check("1.9d", log, ["toString"])
}
{
  const { obj, log } = makeSpy()
  check("1.9e", (obj as any) * 2, 20)
  check("1.9f", log, ["valueOf"])
}
{
  const { obj, log } = makeSpy()
  check("1.9g", String(obj), "ten")
  check("1.9h", log, ["toString"])
}

// EXPLAIN IT — describe the ToPrimitive algorithm including the three hints:
/*

*/

// ═══ EXERCISE 1.10 ★★★★ — build the impossible: x == 1 && x == 2 && x == 3 ═══
// TASK: Implement `makeCounter()` so the assertion passes. You may not touch
//       the check line. (Yes, this is a real interview question.)
// VOCAB: stateful valueOf, coercion side effects
// HINT 1: == with an object on one side calls ToPrimitive on it EVERY time.
// HINT 2: A method that returns a different number on each call...
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive

function makeCounter(): unknown {
  let n = 0
  return {
    valueOf() {
      return ++n
    },
  }// ← your solution
}

{
  const x = makeCounter() as any
  check("1.10", x == 1 && x == 2 && x == 3, true)
}

// EXPLAIN IT — why does this work, and why is it also a great argument FOR ===:
/*
Mert a valueOf a makeCounter belsejében van definiálva, ezért látja az n változót (ezt hívják closure-nak). Az n megmarad a hívások között, és minden valueOf hívás eggyel növeli.

Tehát:

x mindig ugyanaz az objektum
az n az objektumon kívül, a closure-ban él
minden összehasonlításnál a JS újra meghívja a valueOf-ot, ami más számot ad vissza
*/

// ═══ EXERCISE 1.11 ★★★ — Symbol.toPrimitive: taking full control ═══
// TASK: Implement class Temperature so all three checks pass: numeric context
//       → the number of degrees; string context → "25°C"; default → "25 deg".
// VOCAB: Symbol.toPrimitive, well-known symbol, conversion hint
// HINT 1: [Symbol.toPrimitive](hint) receives "number" | "string" | "default".
// HINT 2: `t + ""` uses hint "default", `${t}` uses hint "string", `+t` uses
//         hint "number".
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive

class Temperature {
  degrees: number
  constructor(degrees: number) { this.degrees = degrees }
  [Symbol.toPrimitive](hint: "number" | "string" | "default") {
    if (hint === "number") {
      return this.degrees;
    } else if (hint === "string") {
      return `${this.degrees}°C`;
    } else if (hint === "default") {
      return `${this.degrees} deg`;
    }
  }
}

{
  const t = new Temperature(25)
  check("1.11a", +(t as any), 25)
  check("1.11b", `${t}`, "25°C")
  check("1.11c", (t as any) + "", "25 deg")
}

// EXPLAIN IT — how does Symbol.toPrimitive relate to valueOf/toString (who wins)?
/*
Symbol.toPrimitive valueOf/toString can be maipoulated and change the default toprimitive behaviour.
*/

// ═══ EXERCISE 1.12 ★★ — relational operators: strings compare like words ═══
// TASK: Predict each result.
// VOCAB: lexicographic comparison, code unit, ToNumber (for relational ops)
// HINT 1: If BOTH sides are strings, < compares character-by-character by
//         UTF-16 code unit. Otherwise both sides become numbers.
// HINT 2: For 1.12e/f: null converts to 0 for relational ops, but the ==
//         algorithm has its special nullish rule. They genuinely disagree.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than

check("1.12a", ("10" as any) < "9", true)
// UTF-16 code units "10" is 49 48, "9" is 57.
check("1.12b", ("10" as any) < 9, false)
// "10" is converted to a number 10, 10 < 9 is false.
check("1.12c", "apple" < "banana", true)
// UTF-16 code units "apple" is 97 112 112 108 101, "banana" is 98 97 110 97 110 97. 
check("1.12d", "Z" < "a", true)
// UTF-16 code units "Z" is 90, "a" is 97.
check("1.12e", (null as any) >= 0, true)
// null is converted to 0, 0 >= 0 is true.
check("1.12f", (null as any) > 0, false)
// null is converted to 0, 0 > 0 is false.
check("1.12g", (undefined as any) <= 0, false)
// undefined is converted to NaN, NaN <= 0 is false.
check("1.12h", NaN <= NaN, false)
// NaN is not equal to anything, including itself.

// EXPLAIN IT — why can 1.12e be true while 1.12f is false? What does that tell
// you about how >= is implemented?
/*
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than the
Description
The operands are compared with multiple rounds of coercion, which can be summarized as follows: is straight forward.
*/

// ═══ EXERCISE 1.13 ★★ — floating point: 0.1 + 0.2, but you can explain it ═══
// TASK: Predict, then implement approxEqual.
// VOCAB: IEEE 754 double, binary fraction, machine epsilon, ULP
// HINT 1: 0.1 in binary is a repeating fraction — it cannot be stored exactly,
//         like 1/3 in decimal.
// HINT 2: approxEqual: compare |a - b| against a tolerance scaled by the
//         magnitudes, e.g. Number.EPSILON * Math.max(1, |a|, |b|).
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON

check("1.13a", 0.1 + 0.2 === 0.3, TODO)
check("1.13b", 0.1 + 0.2, TODO)          // predict the EXACT printed value
check("1.13c", 0.5 + 0.25 === 0.75, TODO) // why does THIS one work? (see EXPLAIN IT)

function approxEqual(a: number, b: number): boolean {
  return TODO // ← your solution
}

check("1.13d", approxEqual(0.1 + 0.2, 0.3), true)
check("1.13e", approxEqual(0.1 + 0.2, 0.30001), false)
check("1.13f", approxEqual(1e10 + 1e-6, 1e10), true) // relative, not absolute!

// EXPLAIN IT — why is 1.13c exact while 1.13a isn't? Use "binary fraction":
/*

*/

// ═══ EXERCISE 1.14 ★★★ — big numbers: where integers silently break ═══
// TASK: Predict each result.
// VOCAB: MAX_SAFE_INTEGER, 53-bit mantissa, BigInt, TypeError on mixing
// HINT 1: Doubles have 53 bits for the integer part. Beyond 2^53, not every
//         integer exists — some literals round to their neighbor.
// HINT 2: BigInt refuses implicit mixing with number in arithmetic (+), but
//         COMPARISON operators (==, <) work across the two types.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt

check("1.14a", Number.MAX_SAFE_INTEGER, TODO)
check("1.14b", 9007199254740992 === 9007199254740993, TODO)
check("1.14c", 9007199254740993, TODO)   // what does this literal actually store?
check("1.14d", attempt(() => (1n as any) + 1), TODO)
check("1.14e", (1n as any) == 1, TODO)
check("1.14f", (2n as any) > 1, TODO)
check("1.14g", 10n / 3n, TODO)

// EXPLAIN IT — when do you reach for BigInt, and what's the interop rule:
/*

*/

// ═══ EXERCISE 1.15 ★★★ — division, Infinity and NaN propagation ═══
// TASK: Predict each result.
// VOCAB: Infinity, NaN propagation, indeterminate form
// HINT 1: JS never throws for number arithmetic. Division by zero gives a
//         signed Infinity; "meaningless" operations give NaN.
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NaN

check("1.15a", 1 / 0, TODO)
check("1.15b", -1 / 0, TODO)
check("1.15c", 0 / 0, TODO)
check("1.15d", Infinity - Infinity, TODO)
check("1.15e", Infinity * 0, TODO)
check("1.15f", ("5" as any) / ("0" as any), TODO)
check("1.15g", Math.sqrt(-1), TODO)
check("1.15h", NaN + 1, TODO)
check("1.15i", isNaN("hello" as any), TODO)
check("1.15j", Number.isNaN("hello" as any), TODO)

// EXPLAIN IT — global isNaN vs Number.isNaN: which one coerces, which should
// you use, and why does 1.15i/j differ?
/*

*/

// ═══ EXERCISE 1.16 ★★★ — JSON.stringify: the silent value-dropper ═══
// TASK: Predict each result. Some answers are the string 'undefined' meaning
//       the CALL returned undefined (not a string!).
// VOCAB: serialization, JSON data model, replacer
// HINT 1: JSON has no undefined, no functions, no symbols, no NaN/Infinity.
//         In an OBJECT they're dropped; in an ARRAY they become null; at the
//         TOP level stringify returns undefined (not a string).
// DOCS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify

check("1.16a", JSON.stringify({ a: 1, b: undefined }), TODO)
check("1.16b", JSON.stringify([1, undefined, 2]), TODO)
check("1.16c", JSON.stringify(undefined), TODO)
check("1.16d", JSON.stringify(NaN), TODO)
check("1.16e", JSON.stringify({ f: () => 1 }), TODO)
check("1.16f", JSON.stringify(new Date(0)), TODO)
check("1.16g", attempt(() => { const a: any = {}; a.self = a; return JSON.stringify(a) }), TODO)

// EXPLAIN IT — list what JSON.stringify does with each non-JSON value, and name
// one real bug this causes in APIs:
/*

*/

// ═══ EXERCISE 1.17 ★★★★★ — implement loose equality yourself ═══
// TASK: Implement looseEq(a, b) that reproduces the == algorithm for this
//       subset: numbers, strings, booleans, null, undefined, and objects
//       (arrays included) via their ToPrimitive. Do NOT use == or != anywhere
//       inside (=== is allowed). The gauntlet below compares you against the
//       real thing on 100+ pairs.
// VOCAB: abstract equality algorithm, ToPrimitive, recursive coercion
// HINT 1: Structure it exactly like the spec: same types? use ===. nullish
//         pair? true. number/string? convert string with Number(). boolean?
//         convert with Number() and RECURSE. object vs string/number? convert
//         object with ToPrimitive and RECURSE.
// HINT 2: ToPrimitive for hint "default": call valueOf(); if the result is an
//         object, call toString().
// DOCS: https://tc39.es/ecma262/#sec-islooselyequal (yes, the actual spec —
//       it's 14 lines and perfectly readable)

function looseEq(a: unknown, b: unknown): boolean {
  return TODO // ← your solution
}

{
  const values: unknown[] = [
    0, -0, 1, -1, NaN, Infinity, "", "0", "1", " ", "a", "NaN",
    true, false, null, undefined, [], [0], [1], [[]], [null], {},
    "[object Object]", [1, 2], "1,2",
  ]
  let disagreements = 0
  for (const a of values) for (const b of values) {
    // eslint-disable-next-line eqeqeq
    if (looseEq(a, b) !== ((a as any) == (b as any))) {
      if (disagreements < 5) console.log(`     looseEq disagrees on: ${show(a)} == ${show(b)}`)
      disagreements++
    }
  }
  check("1.17", disagreements, 0)
}

// EXPLAIN IT — you just implemented the most feared algorithm in JS. Summarize
// it in 3 sentences, then state your personal rule for when == is acceptable:
/*

*/

console.log(`\nchapter 01: ${_pass} pass, ${_fail} fail, ${_skip} unanswered`)
export { }
