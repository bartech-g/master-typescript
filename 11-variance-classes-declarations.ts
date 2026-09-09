// ════════════════════════════════════════════════════════════════════════════
// CHAPTER 11 — VARIANCE, CLASSES & DECLARATIONS               (editor-checked)
// ════════════════════════════════════════════════════════════════════════════
// Variance is the chapter that separates "I use TypeScript" from "I understand
// TypeScript". Take it slow; the words matter: COVARIANT (same direction),
// CONTRAVARIANT (flipped), BIVARIANT (both — unsound), INVARIANT (neither).

type Expect<T extends true> = T
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false
type PREDICT = { "← replace me with your prediction": true }

type Animal11 = { name: string }
type Dog11 = { name: string; breed: string }
// Dog11 is a SUBTYPE of Animal11 (every Dog is an Animal). Keep that in mind
// for every question below.

// ═══ EXERCISE 11.1 ★★★ — return types are covariant ═══
// TASK: Replace each PREDICT (true or false).
// VOCAB: covariance, return position, substitutability
// HINT 1: A function that PROMISES a Dog also satisfies "promises an Animal".
// DOCS: https://www.typescriptlang.org/docs/handbook/2/functions.html#assignability-of-functions

type _11_1a = Expect<Equal<(() => Dog11) extends (() => Animal11) ? true : false, PREDICT>>
type _11_1b = Expect<Equal<(() => Animal11) extends (() => Dog11) ? true : false, PREDICT>>

// EXPLAIN IT (2–4 sentences, use the vocab, say it out loud):
/*

*/

// ═══ EXERCISE 11.2 ★★★★ — parameters are CONTRAvariant ═══
// TASK: Replace each PREDICT. If both feel backwards, you're about to level up.
// VOCAB: contravariance, parameter position, strictFunctionTypes
// HINT 1: Where can a Dog-handler be used? Only where dogs arrive. Where can
//         an Animal-handler be used? Anywhere animals OR dogs arrive — it
//         handles anything. The MORE GENERAL handler substitutes.

type _11_2a = Expect<Equal<((a: Animal11) => void) extends ((d: Dog11) => void) ? true : false, PREDICT>>
type _11_2b = Expect<Equal<((d: Dog11) => void) extends ((a: Animal11) => void) ? true : false, PREDICT>>

// EXPLAIN IT — write the sentence "parameter positions flip the direction of
// assignability" and then re-derive 11.2a from first principles:
/*

*/

// ═══ EXERCISE 11.3 ★★★★ — method syntax is secretly bivariant ═══
// TASK: Replace each PREDICT. Compare the two declaration styles carefully —
//       the ONLY difference is method syntax vs property-function syntax.
// VOCAB: method bivariance, strictFunctionTypes exemption, soundness hole
// DOCS: https://www.typescriptlang.org/tsconfig#strictFunctionTypes

type MethodStyle11 = { handle(d: Dog11): void }
type PropStyle11 = { handle: (d: Dog11) => void }

type _11_3a = Expect<Equal<{ handle(a: Animal11): void } extends MethodStyle11 ? true : false, PREDICT>>
type _11_3b = Expect<Equal<{ handle(d: Dog11): void } extends { handle(a: Animal11): void } ? true : false, PREDICT>>
type _11_3c = Expect<Equal<{ handle: (a: Animal11) => void } extends PropStyle11 ? true : false, PREDICT>>
type _11_3d = Expect<Equal<{ handle: (d: Dog11) => void } extends { handle: (a: Animal11) => void } ? true : false, PREDICT>>

// EXPLAIN IT — why did TS deliberately keep methods bivariant (hint: think
// Array.prototype.push and every DOM listener), and what do you personally
// lose each time you declare a callback as a METHOD?
/*

*/

// ═══ EXERCISE 11.4 ★★★★ — arrays: covariant and proud of being unsound ═══
// TASK: Replace each PREDICT, then read the crime scene below.
// VOCAB: array covariance, unsoundness, readonly arrays

type _11_4a = Expect<Equal<Dog11[] extends Animal11[] ? true : false, PREDICT>>
type _11_4b = Expect<Equal<Animal11[] extends Dog11[] ? true : false, PREDICT>>
type _11_4c = Expect<Equal<readonly Dog11[] extends readonly Animal11[] ? true : false, PREDICT>>

