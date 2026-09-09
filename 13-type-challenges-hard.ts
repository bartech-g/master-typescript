// ════════════════════════════════════════════════════════════════════════════
// CHAPTER 13 — THE HARD TIER ☠                                (editor-checked)
// ════════════════════════════════════════════════════════════════════════════
// These are the famous ones — the types people frame on the wall. Hours per
// exercise is NORMAL here. The rules tighten:
//   • use hints only after a real attempt (30+ min)
//   • when you crack one, the EXPLAIN IT must be good enough that
//     three-months-from-now-you could rebuild it from your words alone
// Everything you need was taught in ch. 07–12. Nothing here is magic —
// it's composition.

type Expect<T extends true> = T
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false

// ═══ EXERCISE 13.1 ☠ — UnionToIntersection ═══
// TASK: A | B in, A & B out. The single most famous trick in the type system.
// VOCAB: contravariant inference position, union distribution, intersection inference
// HINT 1: Put U in a distributive conditional so each member becomes a
//         FUNCTION PARAMETER type: (x: U) => void, per member.
// HINT 2: Then infer the parameter back from the WHOLE union of functions.
//         Multiple candidates in a CONTRAVARIANT position get INTERSECTED —
//         that's the ch. 11 lesson doing real work.

type UnionToIntersection13<U> = unknown // ← your solution

type _13_1a = Expect<Equal<UnionToIntersection13<{ a: 1 } | { b: 2 }>, { a: 1 } & { b: 2 }>>
type _13_1b = Expect<Equal<UnionToIntersection13<{ x: 1 }>, { x: 1 }>>
type _13_1c = Expect<Equal<UnionToIntersection13<"a" | "b">, never>>  // strings can't intersect

// EXPLAIN IT — why does contravariance turn a union into an intersection?
// (If you can say this out loud fluently, you've crossed a line most never do.)
/*

*/

// ═══ EXERCISE 13.2 ☠ — LastOfUnion ═══
// TASK: Extract the last member of a union (in the compiler's internal order).
// VOCAB: overload resolution trick, function intersection = overloads
// HINT 1: Turn each member into () => U, intersect them all (13.1!) — an
//         intersection of functions is an OVERLOAD SET, and inference from an
//         overload set picks the LAST signature.

type LastOf13<U> = unknown // ← your solution

type _13_2a = Expect<Equal<LastOf13<1 | 2 | 3>, 3>>
type _13_2b = Expect<Equal<LastOf13<"only">, "only">>

// EXPLAIN IT — note the honesty clause: union member order is a compiler
// internal. Why is depending on it fine HERE but a bug in production code?
/*

*/

// ═══ EXERCISE 13.3 ☠ — UnionToTuple ═══
// TASK: 1 | 2 | 3 → [1, 2, 3]. Compose 13.2 with recursion.
// VOCAB: peel-and-recurse, Exclude as tail-maker, never as base case
// HINT 1: [U] extends [never] ? [] : [...recurse on Exclude<U, Last>, Last]

type UnionToTuple13<U> = unknown // ← your solution

type _13_3a = Expect<Equal<UnionToTuple13<1 | 2 | 3>, [1, 2, 3]>>
type _13_3b = Expect<Equal<UnionToTuple13<"a">, ["a"]>>
type _13_3c = Expect<Equal<UnionToTuple13<never>, []>>

// EXPLAIN IT — walk the recursion for 1 | 2 | 3, naming what each of your
// building blocks contributes:
/*

*/

// ═══ EXERCISE 13.4 ☠ — IsUnion ═══
// TASK: true iff T is a union of 2+ members. Deceptively short, brutally deep.
// VOCAB: distribution as a probe, the copy parameter trick
// HINT 1: Keep an undistributed COPY: IsUnion<T, C = T>. Distribute over T;
//         inside, compare the single member against the full copy C.
// HINT 2: [C] extends [T] — inside distribution, T is ONE member. If the whole
//         copy still fits in one member, there was never a union.

type IsUnion13<T> = unknown // ← your solution (you may add defaulted params)

type _13_4a = Expect<Equal<IsUnion13<"a" | "b">, true>>
type _13_4b = Expect<Equal<IsUnion13<string>, false>>
type _13_4c = Expect<Equal<IsUnion13<never>, false>>
type _13_4d = Expect<Equal<IsUnion13<boolean>, true>>   // ...remember ch. 10

// EXPLAIN IT — "distribution destroys the union; the copy remembers it."
// Expand that into a real explanation:
/*

*/

// ═══ EXERCISE 13.5 ☠ — Permutation ═══
// TASK: "a" | "b" → ["a","b"] | ["b","a"] — all orderings, as a union of tuples.
// VOCAB: distributive fan-out, pick-one-recurse-on-rest
// HINT 1: K extends K forces distribution; for each choice K, prepend it to
//         every permutation of Exclude<T, K>.

type Permutation13<T> = unknown // ← your solution (you may add defaulted params)

type _13_5a = Expect<Equal<Permutation13<"a" | "b">, ["a", "b"] | ["b", "a"]>>
type _13_5b = Expect<Equal<
  Permutation13<1 | 2 | 3>,
  [1, 2, 3] | [1, 3, 2] | [2, 1, 3] | [2, 3, 1] | [3, 1, 2] | [3, 2, 1]
>>
type _13_5c = Expect<Equal<Permutation13<never>, []>>

// EXPLAIN IT — this is the type-level version of the classic recursive
// permutation algorithm. Map each part of your type onto the algorithm:
/*

*/

