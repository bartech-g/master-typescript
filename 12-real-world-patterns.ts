// ════════════════════════════════════════════════════════════════════════════
// CHAPTER 12 — REAL-WORLD PATTERNS                            (editor-checked)
// ════════════════════════════════════════════════════════════════════════════
// Everything you've built so far, assembled into the patterns you'll actually
// ship: branded IDs, exhaustive reducers, typed emitters, builders, typed
// fetch, and a miniature Zod. These are portfolio pieces — after each one,
// write the EXPLAIN IT as if documenting it for your team.

type Expect<T extends true> = T
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false

// ═══ EXERCISE 12.1 ★★★ — branded types: nominal typing on demand ═══
// TASK: Implement Brand12 so that UserId and PostId are both strings at
//       runtime but UNMIXABLE at compile time. All expect-errors must survive.
// VOCAB: branded/opaque type, nominal vs structural, phantom property
// HINT 1: T & { readonly __brand: B } — the property never exists at runtime;
//         it exists only to make the types structurally different.

type Brand12<T, B extends string> = unknown // ← your solution
type UserId12 = Brand12<string, "UserId">
type PostId12 = Brand12<string, "PostId">

const asUserId12 = (s: string) => s as UserId12
const asPostId12 = (s: string) => s as PostId12
declare function getUser12(id: UserId12): { name: string }

getUser12(asUserId12("u_1"))                    // ✅
// @ts-expect-error — a raw string is not a UserId
getUser12("u_1")
// @ts-expect-error — a PostId is not a UserId, even though both are strings
getUser12(asPostId12("p_1"))
// a branded string still IS a string (you can .toUpperCase() it):
type _12_1 = Expect<Equal<UserId12 extends string ? true : false, true>>

// EXPLAIN IT (2–4 sentences, use the vocab, say it out loud):
/*

*/

// ═══ EXERCISE 12.2 ★★★ — exhaustive reducers with assertNever ═══
// TASK: The reducer forgot the "undo" action — the default branch is red
//       because `action` is NOT never yet. Add the missing case.
//       Afterwards: add a brand-new action to Action12 and watch every
//       reducer in the codebase light up. That's the feature.
// VOCAB: exhaustiveness checking, assertNever, compiler-driven refactoring

function assertNever12(x: never): never {
  throw new Error(`unexpected: ${JSON.stringify(x)}`)
}

type Action12 =
  | { type: "add"; n: number }
  | { type: "reset" }
  | { type: "undo"; steps: number }

function reduce12(state: number, action: Action12): number {
  switch (action.type) {
    case "add": return state + action.n
    case "reset": return 0
    // ← your solution: the missing case
    default: return assertNever12(action)
  }
}
void reduce12

// EXPLAIN IT — why is assertNever BETTER than a lint rule or a test for
// catching unhandled cases? Who catches it, and when?
/*

*/

// ═══ EXERCISE 12.3 ★★★★ — a typed event emitter ═══
// TASK: Fix the signatures of on() and emit() so events and payloads are
//       bound together. The two expect-errors must survive.
// VOCAB: event map, generic method per call site, K extends keyof E, indexed payload

class Emitter12<E extends Record<string, unknown>> {
  private handlers: { [K in keyof E]?: Array<(payload: E[K]) => void> } = {}
  on(event: never, handler: never): void { // ← your solution (signature)
    ;(this.handlers[event as keyof E] ??= []).push(handler)
  }
  emit(event: never, payload: never): void { // ← your solution (signature)
    this.handlers[event as keyof E]?.forEach(h => h(payload))
  }
}

type AppEvents12 = { login: { user: string }; error: { code: number } }
const bus12 = new Emitter12<AppEvents12>()
bus12.on("login", e => {
  type _12_3 = Expect<Equal<typeof e, { user: string }>>
})
bus12.emit("login", { user: "ada" })
bus12.emit("error", { code: 500 })
// @ts-expect-error — wrong payload shape for "login"
bus12.emit("login", { code: 1 })
// @ts-expect-error — unknown event name
bus12.on("nope", () => {})

// EXPLAIN IT — the generic lives on the METHOD, not just the class. What does
// each call site get because of that?
/*

*/

// ═══ EXERCISE 12.4 ★★★★★ — a builder that accumulates its type ═══
// TASK: Fix with() so every call ADDS the new key to the tracked type T, and
//       fix build() to return the flattened accumulated object type.
// VOCAB: accumulating type state, T & Record<K, V>, flattening mapped type
// HINT 1: with returns RequestBuilder12<T & Record<K, V>> (runtime: mutate
//         and `return this as ...` — one honest cast at the type frontier).
// HINT 2: build(): { [K in keyof T]: T[K] } — flattens the intersection so
//         the final type reads like a plain object.

class RequestBuilder12<T extends object = {}> {
  private data: Record<string, unknown> = {}
  with(key: never, value: never): never { // ← your solution (signature + return)
    this.data[key] = value
    return this as never
  }
  build(): T { // ← your solution (return type)
    return this.data as T
  }
}

