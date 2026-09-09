// ════════════════════════════════════════════════════════════════════════════
// CHAPTER 09 — keyof, MAPPED TYPES & REBUILDING THE UTILITIES  (editor-checked)
// ════════════════════════════════════════════════════════════════════════════
// In this chapter you reimplement the standard utility types from scratch.
// After this, `Partial` is not a magic word — it's three tokens you could
// type blindfolded. RULE: don't use the built-in you're currently rebuilding.

type Expect<T extends true> = T
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false
type PREDICT = { "← replace me with your prediction": true }

// ═══ EXERCISE 9.1 ★★ — keyof and typeof: reading types off values ═══
// TASK: Replace each PREDICT.
// VOCAB: keyof operator, typeof (type position), index signature keys,
//        keyof over intersections vs unions
// HINT 1: keyof of a string index signature is string | number (arr[0] and
//         arr["0"] are the same access).
// HINT 2: keyof (A & B) = keyof A | keyof B, but keyof (A | B) = only the
//         keys BOTH have. Think about why each must be true.
// DOCS: https://www.typescriptlang.org/docs/handbook/2/keyof-types.html

const palette9 = { red: "#f00", green: "#0f0" }
type _9_1a = Expect<Equal<typeof palette9, PREDICT>>
type _9_1b = Expect<Equal<keyof typeof palette9, PREDICT>>
type Dict9 = { [k: string]: number }
type _9_1c = Expect<Equal<keyof Dict9, PREDICT>>
type _9_1d = Expect<Equal<keyof ({ a: 1 } & { b: 2 }), PREDICT>>
type _9_1e = Expect<Equal<keyof ({ a: 1; shared: 0 } | { b: 2; shared: 0 }), PREDICT>>

// EXPLAIN IT (2–4 sentences, use the vocab, say it out loud):
/*

*/

// ═══ EXERCISE 9.2 ★★ — indexed access types: T[K] ═══
// TASK: Replace each PREDICT.
// VOCAB: indexed access type, T[number] for arrays, union index distribution
// DOCS: https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html

type User9 = { id: number; tags: string[]; address: { city: string } }
type _9_2a = Expect<Equal<User9["id"], PREDICT>>
type _9_2b = Expect<Equal<User9["id" | "tags"], PREDICT>>
type _9_2c = Expect<Equal<User9["tags"][number], PREDICT>>
type _9_2d = Expect<Equal<User9["address"]["city"], PREDICT>>
const rows9 = [{ ok: true, ms: 12 }, { ok: false, ms: 98 }]
type _9_2e = Expect<Equal<(typeof rows9)[number], PREDICT>>

// EXPLAIN IT — T[number] on an array type: what question are you asking?
/*

*/

// ═══ EXERCISE 9.3 ★★★ — rebuild Partial and Required ═══
// TASK: Implement MyPartial and MyRequired with mapped types + modifiers.
// VOCAB: homomorphic mapped type, +? / -? modifiers, modifier preservation
// HINT 1: { [K in keyof T]?: T[K] } — and note readonly survives untouched.
// DOCS: https://www.typescriptlang.org/docs/handbook/2/mapped-types.html

type MyPartial<T> = unknown // ← your solution
type MyRequired<T> = unknown // ← your solution

type Sample9 = { readonly id: number; name?: string; tags: string[] }
type _9_3a = Expect<Equal<MyPartial<Sample9>, { readonly id?: number; name?: string; tags?: string[] }>>
type _9_3b = Expect<Equal<MyRequired<Sample9>, { readonly id: number; name: string; tags: string[] }>>
type _9_3c = Expect<Equal<MyPartial<{}>, {}>>

// EXPLAIN IT — what makes a mapped type "homomorphic", and what carries over
// because of it?
/*

*/

// ═══ EXERCISE 9.4 ★★★ — rebuild Readonly, invent Mutable ═══
// TASK: Implement MyReadonly and MyMutable (strips readonly — the standard
//       library doesn't even ship this one).
// VOCAB: +readonly / -readonly modifiers

type MyReadonly<T> = unknown // ← your solution
type MyMutable<T> = unknown // ← your solution

type _9_4a = Expect<Equal<MyReadonly<{ x: number; y?: string }>, { readonly x: number; readonly y?: string }>>
type _9_4b = Expect<Equal<MyMutable<{ readonly a: 1; readonly b?: 2 }>, { a: 1; b?: 2 }>>

// EXPLAIN IT — why does readonly only protect the PROPERTY, not the value it
// points to (connect to ch. 6's shallow-freeze lesson):
/*

*/

// ═══ EXERCISE 9.5 ★★★ — rebuild Pick and Record ═══
// TASK: Implement both. MyPick must REJECT keys that don't exist (the two
//       expect-error lines below must stay errors).
// VOCAB: key subset constraint, K extends keyof T, PropertyKey

type MyPick<T, K> = unknown // ← your solution (constrain K!)
type MyRecord<K, V> = unknown // ← your solution (constrain K!)

type _9_5a = Expect<Equal<MyPick<Sample9, "id" | "name">, { readonly id: number; name?: string }>>
type _9_5b = Expect<Equal<MyRecord<"a" | "b", number>, { a: number; b: number }>>
// @ts-expect-error — "salary" is not a key of Sample9
type _9_5c = MyPick<Sample9, "salary">
// @ts-expect-error — an object can't be a key type
type _9_5d = MyRecord<{ bad: true }, number>