// ═══ EXERCISE 13.6 ☠ — StringToNumber ═══
// TASK: "42" → 42 (the number literal type).
// VOCAB: infer ... extends, coercive inference (TS 4.8+)
// HINT 1: One line. `${infer N extends number}` does the parsing for you.
//         (The pre-4.8 way was building tuples until `${Acc["length"]}`
//         matched — feel free to do both.)

type StringToNumber13<S extends string> = unknown // ← your solution

type _13_6a = Expect<Equal<StringToNumber13<"42">, 42>>
type _13_6b = Expect<Equal<StringToNumber13<"0">, 0>>
type _13_6c = Expect<Equal<StringToNumber13<"abc">, never>>

// EXPLAIN IT — what does `infer N extends number` ask the compiler to attempt,
// and what happens when the attempt fails?
/*

*/

// ═══ EXERCISE 13.7 ☠ — Chainable options ═══
// TASK: Type a config builder: .option(key, value) accumulates knowledge,
//       .get() returns the accumulated object type. (type-challenges #12)
// VOCAB: recursive generic interface, accumulator type parameter, Omit-refresh
// HINT 1: Chainable13<T = {}> with option returning
//         Chainable13<Omit<T, K> & Record<K, V>> (Omit lets a later .option
//         overwrite an earlier key's type).

type Chainable13<T = {}> = unknown // ← your solution (an object type with option & get)

declare const cfg13: Chainable13
const built13 = cfg13.option("name", "ts").option("level", 5).option("name", "TS!").get()
type _13_7 = Expect<Equal<typeof built13, { level: number; name: string }>>

// EXPLAIN IT — where does the accumulated type LIVE between calls? (There's no
// value carrying it — only return types.)
/*

*/

// ═══ EXERCISE 13.8 ☠ — Currying ═══
// TASK: Type curry(): (a, b, c) => r becomes a => b => c => r, for ANY arity.
// VOCAB: variadic tuple pattern, recursive function type, arity peeling
// HINT 1: [infer A, ...infer Rest] peels one parameter; recurse on
//         (...args: Rest) => Ret until Rest is [].

type Curried13<F> = unknown // ← your solution
declare function curry13<F extends (...args: any[]) => any>(f: F): Curried13<F>

declare function volume13(l: number, w: number, h: number): number
const curried13 = curry13(volume13)
type _13_8a = Expect<Equal<typeof curried13, (l: number) => (w: number) => (h: number) => number>>
declare function pair13(a: string, b: boolean): string
type _13_8b = Expect<Equal<Curried13<typeof pair13>, (a: string) => (b: boolean) => string>>

// EXPLAIN IT — describe the peeling recursion and its base case; then, for
// style points: why do the parameter NAMES not matter to Equal?
/*

*/

// ═══ EXERCISE 13.9 ☠ — DeepReadonly ═══
// TASK: readonly all the way down — but leave functions alone.
// VOCAB: recursive mapped type, function carve-out, structural recursion

type DeepReadonly13<T> = unknown // ← your solution

type _13_9 = Expect<Equal<
  DeepReadonly13<{ a: { b: number; cb: () => void }; c: string }>,
  { readonly a: { readonly b: number; readonly cb: () => void }; readonly c: string }
>>

// EXPLAIN IT — why must functions be carved out BEFORE the object branch?
// (What is a function, structurally?)
/*

*/

// ═══ EXERCISE 13.10 ☠ — Subtract: tuple arithmetic, part 2 ═══
// TASK: Subtract<10, 3> = 7 via tuple pattern matching. Subtract<3, 5> = never.
// VOCAB: unary arithmetic, tuple prefix pattern, structural subtraction
// HINT 1: BuildTuple<A> extends [...BuildTuple<B>, ...infer Rest] — if B's
//         tuple is a PREFIX of A's, what's left is the answer.

type BuildTuple13<N extends number, Acc extends unknown[] = []> =
  Acc["length"] extends N ? Acc : BuildTuple13<N, [...Acc, unknown]>

type Subtract13<A extends number, B extends number> = unknown // ← your solution

type _13_10a = Expect<Equal<Subtract13<10, 3>, 7>>
type _13_10b = Expect<Equal<Subtract13<5, 5>, 0>>
type _13_10c = Expect<Equal<Subtract13<3, 5>, never>>

// EXPLAIN IT — negative numbers are unrepresentable here. Connect that to
// WHAT a tuple length is, and why this whole approach caps out around 1000:
/*

*/

// ═══ EXERCISE 13.11 ☠☠ — SELECT columns FROM row (a typed query) ═══
// TASK: Select13<"id, name", Row> → { id: number; name: string }.
//       Parse the column string (spaces allowed!), then project the row type.
//       Build helpers: Trim13, then Cols13 (comma-split into a union), then
//       the final projection.
// VOCAB: type-level tokenizer, string trimming, projection via mapped type

type Trim13<S extends string> = unknown // ← your solution
type Cols13<S extends string> = unknown // ← your solution
type Select13<C extends string, T> = unknown // ← your solution

type Row13 = { id: number; name: string; email: string; age: number }
type _13_11a = Expect<Equal<Select13<"id, name", Row13>, { id: number; name: string }>>
type _13_11b = Expect<Equal<Select13<"email", Row13>, { email: string }>>
type _13_11c = Expect<Equal<Select13<"  age  ,name", Row13>, { age: number; name: string }>>

// EXPLAIN IT — you wrote a tokenizer, a parser, and a projection. In the type
// system. Explain the pipeline, then reflect: what does this imply about what
// types ARE in TypeScript (see you in chapter 14):
/*

*/

// ── chapter self-check ──────────────────────────────────────────────────────
// Zero squiggles here puts you — measurably, not motivationally — in the top
// percentile of TypeScript users. One chapter left: the edge of the map.
export {}
