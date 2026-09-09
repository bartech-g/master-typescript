// ════════════════════════════════════════════════════════════════════════════
// CHAPTER 10 — CONDITIONAL TYPES, infer & TEMPLATE LITERALS   (editor-checked)
// ════════════════════════════════════════════════════════════════════════════
// This is where the type system becomes a programming language: conditionals
// (extends ? :), pattern matching (infer), recursion, and string manipulation
// — all evaluated by the compiler.

type Expect<T extends true> = T
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false
type PREDICT = { "← replace me with your prediction": true }

// ═══ EXERCISE 10.1 ★★ — extends is a question, ?: is the answer ═══
// TASK: Replace each PREDICT.
// VOCAB: conditional type, assignability question, extends
// DOCS: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html

type IsString10<T> = T extends string ? true : false
type _10_1a = Expect<Equal<IsString10<"hello">, PREDICT>>
type _10_1b = Expect<Equal<IsString10<string>, PREDICT>>
type _10_1c = Expect<Equal<IsString10<1>, PREDICT>>
type _10_1d = Expect<Equal<"a" extends string ? "yes" : "no", PREDICT>>
type _10_1e = Expect<Equal<string extends "a" ? "yes" : "no", PREDICT>>

// EXPLAIN IT (2–4 sentences, use the vocab, say it out loud):
/*

*/

// ═══ EXERCISE 10.2 ★★★ — infer: pattern matching for types ═══
// TASK: Implement MyReturnType and MyParameters using infer. Don't use the
//       built-ins.
// VOCAB: infer, inference position, pattern matching on function types
// HINT 1: T extends (...args: infer A) => infer R — A and R are captured.
// DOCS: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types

type MyReturnType10<T> = unknown // ← your solution
type MyParameters10<T> = unknown // ← your solution

declare function sample10(a: number, b: string): boolean
type _10_2a = Expect<Equal<MyReturnType10<typeof sample10>, boolean>>
type _10_2b = Expect<Equal<MyParameters10<typeof sample10>, [a: number, b: string]>>
type _10_2c = Expect<Equal<MyReturnType10<() => void>, void>>
type _10_2d = Expect<Equal<MyParameters10<() => void>, []>>

// EXPLAIN IT — infer declares a type variable INSIDE a pattern. Compare it to
// destructuring in value-land:
/*

*/

// ═══ EXERCISE 10.3 ★★★ — infer anywhere: elements, promises, recursion ═══
// TASK: Implement ElementType (array element) and UnwrapPromise (recursively
//       unwrap nested promises).
// VOCAB: recursive conditional type, base case, structural pattern

type ElementType10<T> = unknown // ← your solution
type UnwrapPromise10<T> = unknown // ← your solution

type _10_3a = Expect<Equal<ElementType10<string[]>, string>>
type _10_3b = Expect<Equal<ElementType10<Array<{ x: 1 }>>, { x: 1 }>>
type _10_3c = Expect<Equal<UnwrapPromise10<Promise<number>>, number>>
type _10_3d = Expect<Equal<UnwrapPromise10<Promise<Promise<string>>>, string>>
type _10_3e = Expect<Equal<UnwrapPromise10<number>, number>>

// EXPLAIN IT — point at your base case and your recursive case, like you
// would for a recursive function:
/*

*/

// ═══ EXERCISE 10.4 ★★★★ — distributivity: the automatic map over unions ═══
// TASK: Replace each PREDICT. The last two are the famous gotchas.
// VOCAB: distributive conditional type, naked type parameter, per-member evaluation
// HINT 1: A BARE (naked) T left of `extends` makes the conditional run once
//         per union member, then unions the results.
// HINT 2: never is the empty union → zero iterations → never.
// DOCS: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types

type ToArray10<T> = T extends any ? T[] : never
type _10_4a = Expect<Equal<ToArray10<string | number>, PREDICT>>
type _10_4b = Expect<Equal<ToArray10<string>, PREDICT>>

type ToArrayND10<T> = [T] extends [any] ? T[] : never
type _10_4c = Expect<Equal<ToArrayND10<string | number>, PREDICT>>

type _10_4d = Expect<Equal<ToArray10<never>, PREDICT>>
type _10_4e = Expect<Equal<ToArray10<boolean>, PREDICT>>   // boolean is secretly a union!

// EXPLAIN IT — say it precisely: "when the checked type is a naked type
// parameter, the conditional distributes over union members." Then explain
// 10.4d and 10.4e:
/*

*/