const req12 = new RequestBuilder12()
  .with("url", "/users")
  .with("retries", 3)
  .with("secure", true)
  .build()
type _12_4 = Expect<Equal<typeof req12, { url: string; retries: number; secure: boolean }>>

// EXPLAIN IT — each .with() returns a DIFFERENT TYPE than it started with.
// Explain how method chaining threads that accumulation:
/*

*/

// ═══ EXERCISE 12.5 ★★★★ — RemoteData: make illegal states unrepresentable ═══
// TASK: Implement mapRemote — transform the data of a success, pass every
//       other state through untouched, fully typed.
// VOCAB: discriminated union modeling, illegal states, structure-preserving map

type RemoteData12<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string }

function mapRemote12(rd: never, f: never): unknown {
  return TODO12_5 // ← your solution (signature AND body)
}
declare const TODO12_5: never

const state12 = { status: "success", data: [1, 2, 3] } as RemoteData12<number[]>
const mapped12 = mapRemote12(state12, xs => xs.length)
type _12_5a = Expect<Equal<typeof mapped12, RemoteData12<number>>>
const idle12 = mapRemote12({ status: "idle" } as RemoteData12<string>, s => s.length)
type _12_5b = Expect<Equal<typeof idle12, RemoteData12<number>>>

// EXPLAIN IT — compare this to `{ data?: T; loading: boolean; error?: string }`.
// List two illegal states the flag-soup version permits and this forbids:
/*

*/

// ═══ EXERCISE 12.6 ★★★★ — a typed API client from a route map ═══
// TASK: Fix apiGet's signature so each path returns ITS response type and
//       unknown paths are rejected.
// VOCAB: route map, keyof-constrained path, indexed response type

type Api12 = {
  "/users": { id: number; name: string }[]
  "/health": { ok: boolean }
}

declare function apiGet12(path: any): any // ← your solution (fix this signature)

const users12 = await apiGet12("/users")
type _12_6a = Expect<Equal<typeof users12, { id: number; name: string }[]>>
const health12 = await apiGet12("/health")
type _12_6b = Expect<Equal<typeof health12, { ok: boolean }>>
// @ts-expect-error — route not in the map
apiGet12("/nope")

// EXPLAIN IT — one type (Api12) now drives autocomplete, payload types, and
// typo-rejection. Where does that map live in a full-stack repo (tRPC/OpenAPI)?
/*

*/

// ═══ EXERCISE 12.7 ★★★★★ — mini-Zod: a schema that IS the type ═══
// TASK: Fix the builder signatures and implement Infer so that the schema
//       VALUE below produces the exact object TYPE — no duplication.
// VOCAB: schema inference, phantom type parameter, single source of truth
// HINT 1: Schema12<T> carries T as a phantom. str() returns Schema12<string>.
// HINT 2: obj: <S extends Record<string, Schema12<any>>>(shape: S) =>
//         Schema12<{ [K in keyof S]: S[K]["_type"] }>
// HINT 3: Infer12<S> = S extends Schema12<infer T> ? T : never

type Schema12<T> = { readonly _type: T }

declare function str12(): any // ← your solution
declare function num12(): any // ← your solution
declare function arr12(item: any): any // ← your solution
declare function obj12(shape: any): any // ← your solution
type Infer12<S> = unknown // ← your solution

const userSchema12 = obj12({
  name: str12(),
  age: num12(),
  tags: arr12(str12()),
})
type User12 = Infer12<typeof userSchema12>
type _12_7 = Expect<Equal<User12, { name: string; age: number; tags: string[] }>>

// EXPLAIN IT — this is how Zod/Valibot give you `z.infer`. Explain "the value
// is the source of truth, the type is derived" and why that kills type drift:
/*

*/

// ═══ EXERCISE 12.8 ★★★★ — conditional return types (and their honest cast) ═══
// TASK: convert() turns strings into numbers and numbers into strings — with
//       a RETURN TYPE that depends on the input type. Implement the body.
// VOCAB: conditional return type, cast at the generic boundary
// HINT 1: Inside the body, TS cannot prove `number` matches `T extends string
//         ? number : string` (T is still abstract) — you'll need one cast.
//         That's a known, accepted limitation. Say it in the EXPLAIN IT.

function convert12<T extends string | number>(input: T): T extends string ? number : string {
  return TODO12_8 // ← your solution
}
declare const TODO12_8: never

const n12 = convert12("42")
type _12_8a = Expect<Equal<typeof n12, number>>
const s12 = convert12(42)
type _12_8b = Expect<Equal<typeof s12, string>>

// EXPLAIN IT — when is a conditional return type better than overloads, and
// what's the cost inside the implementation?
/*

*/

// ── chapter self-check ──────────────────────────────────────────────────────
// Zero squiggles = you now own the patterns that make senior code review
// comments like "brand this ID" or "make this exhaustive" feel routine.
export {}
