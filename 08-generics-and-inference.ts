// ════════════════════════════════════════════════════════════════════════════
// CHAPTER 08 — GENERICS & HOW INFERENCE ACTUALLY DECIDES  (editor-checked)
// ════════════════════════════════════════════════════════════════════════════
// Same workflow as ch. 07: replace PREDICT sites, implement the marked
// functions, keep every @ts-expect-error earning its keep. Zero squiggles =
// done.

type Expect<T extends true> = T
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false
type PREDICT = { "← replace me with your prediction": true }

// ═══ EXERCISE 8.1 ★★ — what T becomes ═══
// TASK: Replace each PREDICT with the type the call produces.
// VOCAB: type argument inference, literal preservation, explicit instantiation
// HINT 1: Inference from a literal ARGUMENT keeps the literal type; writing
//         identity<number>(42) throws that precision away.
// DOCS: https://www.typescriptlang.org/docs/handbook/2/generics.html

function identity8<T>(x: T): T { return x }

const r8_1a = identity8(42)
type _8_1a = Expect<Equal<typeof r8_1a, PREDICT>>
const r8_1b = identity8<number>(42)
type _8_1b = Expect<Equal<typeof r8_1b, PREDICT>>
const r8_1c = identity8({ x: 1 })
type _8_1c = Expect<Equal<typeof r8_1c, PREDICT>>
const r8_1d = identity8("hi" as string)
type _8_1d = Expect<Equal<typeof r8_1d, PREDICT>>

// EXPLAIN IT (2–4 sentences, use the vocab, say it out loud):
/*

*/

// ═══ EXERCISE 8.2 ★★ — your first generic: firstOf ═══
// TASK: Implement firstOf so the assertions pass. No `any` allowed.
// VOCAB: generic function, element type, undefined for empty

function firstOf(arr: never[]): unknown { // ← your solution (fix the signature!)
  return arr[0]
}

const f8_2a = firstOf([1, 2, 3])
type _8_2a = Expect<Equal<typeof f8_2a, number | undefined>>
const f8_2b = firstOf(["a"])
type _8_2b = Expect<Equal<typeof f8_2b, string | undefined>>

// EXPLAIN IT — why is `T | undefined` the honest return type here, and what
// compiler flag would make even arr[0] admit that on its own?
/*

*/

// ═══ EXERCISE 8.3 ★★★ — constraints: extends is a promise ═══
// TASK: Implement longest: takes two values that both have .length, returns
//       the longer one. The error assertions below must KEEP erroring.
// VOCAB: generic constraint, `T extends`, constraint violation

function longest8(a: never, b: never): unknown {
  return TODO8_3 // ← your solution (signature AND body)
}
declare const TODO8_3: never

const l8a = longest8(["a", "b"] as string[], ["c"] as string[])
type _8_3a = Expect<Equal<typeof l8a, string[]>>
const l8b = longest8("abc" as string, "de" as string)
type _8_3b = Expect<Equal<typeof l8b, string>>
// @ts-expect-error — numbers have no .length; the constraint must reject them
longest8(10, 20)

// EXPLAIN IT — what does the constraint buy INSIDE the function body, and
// what does it enforce at every call site?
/*

*/

// ═══ EXERCISE 8.4 ★★★ — inference with multiple candidates ═══
// TASK: Replace PREDICT; then explain why the last line errors instead of
//       inferring a union.
// VOCAB: inference candidates, common supertype, covariant positions

declare function both8<T>(a: T, b: T): T
const b8a = both8(1, 2)
type _8_4a = Expect<Equal<typeof b8a, PREDICT>>
const b8b = both8({ x: 1 }, { x: 2 })
type _8_4b = Expect<Equal<typeof b8b, PREDICT>>
// @ts-expect-error — "a" wins the inference, then 1 fails to match it
both8("a", 1)

// EXPLAIN IT — inference collected TWO candidates for T each time. Describe
// the rule that decides (and when it just gives up and errors):
/*

*/

// ═══ EXERCISE 8.5 ★★★ — indexing generics: prop ═══
// TASK: Implement prop(obj, key) with a signature precise enough that the
//       return type is the exact property type — and bad keys are rejected.
// VOCAB: keyof constraint, indexed access type T[K], key inference

function prop8(obj: never, key: never): unknown {
  return TODO8_5 // ← your solution (signature AND body)
}
declare const TODO8_5: never

const user8 = { id: 1, name: "Ada", admin: true }
const p8a = prop8(user8, "name")
type _8_5a = Expect<Equal<typeof p8a, string>>
const p8b = prop8(user8, "admin")
type _8_5b = Expect<Equal<typeof p8b, boolean>>
// @ts-expect-error — key must exist on the object
prop8(user8, "salary")

// EXPLAIN IT — T[K] is an INDEXED ACCESS TYPE. Explain how K's constraint and
// T[K] cooperate here — this exact function is a top-3 interview question:
/*

*/

// ═══ EXERCISE 8.6 ★★★ — default type parameters ═══
// TASK: Give Box a default so both usages compile and the assertions pass.
// VOCAB: type parameter default, partial instantiation

type Box8<T> = { value: T } // ← your solution: add a sensible default for T

const boxed8: Box8<number> = { value: 1 }
const unspecified8: Box8 = { value: "anything" as unknown }
type _8_6a = Expect<Equal<Box8, { value: unknown }>>
type _8_6b = Expect<Equal<Box8<string>, { value: string }>>
void boxed8; void unspecified8

// EXPLAIN IT — when are defaults better than overloads or unions for APIs?
/*

*/

// ═══ EXERCISE 8.7 ★★★★ — const type parameters: inference without widening ═══
// TASK: Replace PREDICT for both. Note what the `const` modifier changes.
// VOCAB: const type parameter, literal inference, readonly tuple
// DOCS: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#const-type-parameters

