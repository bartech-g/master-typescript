// ════════════════════════════════════════════════════════════════════════════
// CHAPTER 07 — TS FUNDAMENTALS & NARROWING            (editor-checked chapter)
// ════════════════════════════════════════════════════════════════════════════
// NEW WORKFLOW from here on: no node, no output. Your editor's red squiggles
// ARE the test runner. The chapter is complete when this file has ZERO errors
// (and every // @ts-expect-error line still "needs" its error — if one of
// those lines gets a squiggle saying the directive is unused, YOU broke it).
//
// Two kinds of exercise sites:
//   • `PREDICT` — replace it with the exact type you believe TS infers or
//     narrows to. The Expect<Equal<...>> line goes green when you're right.
//   • `unknown // ← your solution` (or a marked function body) — implement it.
//
// The helpers:
//   Equal<X, Y> is EXACT type equality (any ≠ unknown, 1 ≠ number).
//   Expect<T> demands true. Together: a compile-time assertEq.

type Expect<T extends true> = T
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false
/** Replace every PREDICT with your prediction of the type. */
type PREDICT = { "← replace me with your prediction": true }

// ═══ EXERCISE 7.1 ★ — inference and literal widening ═══
// TASK: For each declaration, replace PREDICT with the type TS infers.
// VOCAB: type inference, literal type, widening, const assertion
// HINT 1: const primitives stay literal ("hi"); let widens (string). Object
//         PROPERTIES widen even under const — unless `as const`.
// DOCS: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html

const c7_1a = 42
type _7_1a = Expect<Equal<typeof c7_1a, PREDICT>>
let c7_1b = 42
type _7_1b = Expect<Equal<typeof c7_1b, PREDICT>>
const c7_1c = "hi"
type _7_1c = Expect<Equal<typeof c7_1c, PREDICT>>
let c7_1d = "hi"
type _7_1d = Expect<Equal<typeof c7_1d, PREDICT>>
const c7_1e = [1, 2]
type _7_1e = Expect<Equal<typeof c7_1e, PREDICT>>
const c7_1f = [1, "x"]
type _7_1f = Expect<Equal<typeof c7_1f, PREDICT>>
const c7_1g = { x: 1 }
type _7_1g = Expect<Equal<typeof c7_1g, PREDICT>>
const c7_1h = { x: 1 } as const
type _7_1h = Expect<Equal<typeof c7_1h, PREDICT>>
const c7_1i = [1, 2] as const
type _7_1i = Expect<Equal<typeof c7_1i, PREDICT>>
const c7_1j = null
type _7_1j = Expect<Equal<typeof c7_1j, PREDICT>>

// EXPLAIN IT (2–4 sentences, use the vocab, say it out loud):
/*

*/

// ═══ EXERCISE 7.2 ★★ — structural typing & excess property checks ═══
// TASK: Nothing to fix — BOTH marked lines are correct as-is. Your job is the
//       EXPLAIN IT: why does the aliased call compile while the inline
//       literal is rejected?
// VOCAB: structural typing, assignability, excess property check, fresh object literal
// DOCS: https://www.typescriptlang.org/docs/handbook/2/objects.html#excess-property-checks

interface Point7 { x: number; y: number }
function len7(p: Point7): number { return Math.hypot(p.x, p.y) }

const withExtra7 = { x: 3, y: 4, z: 5 }
len7(withExtra7)                    // ✅ compiles — extra prop via alias is fine
// @ts-expect-error — the SAME object as a fresh literal is rejected
len7({ x: 3, y: 4, z: 5 })

// EXPLAIN IT — include the phrase "excess property checks only apply to fresh
// object literals" and say WHY the loophole is deliberate:
/*

*/

// ═══ EXERCISE 7.3 ★★ — narrowing with typeof ═══
// TASK: Replace each PREDICT with the narrowed type at that point.
// VOCAB: control flow analysis, type guard, narrowing, union member elimination
// DOCS: https://www.typescriptlang.org/docs/handbook/2/narrowing.html

function describe7_3(v: string | number | boolean) {
  if (typeof v === "string") {
    type _1 = Expect<Equal<typeof v, PREDICT>>
    return v.toUpperCase()
  }
  if (typeof v === "boolean") {
    type _2 = Expect<Equal<typeof v, PREDICT>>
    return v ? "yes" : "no"
  }
  type _3 = Expect<Equal<typeof v, PREDICT>>
  return v.toFixed(2)
}

// EXPLAIN IT — what exactly does the compiler track through those branches?
/*

*/