// ═══ EXERCISE 10.5 ★★★★ — taming distribution: IsNever, IsAny ═══
// TASK: First replace the PREDICT (understand the failure!), then implement
//       IsNever and IsAny correctly.
// VOCAB: tuple wrapping, empty-union vacuum, any's both-ways assignability
// HINT 1: IsNever: wrap both sides in tuples to stop distribution.
// HINT 2: IsAny: `0 extends 1 & T` — only any makes 1 & T swallow a 0.

type NaiveIsNever10<T> = T extends never ? true : false
type _10_5a = Expect<Equal<NaiveIsNever10<never>, PREDICT>>   // NOT what you'd hope

type IsNever10<T> = unknown // ← your solution
type IsAny10<T> = unknown // ← your solution

type _10_5b = Expect<Equal<IsNever10<never>, true>>
type _10_5c = Expect<Equal<IsNever10<string>, false>>
type _10_5d = Expect<Equal<IsNever10<undefined>, false>>
type _10_5e = Expect<Equal<IsAny10<any>, true>>
type _10_5f = Expect<Equal<IsAny10<unknown>, false>>
type _10_5g = Expect<Equal<IsAny10<never>, false>>

// EXPLAIN IT — why does NaiveIsNever<never> evaluate the way it does, and how
// does the tuple wrap change the game?
/*

*/

// ═══ EXERCISE 10.6 ★★★★ — infer with tuples: First, Last ═══
// TASK: Implement First and Last using tuple patterns with rest elements.
// VOCAB: variadic tuple pattern, rest element, positional infer

type First10<T extends readonly unknown[]> = unknown // ← your solution
type Last10<T extends readonly unknown[]> = unknown // ← your solution

type _10_6a = Expect<Equal<First10<[1, 2, 3]>, 1>>
type _10_6b = Expect<Equal<First10<[]>, never>>
type _10_6c = Expect<Equal<Last10<[1, 2, 3]>, 3>>
type _10_6d = Expect<Equal<Last10<["only"]>, "only">>
type _10_6e = Expect<Equal<Last10<[]>, never>>

// EXPLAIN IT — the pattern [infer F, ...infer Rest] reads like array
// destructuring. What's the type-level difference from indexing T[0]?
// (Try First10<[]> both ways in your head.)
/*

*/

// ═══ EXERCISE 10.7 ★★★★ — template literal types ═══
// TASK: Replace each PREDICT.
// VOCAB: template literal type, union cross-product, intrinsic string types
// DOCS: https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html

type _10_7a = Expect<Equal<`hello ${"world" | "ts"}`, PREDICT>>
type _10_7b = Expect<Equal<`${"a" | "b"}-${"x" | "y"}`, PREDICT>>
type _10_7c = Expect<Equal<"12px" extends `${number}px` ? true : false, PREDICT>>
type _10_7d = Expect<Equal<"abpx" extends `${number}px` ? true : false, PREDICT>>
type _10_7e = Expect<Equal<Uppercase<"hi">, PREDICT>>
type _10_7f = Expect<Equal<Capitalize<"hello world">, PREDICT>>

// EXPLAIN IT — 10.7b produced how many members, via what rule? Where have you
// seen this pattern in real APIs (think CSS props, event names)?
/*

*/

// ═══ EXERCISE 10.8 ★★★★★ — infer inside strings: route params ═══
// TASK: Implement ParamNames: extract the :param names from a route string as
//       a union. This exact type powers typed routers (tRPC, Hono, Express
//       typings).
// VOCAB: template literal pattern matching, recursive string parsing
// HINT 1: Two cases: a param followed by more path (`...:${infer P}/${infer R}`)
//         → P | recurse on `/${R}`; a final param (`...:${infer P}`) → P.

type ParamNames10<Route extends string> = unknown // ← your solution

type _10_8a = Expect<Equal<ParamNames10<"/users/:id">, "id">>
type _10_8b = Expect<Equal<ParamNames10<"/users/:id/posts/:postId">, "id" | "postId">>
type _10_8c = Expect<Equal<ParamNames10<"/health">, never>>

// EXPLAIN IT — describe how the compiler "runs" your type on
// "/users/:id/posts/:postId", step by step:
/*

*/

// ═══ EXERCISE 10.9 ★★★★★ — Split: string → tuple ═══
// TASK: Implement Split<S, D>: split string S on delimiter D.
// VOCAB: recursive template pattern, accumulator-free recursion
// HINT 1: S extends `${infer Head}${D}${infer Tail}` ? [Head, ...Split<Tail, D>] : [S]

type Split10<S extends string, D extends string> = unknown // ← your solution

