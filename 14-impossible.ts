// ════════════════════════════════════════════════════════════════════════════
// CHAPTER 14 — THE IMPOSSIBLE TIER ∞                          (editor-checked)
// ════════════════════════════════════════════════════════════════════════════
// Every exercise here brushes against something TypeScript CANNOT do. The
// deliverable is different now: half the points are for the workaround (which
// you implement, and which self-checks like always), and half are for the
// EXPLAIN IT — because knowing exactly WHERE the wall is, and saying it
// precisely, is what makes people trust you with architecture. An engineer
// who knows the limits of their tools has no reason for impostor syndrome.

type Expect<T extends true> = T
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false
type PREDICT = { "← replace me with your prediction": true }

// ═══ EXERCISE 14.1 ∞ — exact types don't exist ═══
// THE IMPOSSIBLE: a type that means "{ x: number; y: number } and NOTHING
// else". TS types are OPEN — every object with extra properties still
// satisfies the shape (ch. 7.2 showed excess checks only catch fresh
// literals). There is no `Exact<T>` in the language, by design.
// TASK: Build the standard workaround — a generic that rejects extra keys at
//       the call site. Both expect-errors must survive; the good call must not.
// VOCAB: open vs closed types, width subtyping, Exact-pattern
// HINT 1: Exact14<T, Shape> = T extends Shape
//         ? (Exclude<keyof T, keyof Shape> extends never ? T : never) : never

type Exact14<T, Shape> = unknown // ← your solution

declare function plot14<T>(p: Exact14<T, { x: number; y: number }>): void

plot14({ x: 1, y: 2 })                    // ✅ must stay green
const spy14 = { x: 1, y: 2, z: 3 }
// @ts-expect-error — even a non-fresh object with extra keys is rejected
plot14(spy14)
// @ts-expect-error — fresh literals too, of course
plot14({ x: 1, y: 2, z: 3 })

// EXPLAIN IT — why does structural typing REQUIRE openness (think: passing a
// Dog where an Animal is wanted), and what does your workaround trade away
// (hint: T is now inferred per call — try storing plot14 in a variable of a
// concrete function type):
/*

*/

// ═══ EXERCISE 14.2 ∞ — higher-kinded types ═══
// THE IMPOSSIBLE: `type Mapped<F, T> = F<T>` — using a type parameter AS a
// type constructor. Try typing it: the compiler stops you at the syntax
// level. TS has no type-level functions as values (no HKTs).
// TASK: Build the standard ENCODING instead (defunctionalization): an HKT
//       interface whose `result` is computed from `this["arg"]`, applied by
//       intersection.
// VOCAB: higher-kinded type, defunctionalization, polymorphic this-type trick
// HINT 1: interface ArrayK14 extends HKT14 { result: this["arg"][] }
// HINT 2: Apply14<F, T> = (F & { readonly arg: T })["result"]

interface HKT14 { readonly arg: unknown; readonly result: unknown }
interface ArrayK14 extends HKT14 { result: unknown } // ← your solution (result)
interface PromiseK14 extends HKT14 { result: unknown } // ← your solution (result)
type Apply14<F extends HKT14, T> = unknown // ← your solution

type _14_2a = Expect<Equal<Apply14<ArrayK14, number>, number[]>>
type _14_2b = Expect<Equal<Apply14<PromiseK14, string>, Promise<string>>>
type _14_2c = Expect<Equal<Apply14<ArrayK14, Apply14<PromiseK14, boolean>>, Promise<boolean>[]>>

// EXPLAIN IT — what would real HKTs buy (a single Functor interface for
// Array/Promise/Option...), why doesn't TS have them, and what does the
// encoding cost in ergonomics?
/*

*/

// ═══ EXERCISE 14.3 ∞ — negated types ═══
// THE IMPOSSIBLE: `type NotString = not string` — the complement of a type.
// Doesn't exist: TS's universe of types is open-ended, so "everything except
// string" isn't a constructible set.
// TASK: Implement the two partial substitutes: a union FILTER (works on
//       unions you already have) and a parameter-level BLOCK (works per call).
// VOCAB: complement type, closed-world assumption, filter vs constrain

type ExcludeString14<T> = unknown // ← your solution (filter string out of a union)
declare function noStrings14<T>(x: T & (T extends string ? never : unknown)): T // given: the block pattern