// ═══ EXERCISE 7.4 ★★★ — truthiness narrowing has a famous hole ═══
// TASK: Replace each PREDICT.
// VOCAB: truthiness narrowing, falsy literal, empty string trap
// HINT 1: `if (x)` eliminates undefined... but ALSO eliminates "". Where does
//         "" end up?

function greet7_4(name?: string) {
  if (name) {
    type _1 = Expect<Equal<typeof name, PREDICT>>
    return `hi ${name}`
  }
  type _2 = Expect<Equal<typeof name, PREDICT>>
  return "hi stranger"
}

function greetPrecise7_4(name?: string) {
  if (name !== undefined) {
    type _3 = Expect<Equal<typeof name, PREDICT>>
    return `hi ${name}`
  }
  type _4 = Expect<Equal<typeof name, PREDICT>>
  return "hi stranger"
}

// EXPLAIN IT — when is `if (x)` on a string | undefined a real bug? Give the
// concrete input that behaves differently in the two functions above:
/*

*/

// ═══ EXERCISE 7.5 ★★★ — discriminated unions + exhaustiveness ═══
// TASK: Implement area(). The `default` branch contains an assertion that the
//       remaining type is never — which only holds if you handled EVERY kind.
//       (Try deleting one case afterwards and watch the assertion catch you.)
// VOCAB: discriminated union, discriminant/tag, exhaustiveness check, never
// DOCS: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions

type Shape7 =
  | { kind: "circle"; r: number }
  | { kind: "square"; side: number }
  | { kind: "rect"; w: number; h: number }

function area7(s: Shape7): number {
  switch (s.kind) {
    // ← your solution: one case per kind
    default: {
      type _exhaustive = Expect<Equal<typeof s, never>>
      throw new Error("unreachable")
    }
  }
}

// EXPLAIN IT — why is the discriminant property + switch the load-bearing
// pattern of production TS? What maintenance guarantee does the never-check buy?
/*

*/

// ═══ EXERCISE 7.6 ★★★ — any vs unknown vs never ═══
// TASK: Replace each PREDICT. Two of these results are genuinely shocking.
// VOCAB: top type, bottom type, any (unsound), conditional type over any
// HINT 1: `any extends string ? 1 : 2` doesn't pick a branch — any is BOTH.
// HINT 2: never is the empty union; a conditional distributing over it has
//         nothing to distribute.

type _7_6a = Expect<Equal<any extends string ? 1 : 2, PREDICT>>
type _7_6b = Expect<Equal<unknown extends string ? 1 : 2, PREDICT>>
type _7_6c = Expect<Equal<string extends unknown ? 1 : 2, PREDICT>>
type _7_6d = Expect<Equal<string extends any ? 1 : 2, PREDICT>>
type _7_6e = Expect<Equal<never extends string ? 1 : 2, PREDICT>>

// Assignability drill — these directives are all correct; explain each:
declare const someAny: any
declare const someUnknown: unknown
const okA: unknown = someAny          // any → unknown: fine
const okB: string = someAny           // any → string: "fine" (this is the hole!)
// @ts-expect-error unknown does NOT flow into string
const bad1: string = someUnknown
// @ts-expect-error unknown members can't be touched
someUnknown.length
void okA; void okB

// EXPLAIN IT — "unknown is the type-safe any". Make that precise: what can
// you DO with each, and which direction does each flow?
/*

*/

// ═══ EXERCISE 7.7 ★★★★ — user-defined type guards ═══
// TASK: Add a type-predicate return annotation to isDefined so the filter
//       result type collapses correctly and the assertion goes green.
// VOCAB: type predicate, `x is T`, NonNullable, filter overload
// HINT 1: The annotation shape is `: x is SOMETHING<T>`.
// DOCS: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates

function isDefined7<T>(x: T) /* ← your solution: add a return annotation */ {
  return x !== null && x !== undefined
}

const mixed7 = [1, null, "a", undefined]
const clean7 = mixed7.filter(isDefined7)
type _7_7 = Expect<Equal<typeof clean7, (string | number)[]>>

// EXPLAIN IT — what contract are you signing with a type predicate, and what
// happens at runtime if your predicate lies?
/*

*/

// ═══ EXERCISE 7.8 ★★★ — annotation vs `as const` vs satisfies ═══
// TASK: Replace each PREDICT. The three declarations look interchangeable.
//       They are not.
// VOCAB: type annotation (upcast), const assertion, satisfies operator
// DOCS: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator

type Config7 = { env: "dev" | "prod"; port: number }

const cfgA7: Config7 = { env: "prod", port: 8080 }
type _7_8a = Expect<Equal<typeof cfgA7.env, PREDICT>>