// The crime scene (all of this COMPILES — that's the point):
function smuggleCat11(animals: Animal11[]) {
  animals.push({ name: "Whiskers" })          // legal: it's an Animal[]
}
const dogs11: Dog11[] = [{ name: "Rex", breed: "lab" }]
smuggleCat11(dogs11)                           // legal: covariance
// dogs11[1].breed is now undefined at runtime. The type system lied.

// EXPLAIN IT — arrays are MUTABLE, so reading wants covariance but writing
// wants contravariance. What did TS choose and why? What does readonly T[]
// fix?
/*

*/

// ═══ EXERCISE 11.5 ★★★ — in/out annotations: declaring your variance ═══
// TASK: Replace the PREDICTs. Then note the pre-placed error: TS REJECTS a
//       variance annotation that contradicts usage.
// VOCAB: `out T` (covariant), `in T` (contravariant), variance annotation
// DOCS: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html#optional-variance-annotations-for-type-parameters

interface Producer11<out T> { get(): T }
interface Consumer11<in T> { accept(t: T): void }

type _11_5a = Expect<Equal<Producer11<Dog11> extends Producer11<Animal11> ? true : false, PREDICT>>
type _11_5b = Expect<Equal<Producer11<Animal11> extends Producer11<Dog11> ? true : false, PREDICT>>
type _11_5c = Expect<Equal<Consumer11<Animal11> extends Consumer11<Dog11> ? true : false, PREDICT>>

// @ts-expect-error — T is used in an INPUT position; `out` is a lie, TS checks
// (note the property syntax — with METHOD syntax bivariance would let it slide)
interface Broken11<out T> { accept: (t: T) => void }

// EXPLAIN IT — "producers are covariant, consumers are contravariant" — attach
// each half to an interface above and to a real API you use:
/*

*/

// ═══ EXERCISE 11.6 ★★★ — abstract classes: a contract plus shared machinery ═══
// TASK: Implement MemoryRepo11 (extend the abstract class; store items in a
//       Map). The expect-error must survive: abstract classes don't construct.
// VOCAB: abstract class, template method pattern, implements vs extends

abstract class Repo11 {
  abstract findById(id: string): string | undefined
  abstract save(id: string, item: string): void
  exists(id: string): boolean { return this.findById(id) !== undefined }
}

class MemoryRepo11 extends Repo11 {
  // ← your solution
}

const repo11 = new MemoryRepo11()
repo11.save("1", "hello")
const found11 = repo11.findById("1")
type _11_6a = Expect<Equal<typeof found11, string | undefined>>
const exists11 = repo11.exists("1")
type _11_6b = Expect<Equal<typeof exists11, boolean>>
// @ts-expect-error — cannot instantiate an abstract class
new Repo11()

// EXPLAIN IT — abstract class vs interface: name the two things an abstract
// class can do that an interface can't, and the cost it brings:
/*

*/

// ═══ EXERCISE 11.7 ★★★ — declaration merging ═══
// TASK: Replace the PREDICT. The two interface declarations below MERGE.
// VOCAB: declaration merging, interface reopening, module augmentation
// HINT 1: This is the mechanism behind `declare module "express" { ... }`
//         augmentations and window.myGlobal typings.
// DOCS: https://www.typescriptlang.org/docs/handbook/declaration-merging.html

interface Settings11 { theme: string }
interface Settings11 { fontSize: number }

type _11_7 = Expect<Equal<keyof Settings11, PREDICT>>

// Note: `type` aliases do NOT merge — a duplicate type alias name is an error.
// That asymmetry is the main reason library authors expose interfaces.

// EXPLAIN IT — describe how you'd add a property to Express's Request type in
// a real project (file, syntax, why it works):
/*

*/

// ═══ EXERCISE 11.8 ★★★ — the `as const` object: enum without the enum ═══
// TASK: Implement ValueOf, then derive Status11's value union from the object.
//       (Runtime enums generate real JS code and don't survive Node's
//       type-stripping — the const-object pattern is the modern default.)
// VOCAB: const assertion, ValueOf pattern, derived union, single source of truth

const Status11 = {
  Active: "active",
  Paused: "paused",
  Done: "done",
} as const

type ValueOf11<T> = unknown // ← your solution
type Status11 = unknown // ← your solution: derive "active" | "paused" | "done"
                        //   from Status11 via ValueOf11 (note: a type and a
                        //   value CAN share a name — they live in different
                        //   namespaces!)