type _14_3a = Expect<Equal<ExcludeString14<string | number | boolean>, number | boolean>>
type _14_3b = Expect<Equal<ExcludeString14<"a" | 1>, 1>>
noStrings14(42)              // ✅
noStrings14({ ok: true })    // ✅
// @ts-expect-error — strings blocked at this call site
noStrings14("nope")

// EXPLAIN IT — why can these two only APPROXIMATE `not string`? Construct a
// case each one cannot handle:
/*

*/

// ═══ EXERCISE 14.4 ∞ — the recursion wall ═══
// THE IMPOSSIBLE: unbounded type-level computation. The compiler enforces an
// instantiation-depth budget (~1000 for tail-recursive aliases, ~50 for
// non-tail) — and it is not negotiable, because type checking must terminate.
// TASK: Replace the PREDICTs; witness the wall (the expect-error is the wall).
// VOCAB: instantiation depth, tail-recursion elimination, termination guarantee

type BuildTuple14<N extends number, Acc extends unknown[] = []> =
  Acc["length"] extends N ? Acc : BuildTuple14<N, [...Acc, unknown]>

type _14_4a = Expect<Equal<BuildTuple14<999>["length"], PREDICT>>
// @ts-expect-error — type instantiation is excessively deep
type TooDeep14 = BuildTuple14<10000>
type _14_4b = Expect<Equal<[...BuildTuple14<500>, ...BuildTuple14<500>]["length"], PREDICT>>
// (composing two legal towers can pass 1000 — the budget is per-instantiation,
// which is why type-challenges arithmetic uses DIGIT-WISE algorithms to
// multiply big numbers without deep recursion)

// EXPLAIN IT — why MUST the compiler cap this? Connect to 14.7. Then: what's
// the digit-wise idea that lets libraries do Add<123456789, 1> anyway?
/*

*/

// ═══ EXERCISE 14.5 ∞ — Equal's dark magic (this file's own foundation) ═══
// THE IMPOSSIBLE-ISH: a correct Equal<X, Y> written the "obvious" way. The
// naive mutual-extends version fails on any, unions, and never.
// TASK: Replace the PREDICTs for the naive version's failures, then explain
//       why the real Equal works.
// VOCAB: mutual assignability vs identity, deferred conditional, variance probe

type NaiveEqual14<X, Y> = X extends Y ? (Y extends X ? true : false) : false

type _14_5a = Expect<Equal<NaiveEqual14<any, 1>, PREDICT>>       // any poisons both branches
type _14_5b = Expect<Equal<NaiveEqual14<1 | 2, 1 | 2>, PREDICT>> // distribution shreds it
type _14_5c = Expect<Equal<NaiveEqual14<never, 1>, PREDICT>>     // the empty union vanishes

// The real one compares two GENERIC FUNCTION SIGNATURES:
//   (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2)
// Assignability of those forces the compiler to ask: are the conditional
// types IDENTICAL for every possible T? — which routes through the internal
// isTypeIdenticalTo relation instead of plain assignability.
type _14_5d = Expect<Equal<Equal<any, unknown>, false>>
type _14_5e = Expect<Equal<Equal<string & {}, string>, false>>
type _14_5f = Expect<Equal<string & {} extends string ? true : false, true>>
type _14_5g = Expect<Equal<string extends string & {} ? true : false, true>>
// ...5e-g together: two types can be MUTUALLY ASSIGNABLE yet not IDENTICAL.
// "Equal" itself is a choice of equivalence relation. Let that sink in.

// EXPLAIN IT — in your own words: what question does Equal ask that mutual
// extends doesn't? Why do 5e-g not contradict each other?
/*

*/

// ═══ EXERCISE 14.6 ∞ — nominal typing (without cheating) ═══
// THE IMPOSSIBLE: making `type Meters = number` and `type Seconds = number`
// different types. Aliases don't create types — they NAME existing ones.
// TASK: Replace the PREDICT (feel the pain), then fix speed14 with brands
//       (ch. 12.1 was the workaround all along).
// VOCAB: type alias transparency, nominal vs structural, brand as escape hatch

type Meters14 = number
type Seconds14 = number
type _14_6a = Expect<Equal<Equal<Meters14, Seconds14>, PREDICT>>