const cfgB7 = { env: "prod", port: 8080 } as const
type _7_8b = Expect<Equal<typeof cfgB7.env, PREDICT>>
type _7_8c = Expect<Equal<typeof cfgB7.port, PREDICT>>

const cfgC7 = { env: "prod", port: 8080 } satisfies Config7
type _7_8d = Expect<Equal<typeof cfgC7.env, PREDICT>>
type _7_8e = Expect<Equal<typeof cfgC7.port, PREDICT>>

// satisfies still CHECKS (this directive is correct — typo caught):
// @ts-expect-error
const cfgBad7 = { env: "production", port: 8080 } satisfies Config7

// EXPLAIN IT — "satisfies checks without changing the inferred type." Explain
// when you want that instead of an annotation:
/*

*/

// ═══ EXERCISE 7.9 ★★★ — assertions: the compiler takes your word for it ═══
// TASK: Replace each PREDICT, then study which assertions even compile.
// VOCAB: type assertion, double assertion, unsoundness on purpose

const lie7 = "42" as unknown as number
type _7_9a = Expect<Equal<typeof lie7, PREDICT>>   // what does TS BELIEVE?
// ...meanwhile at runtime, lie7 is still a string. The type system now
// disagrees with reality. Every method call on lie7 is a latent crash.

// @ts-expect-error — a DIRECT far-fetched assertion is refused...
const refused7 = "42" as number
// ...but the two-step through unknown always "works". That's the point of
// making it ugly: it should look like the crime it is.

// EXPLAIN IT — your team's rule for `as`: when is it acceptable? (Hint: the
// good answers involve narrowing FROM unknown at validated boundaries.)
/*

*/

// ═══ EXERCISE 7.10 ★★★ — narrowing by discriminant comparison & `in` ═══
// TASK: Replace each PREDICT.
// VOCAB: in-operator narrowing, property presence, tagged vs untagged unions

type Cat7 = { meow: () => string; legs: number }
type Fish7 = { swim: () => string; fins: number }

function pet7(animal: Cat7 | Fish7) {
  if ("meow" in animal) {
    type _1 = Expect<Equal<typeof animal, PREDICT>>
    return animal.meow()
  }
  type _2 = Expect<Equal<typeof animal, PREDICT>>
  return animal.swim()
}

// EXPLAIN IT — `in` narrowing works on UNTAGGED unions. Why is a proper
// discriminant property still the more robust design?
/*

*/

// ═══ EXERCISE 7.11 ★★★★ — narrowing survives aliasing (sometimes) ═══
// TASK: Replace each PREDICT.
// VOCAB: aliased condition, indirect narrowing, const-only analysis
// HINT 1: TS 4.4+ tracks `const ok = typeof x === "string"` and narrows when
//         you branch on `ok`. It does NOT track `let` conditions.

function alias7(x: string | number) {
  const isStr = typeof x === "string"
  if (isStr) {
    type _1 = Expect<Equal<typeof x, PREDICT>>
    return x.length
  }
  type _2 = Expect<Equal<typeof x, PREDICT>>
  return x
}

// EXPLAIN IT — why can the compiler only afford this for const bindings?
/*

*/

// ═══ EXERCISE 7.12 ★★★★★ — the unknown gauntlet: validate your way down ═══
// TASK: Implement hasKey — a reusable guard proving an unknown value is an
//       object carrying a given key. Then the chained narrowing below goes
//       green. No `as` allowed anywhere in your solution!
// VOCAB: unknown boundary, progressive narrowing, Record<K, unknown>, type predicate
// HINT 1: Signature: <K extends string>(o: unknown, k: K): o is Record<K, unknown>
// HINT 2: Body: typeof o === "object" && o !== null && k in o

function hasKey7(o: unknown, k: string): boolean {
  return TODO7_12 // ← your solution (fix the SIGNATURE too — see hints)
}
declare const TODO7_12: never

function getUserName7(payload: unknown): string {
  if (hasKey7(payload, "user") && hasKey7(payload.user, "name")) {
    const name = payload.user.name
    type _1 = Expect<Equal<typeof name, unknown>>
    if (typeof name === "string") return name
  }
  return "anonymous"
}

// EXPLAIN IT — this is how validated boundaries work without a library.
// Explain why `payload.user` is even LEGAL to write inside the if:
/*

*/

// ── chapter self-check ──────────────────────────────────────────────────────
// Zero squiggles in this file (with every @ts-expect-error still earning its
// keep) = chapter complete. Now write your EXPLAIN IT blocks and read them
// aloud. Then rerun your favorite three exercises from memory in a scratch
// file — if you can rebuild them without looking, they're yours.
export {}
