# @khanacademy/format-claude-stream

## 0.1.1

### Patch Changes

- 2fd38f4: Add blank lines between events, for readability. Tool results are kept together with their tool calls, with no intervening blank line. Consecutive Read and Edit calls are also grouped together.

## 0.1.0

### Minor Changes

- 2fa7acc: Previously, Edit tool calls produced output like "The file `<path>` has been updated successfully." This noise is now suppressed.

### Patch Changes

- 305932f: Suppress output of Read calls more reliably, preventing file contents from getting dumped to the terminal.

## 0.0.3

### Patch Changes

- a7ff63b: Compile CLI to JavaScript instead of relying on @swc-node/register to compile it on the fly.

## 0.0.2

### Patch Changes

- ddfdf95: Re-publish of 0.0.1 with package provenance and OIDC enabled

## 0.0.1

### Patch Changes

- 6692ff1: Initial release
