# The TypeScript Ninja Course

One goal: after these 14 chapters you will not _feel_ confident — you will _be_ correct,
repeatedly, with the compiler as your witness. That's where confidence actually comes from.

There are **no answer files**. You verify yourself:

- **Type exercises** self-check with `Expect<Equal<...>>` assertions. While your solution is
  wrong, the assertion line has a red squiggle. When the squiggle dies, you are provably right —
  the compiler accepted a proof, not an opinion.
- **Runtime exercises** (chapters 1–6) use **predict-then-run**: you write down what you think
  the code does _before_ running it, then run the file and it prints `PASS` / `FAIL` / `SKIP`
  per exercise. Your prediction is the answer key you're building in your own head.

## Setup (there is none)

- You need an editor with TypeScript support (VS Code, Zed, Neovim + LSP — anything).
  It reads `tsconfig.json` from this folder automatically. **Do not delete `tsconfig.json`** —
  it turns on `strict` mode.
- You need Node ≥ 22.6. It runs `.ts` files directly:

  ```sh
  node 01-values-and-coercion.ts
  ```

  Only chapters **01–06** are meant to be run. Chapters 07–14 are type-level: the editor
  squiggles ARE the test runner.

- Optional, to check a whole chapter from the terminal:

  ```sh
  npx -y -p typescript tsc --noEmit
  ```

## The loop (do this for every exercise)

1. Read the TASK. **Do not read the hints yet.**
2. Attempt it. Struggle is the mechanism — an exercise you solved without friction taught you nothing.
3. Stuck ≥ 10 minutes? Read HINT 1. Still stuck? HINT 2, then HINT 3 (HINT 3 nearly spoils).
4. Stuck after all hints? Read the DOCS link — it points at the exact page, not the homepage.
5. When it's green / PASS: **write the EXPLAIN IT block.** 2–4 sentences, using every term in
   VOCAB, as if a senior engineer just asked you "wait, why does that work?" in a code review.
6. **Say your explanation out loud.** Yes, actually. Fluency in technical speech is a motor
   skill; reading silently does not train it.
7. One week later, reread your EXPLAIN IT blocks for the chapter. Rewrite any that now sound
   wrong or vague to you. (They will. That's the sign you leveled up.)

## Rules

- No LLMs, no googling the answer, for the **first attempt**. Hints → docs → then the internet.
- Never delete a failing assertion to "fix" an exercise. The assertion is the exercise.
- `// @ts-expect-error` lines are part of exercises: they assert that a line MUST error.
  If such a line itself gets a squiggle, your code made something legal that must stay illegal.
- Keep your EXPLAIN IT blocks. They become your personal interview prep document.

## Difficulty legend

| Mark  | Meaning                                                                                                                                      |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| ★     | warm-up — you should get these fast                                                                                                          |
| ★★    | working knowledge                                                                                                                            |
| ★★★   | mid-level interview question                                                                                                                 |
| ★★★★  | senior interview question                                                                                                                    |
| ★★★★★ | "how does the type system actually work" tier                                                                                                |
| ☠     | type-challenges hard/extreme tier — hours are normal                                                                                         |
| ∞     | **impossible tier** — the exercise cannot be fully solved, and knowing exactly _why_ is the skill. Your deliverable is the EXPLAIN IT block. |

## The chapters

**Part I — JavaScript runtime** (run these with `node`)

| File                                    | What it makes you own                                        |
| --------------------------------------- | ------------------------------------------------------------ |
| `01-values-and-coercion.ts`             | typeof, ==, coercion algorithm, NaN, ToPrimitive             |
| `02-scope-closures-hoisting.ts`         | TDZ, hoisting, closures over mutable state                   |
| `03-this-prototypes-classes.ts`         | this-binding rules, prototype chain, classes, descriptors    |
| `04-event-loop-and-promises.ts`         | micro/macrotasks, promise semantics, async/await desugaring  |
| `05-iterators-generators-symbols.ts`    | iteration protocols, generators, well-known symbols          |
| `06-collections-references-mutation.ts` | reference semantics, array gotchas, Map/Set/WeakMap, cloning |

**Part II — The TypeScript type system**

| File                                  | What it makes you own                                              |
| ------------------------------------- | ------------------------------------------------------------------ |
| `07-ts-fundamentals-narrowing.ts`     | structural typing, unions, narrowing, any/unknown/never, satisfies |
| `08-generics-and-inference.ts`        | generics, constraints, how inference actually decides              |
| `09-mapped-types-keyof-utilities.ts`  | keyof, mapped types, rebuild every utility type from scratch       |
| `10-conditional-types-and-infer.ts`   | conditional types, infer, distributivity, template literals        |
| `11-variance-classes-declarations.ts` | co/contravariance, declaration merging, .d.ts, strict flags        |
| `12-real-world-patterns.ts`           | branded types, typed emitters, builders, mini-Zod                  |

**Part III — Ninja tier**

| File                         | What it makes you own                                         |
| ---------------------------- | ------------------------------------------------------------- |
| `13-type-challenges-hard.ts` | UnionToIntersection, Currying, tuple math, type-level parsers |
| `14-impossible.ts`           | the boundaries of the type system, and how to talk about them |

## How `Expect<Equal<X, Y>>` works (read this once, it recurs in ch. 14)

```ts
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? true
    : false;
type Expect<T extends true> = T;
```

`Equal` compares two types _exactly_ (it even tells `any` apart from `unknown`, and
`{ a: 1 } & { b: 2 }` apart from `{ a: 1; b: 2 }` — mostly a feature, occasionally a sharp
edge). `Expect` demands the result be `true`, so a wrong solution makes the line error.
Why this bizarre encoding works is exercise 14.7. For now: green line = exact type match.

Go open `01-values-and-coercion.ts`. The impostor syndrome dies one PASS at a time.