type _10_9a = Expect<Equal<Split10<"a,b,c", ",">, ["a", "b", "c"]>>
type _10_9b = Expect<Equal<Split10<"one", ",">, ["one"]>>
type _10_9c = Expect<Equal<Split10<"2026-09-09", "-">, ["2026", "09", "09"]>>

// EXPLAIN IT — you just wrote String.prototype.split as a TYPE. What does
// that tell you about the type system's computational power (foreshadowing
// ch. 14)?
/*

*/

// ═══ EXERCISE 10.10 ★★★★★ — CamelCase from snake_case ═══
// TASK: Implement CamelFromSnake — the type behind "API returns snake_case,
//       my app wants camelCase" typed mappers.
// VOCAB: recursive case transformation, Capitalize composition

type CamelFromSnake10<S extends string> = unknown // ← your solution

type _10_10a = Expect<Equal<CamelFromSnake10<"user_first_name">, "userFirstName">>
type _10_10b = Expect<Equal<CamelFromSnake10<"id">, "id">>
type _10_10c = Expect<Equal<CamelFromSnake10<"a_b_c_d">, "aBCD">>

// EXPLAIN IT — combine this with ch. 9's key remapping: sketch (in words) the
// CamelizeKeys<T> type you could now build:
/*

*/

// ═══ EXERCISE 10.11 ★★★★★ — counting with tuples ═══
// TASK: Types can't do arithmetic — but tuple lengths can. Implement
//       BuildTuple<N> (a tuple of N unknowns) and use it for Add.
// VOCAB: tuple-length arithmetic, accumulator parameter, recursion limit
// HINT 1: BuildTuple<N, Acc = []> = Acc["length"] extends N ? Acc
//         : BuildTuple<N, [...Acc, unknown]>
// HINT 2: Add<A, B> = [...BuildTuple<A>, ...BuildTuple<B>]["length"]

type BuildTuple10<N extends number, Acc extends unknown[] = []> = unknown // ← your solution
type Add10<A extends number, B extends number> = unknown // ← your solution

type _10_11a = Expect<Equal<BuildTuple10<2>, [unknown, unknown]>>
type _10_11b = Expect<Equal<Add10<2, 3>, 5>>
type _10_11c = Expect<Equal<Add10<0, 0>, 0>>
type _10_11d = Expect<Equal<Add10<7, 14>, 21>>

// EXPLAIN IT — why do we count in unary (tuples) instead of "just adding"?
// What hard limit does this run into (~1000)?
/*

*/

// ═══ EXERCISE 10.12 ★★★★★ — MyAwaited: what await actually unwraps ═══
// TASK: Implement MyAwaited. It must unwrap nested promises AND custom
//       thenables (remember ch. 4.9!), and pass non-thenables through.
// VOCAB: thenable pattern, structural matching, recursive unwrap
// HINT 1: Match the SHAPE: { then: (onfulfilled: (v: infer V) => any) => any }
//         — then recurse on V. (PromiseLike<infer V> fails the strict-callback
//         thenable below — try it and see why.)

type MyAwaited10<T> = unknown // ← your solution

type _10_12a = Expect<Equal<MyAwaited10<Promise<string>>, string>>
type _10_12b = Expect<Equal<MyAwaited10<Promise<Promise<number>>>, number>>
type _10_12c = Expect<Equal<MyAwaited10<{ then: (cb: (v: boolean) => void) => void }>, boolean>>
type _10_12d = Expect<Equal<MyAwaited10<42>, 42>>

// EXPLAIN IT — connect this to runtime: WHY does the type match on a `then`
// property rather than `instanceof Promise`?
/*

*/

// ═══ EXERCISE 10.13 ★★★★★ — the conditional gauntlet ═══
// TASK: Replace each PREDICT. Every trap from this chapter at once.

type D10<T> = T extends true ? 1 : 2
type _10_13a = Expect<Equal<D10<boolean>, PREDICT>>   // boolean = true | false...
type _10_13b = Expect<Equal<D10<any>, PREDICT>>       // any takes BOTH branches
type _10_13c = Expect<Equal<D10<never>, PREDICT>>
type _10_13d = Expect<Equal<[never] extends [never] ? "y" : "n", PREDICT>>
type _10_13e = Expect<Equal<Equal<any, unknown>, PREDICT>>  // Equal is strict!

// EXPLAIN IT — the three special citizens of conditionals: any, never,
// boolean. One sentence each on how they behave when checked:
/*

*/

// ── chapter self-check ──────────────────────────────────────────────────────
// Zero squiggles = you can pattern-match, recurse, and parse strings at the
// type level. Chapter 13 will weaponize all of it.
export {}