// EXPLAIN IT — MyPick is homomorphic too (via `K in keyof T`-shaped mapping).
// What did it preserve in _9_5a that a naive rebuild would lose?
/*

*/

// ═══ EXERCISE 9.6 ★★★★ — rebuild Exclude, Extract, Omit, NonNullable ═══
// TASK: Implement all four. Exclude/Extract need a conditional type that
//       DISTRIBUTES over the union (that's the default for a bare T).
// VOCAB: distributive conditional type, union filtering, composition
// HINT 1: MyExclude<T, U> = T extends U ? never : T — never members vanish
//         from unions.
// HINT 2: MyOmit = MyPick of the MyExcluded keys. Compose your own tools.

type MyExclude<T, U> = unknown // ← your solution
type MyExtract<T, U> = unknown // ← your solution
type MyOmit<T, K> = unknown // ← your solution
type MyNonNullable<T> = unknown // ← your solution

type _9_6a = Expect<Equal<MyExclude<"a" | "b" | "c", "a">, "b" | "c">>
type _9_6b = Expect<Equal<MyExtract<"a" | 1 | true, string | number>, "a" | 1>>
type _9_6c = Expect<Equal<MyOmit<Sample9, "id">, { name?: string; tags: string[] }>>
type _9_6d = Expect<Equal<MyNonNullable<string | null | undefined>, string>>
type _9_6e = Expect<Equal<MyExclude<string, "a">, string>>

// EXPLAIN IT — say the sentence "the conditional distributes over each member
// of the union, and never-members evaporate" — then explain it:
/*

*/

// ═══ EXERCISE 9.7 ★★★ — mapped types over plain unions ═══
// TASK: Implement Flags: every member of a string union becomes a boolean prop.
// VOCAB: non-homomorphic mapped type, union as key source

type Flags9<K extends string> = unknown // ← your solution

type _9_7 = Expect<Equal<Flags9<"darkMode" | "beta">, { darkMode: boolean; beta: boolean }>>

// EXPLAIN IT — how does this differ structurally from mapping `keyof T`?
/*

*/

// ═══ EXERCISE 9.8 ★★★★ — key remapping with `as`: Getters ═══
// TASK: Implement Getters: every property becomes getX(): T[K].
// VOCAB: key remapping, `as` clause, template literal key, Capitalize
// HINT 1: [K in keyof T as `get${Capitalize<K & string>}`]: () => T[K]
// DOCS: https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#key-remapping-via-as

type Getters9<T> = unknown // ← your solution

type _9_8 = Expect<Equal<
  Getters9<{ name: string; age: number }>,
  { getName: () => string; getAge: () => number }
>>

// EXPLAIN IT — why is the `K & string` intersection needed in the hint?
/*

*/

// ═══ EXERCISE 9.9 ★★★★ — filter properties by VALUE type ═══
// TASK: Implement PickByValue: keep only the properties whose value type is
//       assignable to V. Remapping to `never` deletes a key.
// VOCAB: conditional key remapping, key deletion via never

type PickByValue9<T, V> = unknown // ← your solution

type Mixed9 = { a: string; b: number; c: string; d: () => void }
type _9_9a = Expect<Equal<PickByValue9<Mixed9, string>, { a: string; c: string }>>
type _9_9b = Expect<Equal<PickByValue9<Mixed9, Function>, { d: () => void }>>

// EXPLAIN IT — this is how "give me all the event-handler props" types work in
// UI libraries. Describe the mechanism:
/*

*/

// ═══ EXERCISE 9.10 ★★★★ — modifier mechanics: predict precisely ═══
// TASK: Replace each PREDICT.
// VOCAB: optionality and undefined, -? strips both, homomorphy loss
// HINT 1: `a?: number` means the ACCESS type is number | undefined.
// HINT 2: Mapping over a literal key union (not keyof T) loses modifiers AND
//         bakes the undefined into the value.

type Opt9 = { a?: number }
type _9_10a = Expect<Equal<Opt9["a"], PREDICT>>
type Deopt9 = { [K in keyof Opt9]-?: Opt9[K] }
type _9_10b = Expect<Equal<Deopt9, PREDICT>>
type Hardcoded9 = { [K in "a"]: Opt9[K] }
type _9_10c = Expect<Equal<Hardcoded9, PREDICT>>

// EXPLAIN IT — "-? removes the undefined too." Where did that undefined come
// from, and why does removing optionality remove it?
/*

*/

// ═══ EXERCISE 9.11 ★★★★★ — DeepPartial: the recursive boss ═══
// TASK: Implement DeepPartial: every property optional at EVERY depth. Arrays
//       must pass through unchanged (don't make their elements undefined).
// VOCAB: recursive mapped type, structural recursion, base case
// HINT 1: Value rule: array → leave as-is; object → recurse; else leaf.

type DeepPartial9<T> = unknown // ← your solution

type State9 = {
  user: { name: string; prefs: { theme: string } }
  count: number
  tags: string[]
}
type _9_11 = Expect<Equal<
  DeepPartial9<State9>,
  {
    user?: { name?: string; prefs?: { theme?: string } }
    count?: number
    tags?: string[]
  }
>>

// EXPLAIN IT — recursive types need a base case just like recursive functions.
// Name yours. What happens without the array carve-out?
/*

*/

// ── chapter self-check ──────────────────────────────────────────────────────
// Zero squiggles = you just rebuilt the standard library's utility types.
// Final rep: close this file and write Partial, Pick, Omit, Exclude, Record
// on paper. Under 90 seconds. That's the ninja bar.
export {}
