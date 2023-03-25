import type { Options } from "tsup"

const config: Options = {
  entry: ["src/index.ts", "src/cli.ts"],
  dts: true,
  sourcemap: true,
  format: ["esm", "cjs"]
}

export default config
