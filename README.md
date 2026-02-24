# format-claude-stream

A CLI filter to turn Claude's streaming JSON output into human-readable text.

## Usage

```
claude --print --output-format stream-json | cli/main.ts
```

## Example output

```
Thinking: Let me start by running all the tests to see if any fail.
Run all tests:
Bash: pnpm test 2>&1 | tail -100
Search for TODOs in codebase:
Bash: ag TODO --ignore-dir=node_modules --ignore-dir=.git --ignore="*.snap" 2>&1 | grep -v "^Binary" | head -100
Find simple TODO comments without ticket numbers:
Bash: ag TODO --ignore-dir=node_modules --ignore-dir=.git --ignore="*.snap" 2>&1 | grep -v "^Binary" | grep -v "CHANGELOG" | grep -v "TODO(.*): " | grep -v "TODO(.*)[^:]*$" | head -50
Thinking: Let me look for the most straightforward TODOs to fix. Let me look at a few candidates:

1. `packages/kmath/src/number.ts` - the git status shows this file was modified, so let me check what's there
2. `packages/kmath/src/point.ts:71` - convert return type to `-1 | 0 | 1`
3. `packages/kmath/src/line.ts:26` - A nicer implementation might just check collinearity

Let me look at a few of these to see which is easiest to fix.
Read: /Users/ben/khan/perseus/packages/kmath/src/point.ts
Read: /Users/ben/khan/perseus/packages/kmath/src/number.ts
Thinking: I notice `number.ts` has a comment `/* Should be: 0 | 1 | -1 */` on line 38, not a TODO. Let me look at what the modified version of number.ts looks like in the git status. But wait - the git status says `M packages/kmath/src/number.ts`, which means there are uncommitted changes.

Let me check the diff to see what changes are there.
Show diff of modified number.ts:
Bash: git diff packages/kmath/src/number.ts
Thinking: There's already a change in `number.ts` that fixes a TODO. The TODO was: `// TODO: Should this just be Number.Epsilon` and it's been replaced with a better comment. This is already done.

Now let me look for simpler TODOs to fix. Let me look at the `sign` function in `number.ts` which has `/* Should be: 0 | 1 | -1 */`. That's not a TODO but it's similar. Let me look at the `point.ts` TODO.

Actually, looking at the diff, it looks like someone already fixed one TODO in `number.ts`. Let me focus on finding a simple TODO to fix.

I'm examining a couple of candidates here. The `point.ts` file has a `compare` function that would need the return type changed to `-1 | 0 | 1`, but the actual implementation returns differences that aren't constrained to those values, so that would require significant refactoring. The `sign` function in `number.ts` has a similar type annotation issue that might be more straightforward to address.

Now I'm looking at the TODO comments in `vector.ts` around lines 154 and 167 that mention converting to tuple or Point types.

I'm also noticing duplicate TODO comments appearing in both `coefficients.ts` and `interactive-graph.tsx` about similar `getSinusoidCoefficients` and `getQuadraticCoefficients` functions, which suggests these are duplicated across files and should probably be consolidated.
Read: /Users/ben/khan/perseus/packages/kmath/src/coefficients.ts
Find duplicate coefficient functions:
Bash: grep -n "getSinusoidCoefficients\|getQuadraticCoefficients" packages/perseus/src/widgets/interactive-graphs/interactive-graph.tsx | head -20
Thinking: So there are two sets of similar functions:

1. `packages/kmath/src/coefficients.ts` - exports `getSinusoidCoefficients` and `getQuadraticCoefficients`
2. `packages/perseus/src/widgets/interactive-graphs/interactive-graph.tsx` - has local versions of `getSinusoidCoefficients` and `getQuadraticCoefficients`

The TODO says "they should probably be merged". The kmath package is the utility package, so the ideal fix would be to use the kmath versions in interactive-graph.tsx. Let me check if they're actually the same implementation.
Read: /Users/ben/khan/perseus/packages/perseus/src/widgets/interactive-graphs/interactive-graph.tsx
Thinking: The functions are identical between `kmath/src/coefficients.ts` and `interactive-graph.tsx`. I can fix the TODO by replacing the duplicate functions in `interactive-graph.tsx` with imports from `@khanacademy/kmath`. Let me check the imports in interactive-graph.tsx to understand what's imported.
Read: /Users/ben/khan/perseus/packages/perseus/src/widgets/interactive-graphs/interactive-graph.tsx
Thinking: I can see that `interactive-graph.tsx` already imports `{angles, geometry}` from `@khanacademy/kmath`. Let me check what's exported from kmath and whether `getSinusoidCoefficients` and `getQuadraticCoefficients` are exported.
Check what kmath exports:
Bash: grep -n "getSinusoidCoefficients\|getQuadraticCoefficients\|coefficients" packages/kmath/src/index.ts | head -20
Thinking: So `kmath` exports `coefficients` as a namespace, and the `getSinusoidCoefficients` and `getQuadraticCoefficients` functions are accessible as `coefficients.getSinusoidCoefficients` and `coefficients.getQuadraticCoefficients`.

Let me check how the functions are used in interactive-graph.tsx to understand how to safely replace them with the kmath versions.
Find usages of coefficient functions in interactive-graph.tsx:
Bash: grep -n "getSinusoidCoefficients\|getQuadraticCoefficients" packages/perseus/src/widgets/interactive-graphs/interactive-graph.tsx
Read: /Users/ben/khan/perseus/packages/perseus/src/widgets/interactive-graphs/interactive-graph.tsx
Thinking: Now let me fix the TODO by:
1. Adding `coefficients` to the import from `@khanacademy/kmath`
2. Replacing the local function definitions with references to the kmath versions

Wait, I need to check if `coefficients` is already imported. Looking at line 2: `import {angles, geometry} from "@khanacademy/kmath";`

I need to add `coefficients` to this import, then replace the local function definitions with destructured versions from `coefficients`.

Let me make the changes:
Edit: /Users/ben/khan/perseus/packages/perseus/src/widgets/interactive-graphs/interactive-graph.tsx
Edit: /Users/ben/khan/perseus/packages/perseus/src/widgets/interactive-graphs/interactive-graph.tsx
Edit: /Users/ben/khan/perseus/packages/perseus/src/widgets/interactive-graphs/interactive-graph.tsx
Check remaining usage of types:
Bash: grep -n "SineCoefficient\|QuadraticCoefficient\|Coord" packages/perseus/src/widgets/interactive-graphs/interactive-graph.tsx | head -20
Check if type imports are still used:
Bash: grep -n "SineCoefficient\|QuadraticCoefficient" packages/perseus/src/widgets/interactive-graphs/interactive-graph.tsx
Run interactive-graphs tests:
Bash: pnpm --filter perseus test packages/perseus/src/widgets/interactive-graphs 2>&1 | tail -30
Run interactive-graphs tests:
Bash: pnpm test packages/perseus/src/widgets/interactive-graphs 2>&1 | tail -30
Run all tests:
Bash: pnpm test 2>&1 | tail -15
```