type _11_8a = Expect<Equal<Status11, "active" | "paused" | "done">>
type _11_8b = Expect<Equal<ValueOf11<{ a: 1; b: "x" }>, 1 | "x">>

// EXPLAIN IT — list two problems with runtime enums that this pattern avoids,
// and one thing enums still do better:
/*

*/

// ═══ EXERCISE 11.9 ★★★★ — typing an untyped library (a .d.ts in miniature) ═══
// TASK: The declaration below is what `any`-driven development looks like.
//       Rewrite the SIGNATURE (generics + keyof) so the assertions pass.
//       This is exactly the job of writing a .d.ts file for an untyped module.
// VOCAB: ambient declaration, declare keyword, API surface typing

declare function groupBy11(items: any, key: any): any // ← your solution (fix this signature)

const people11 = [
  { name: "Ada", role: "eng" },
  { name: "Bo", role: "ops" },
]
const grouped11 = groupBy11(people11, "role")
type _11_9a = Expect<Equal<typeof grouped11, Record<string, { name: string; role: string }[]>>>
// @ts-expect-error — key must be a real key of the element type
groupBy11(people11, "salary")

// EXPLAIN IT — where do .d.ts files live in a real project, and what does
// `declare` promise the compiler?
/*

*/

// ═══ EXERCISE 11.10 ★★★ — what strict mode is actually made of ═══
// TASK: Replace the PREDICT. Every directive here must stay needed.
// VOCAB: strictNullChecks, useUnknownInCatchVariables, definite assignment

// strictNullChecks — null stopped being assignable to everything in 2016:
// @ts-expect-error
const s11: string = null

// useUnknownInCatchVariables — anything can be thrown, so e is:
try { /* ... */ } catch (e) {
  type _11_10a = Expect<Equal<typeof e, PREDICT>>
}

// definite assignment assertion — you promise it's assigned before use:
class Config11 {
  url!: string   // without the !, strictPropertyInitialization complains
  init() { this.url = "https://example.com" }
}
void new Config11()

// EXPLAIN IT — name four flags inside `"strict": true` and the bug class each
// one kills:
/*

*/

// ═══ EXERCISE 11.11 ★★★★ — fluent builders need `this` types ═══
// TASK: The builder chain below breaks at .limit() — where() returns the BASE
//       class. Fix BOTH return types using the polymorphic `this` type.
// VOCAB: polymorphic this type, fluent interface, F-bounded quantification

class Query11 {
  private clauses: string[] = []
  where(clause: string): Query11 { // ← your solution (return type!)
    this.clauses.push(clause)
    return this
  }
}
class PagedQuery11 extends Query11 {
  private max = 0
  limit(n: number): PagedQuery11 { // ← your solution (return type!)
    this.max = n
    return this
  }
}

const q11 = new PagedQuery11().where("age > 18").limit(10)
type _11_11 = Expect<Equal<typeof q11, PagedQuery11>>

// EXPLAIN IT — what does `this` (as a TYPE) mean inside a class, and why does
// it fix inheritance-breaking fluent APIs?
/*

*/

// ═══ EXERCISE 11.12 ★★★★★ — the variance gauntlet ═══
// TASK: Replace each PREDICT. Double negation ahead: a parameter INSIDE a
//       parameter flips the direction twice.
// VOCAB: higher-order functions, variance composition, positions all the way down

type TakesDogCb11 = (cb: (d: Dog11) => void) => void
type TakesAnimalCb11 = (cb: (a: Animal11) => void) => void

type _11_12a = Expect<Equal<TakesDogCb11 extends TakesAnimalCb11 ? true : false, PREDICT>>
type _11_12b = Expect<Equal<TakesAnimalCb11 extends TakesDogCb11 ? true : false, PREDICT>>
type _11_12c = Expect<Equal<((x: Dog11) => Dog11) extends ((x: Dog11) => Animal11) ? true : false, PREDICT>>
type _11_12d = Expect<Equal<((x: Animal11) => Dog11) extends ((x: Dog11) => Animal11) ? true : false, PREDICT>>

// EXPLAIN IT — state the composition rule (even flips = covariant, odd flips =
// contravariant), then walk 11.12a out loud:
/*

*/

// ── chapter self-check ──────────────────────────────────────────────────────
// Zero squiggles = you can say "contravariant position" in an interview and
// mean it. That phrase alone is worth the chapter.
export {}