declare function loose8<T extends readonly unknown[]>(...args: T): T
declare function tight8<const T extends readonly unknown[]>(...args: T): T

const lo8 = loose8(1, "a")
type _8_7a = Expect<Equal<typeof lo8, PREDICT>>
const ti8 = tight8(1, "a")
type _8_7b = Expect<Equal<typeof ti8, PREDICT>>

// EXPLAIN IT — before `const T`, API authors told users to write `as const`
// at every call site. Explain what moved where:
/*

*/

// ═══ EXERCISE 8.8 ★★★★ — contextual typing: types flowing INTO parameters ═══
// TASK: Replace each PREDICT.
// VOCAB: contextual typing, inference from expected type, implicit any

const nums8 = [1, 2, 3].map(n => n * 2)
type _8_8a = Expect<Equal<typeof nums8, PREDICT>>

const lens8 = ["a", "bb"].map(s => s.length)     // where does `s: string` come from?
type _8_8b = Expect<Equal<typeof lens8, PREDICT>>

type Handler8 = (e: { code: number; message: string }) => string
const onErr8: Handler8 = e => {
  type _8_8c = Expect<Equal<typeof e, PREDICT>>
  return e.message
}
void onErr8

// A bare arrow has NO context to draw from:
// @ts-expect-error — parameter x implicitly has an any type
const orphan8 = x => x.length
void orphan8

// EXPLAIN IT — "types flow in the opposite direction here." From where, to
// where? Why do callbacks almost never need annotations?
/*

*/

// ═══ EXERCISE 8.9 ★★★★ — overloads: many signatures, one body ═══
// TASK: Give combine two overload signatures: (string, string) => string and
//       (number[], number[]) => number[]. The implementation signature exists
//       already. The @ts-expect-error must survive.
// VOCAB: overload signatures, implementation signature, overload resolution
// DOCS: https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads

// ← your solution: two overload signatures right here, above the implementation
function combine8(a: string | number[], b: string | number[]): string | number[] {
  if (typeof a === "string" && typeof b === "string") return a + b
  return [...(a as number[]), ...(b as number[])]
}

const c8a = combine8("ab", "cd")
type _8_9a = Expect<Equal<typeof c8a, string>>
const c8b = combine8([1], [2, 3])
type _8_9b = Expect<Equal<typeof c8b, number[]>>
// @ts-expect-error — mixing the two shapes must be rejected
combine8("ab", [1])

// EXPLAIN IT — why does the implementation signature stay invisible to
// callers, and what's the modern alternative to most overloads (hint:
// generics + conditional types, or just unions)?
/*

*/

// ═══ EXERCISE 8.10 ★★★★ — implement map from scratch ═══
// TASK: Implement myMap with full inference: element type in, mapped type out,
//       index available.
// VOCAB: higher-order generic, callback parameter inference

function myMap8(arr: never, f: never): unknown[] {
  return TODO8_10 // ← your solution (signature AND body; no any)
}
declare const TODO8_10: never

const m8a = myMap8([1, 2, 3], (n, i) => n + i)
type _8_10a = Expect<Equal<typeof m8a, number[]>>
const m8b = myMap8(["a", "bb"], s => s.length)
type _8_10b = Expect<Equal<typeof m8b, number[]>>
const m8c = myMap8([1, 2], n => `#${n}`)
type _8_10c = Expect<Equal<typeof m8c, string[]>>

// EXPLAIN IT — trace the inference for m8b: what fixes T, and how does U get
// determined AFTER that?
/*

*/

// ═══ EXERCISE 8.11 ★★★★★ — pipe: inference chaining through functions ═══
// TASK: Implement pipe2 (compose left-to-right). All inference must flow —
//       note that `s` in the usage has NO annotation.
// VOCAB: function composition, inference across parameters, left-to-right flow

function pipe2_8(f: never, g: never): unknown {
  return TODO8_11 // ← your solution (signature AND body)
}
declare const TODO8_11: never

const fn8 = pipe2_8((n: number) => String(n), s => s.toUpperCase())
type _8_11a = Expect<Equal<typeof fn8, (a: number) => string>>
const fn8b = pipe2_8((s: string) => s.length, n => n > 3)
type _8_11b = Expect<Equal<typeof fn8b, (a: string) => boolean>>

// EXPLAIN IT — why does `s` get type string with zero annotations? Name the
// mechanism and its direction:
/*

*/

// ═══ EXERCISE 8.12 ★★★★★ — curry2: the inference boss fight ═══
// TASK: Implement curry2: turns (a, b) => r into a => b => r, fully typed.
// VOCAB: currying, partial application, nested generic inference

function curry2_8(f: never): unknown {
  return TODO8_12 // ← your solution (signature AND body)
}
declare const TODO8_12: never

const add8 = (a: number, b: number) => a + b
const curried8 = curry2_8(add8)
type _8_12a = Expect<Equal<typeof curried8, (a: number) => (b: number) => number>>
const greet8 = (name: string, excited: boolean) => excited ? `${name}!` : name
const curriedGreet8 = curry2_8(greet8)
type _8_12b = Expect<Equal<typeof curriedGreet8, (name: string) => (excited: boolean) => string>>

// EXPLAIN IT — you just typed a higher-order transformation. Describe the
// generic parameters you chose and what each one captures:
/*

*/

// ── chapter self-check ──────────────────────────────────────────────────────
// Zero squiggles + all @ts-expect-error lines still needed = done. Write and
// speak your EXPLAIN IT blocks. Bonus rep: reimplement myMap and curry2 in a
// scratch file from memory tomorrow.
export {}
