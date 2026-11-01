import { compilePack } from "@foundryvtt/foundryvtt-cli";
import fs from "fs";

const dest = "packs/macros";
for (const name of fs.readdirSync(dest)) {
  if (name === "_source") continue;
  fs.rmSync(`${dest}/${name}`, { recursive: true, force: true });
}
await compilePack("packs/src/macros", dest, { log: true });