type BrandedMeters14 = unknown // ← your solution (brand number as "m")
type BrandedSeconds14 = unknown // ← your solution (brand number as "s")
declare function speed14(m: BrandedMeters14, s: BrandedSeconds14): number
declare const distance14: BrandedMeters14
declare const elapsed14: BrandedSeconds14

speed14(distance14, elapsed14)          // ✅
// @ts-expect-error — swapped units must not compile (this is how Mars
// Climate Orbiter–class bugs become type errors)
speed14(elapsed14, distance14)

// EXPLAIN IT — why does the language make aliases transparent (generics,
// readability), and what do brands cost at runtime (trick question)?
/*

*/

// ═══ EXERCISE 14.7 ∞ — the halting problem, in your editor ═══
// THE IMPOSSIBLE: `type Terminates<T> = ...` — a type that decides whether
// evaluating another type finishes. The type system is Turing-complete
// (ch. 13.11 was a parser; people have built SQL engines and chess in it),
// so this is the actual halting problem — mathematically unsolvable, not
// "not yet implemented".
// TASK: Witness the guardrails (both directives must stay needed), then write
//       the EXPLAIN IT — it's the whole exercise.
// VOCAB: Turing completeness, halting problem, decidability, guardrails

// @ts-expect-error — the compiler refuses even the simplest non-terminator
type Loop14 = Loop14

type Ping14<N extends number> = BuildTuple14<N> extends [...infer R, unknown] ? R["length"] : 0
// (fine — this one terminates; the compiler cannot KNOW that in general,
// so it uses depth budgets (14.4) instead of trying to solve the unsolvable)
type _14_7 = Expect<Equal<Ping14<3>, 2>>

// EXPLAIN IT — write the reduction out loud: if Terminates<T> existed, you
// could build the classic self-contradicting type. Sketch the argument (this
// is THE canonical "impossible", and being able to explain it calmly is the
// most senior sentence in this whole course):
/*

*/

// ═══ EXERCISE 14.8 ∞ — types don't survive to runtime ═══
// THE IMPOSSIBLE: `function keysOf<T>(): (keyof T)[]` that RETURNS the keys.
// Types are ERASED — at runtime there is no T to inspect. Nothing to return.
// TASK: The honest signature below is a lie that cannot be implemented —
//       explain why, then recall which chapter already showed the inversion
//       that solves it for real (value first, type derived).
// VOCAB: type erasure, reflection, runtime representation, schema inversion

function keysOf14<T>(): Array<keyof T> {
  // There is no implementation. T does not exist here. This returns [] not
  // because we're lazy but because the language leaves NOTHING else:
  return []
}
const noKeys14 = keysOf14<{ a: 1; b: 2 }>()
type _14_8 = Expect<Equal<typeof noKeys14, ("a" | "b")[]>>  // the TYPE is right...
// ...and the VALUE is []. A perfectly-typed lie. (Run it mentally.)

// EXPLAIN IT — why did TS choose erasure (interop! bundle size! the
// "types are just documentation" contract), and how does the mini-Zod pattern
// from 12.7 give you runtime + compile-time from ONE declaration?
/*

*/

// ═══ EXERCISE 14.9 ∞ — graduation: the boundaries, in your own words ═══
// TASK: No code. Write (and say aloud) a crisp paragraph for each boundary
//       below — these are the exact questions that distinguish "senior" in
//       system-design conversations about TypeScript:
//
//   1. Soundness: TS is deliberately unsound (any, assertions, array
//      covariance, method bivariance). Why was that the right call for
//      adoption, and where do you personally draw the line in a codebase?
//
//   2. Erasure: what TS can never check at runtime, and the schema-first
//      inversion that closes the gap.
//
//   3. Decidability: why depth limits exist, and what "the type system is
//      Turing-complete" does and does NOT imply for your day job.
//
//   4. Structural identity: open types, no exactness, no negation, no
//      nominal aliases — and the brand/Exact/validator workarounds that
//      recover each, at a cost.
/*

1.

2.

3.

4.

*/

// ── graduation ──────────────────────────────────────────────────────────────
// If this file is green and your four paragraphs above read clean when spoken:
// you know the language, you know the type system, and — rarer — you know its
// edges. That's not impostor syndrome territory. That's the ninja rank you
// signed up for in chapter 00. Go build something.
export {}
