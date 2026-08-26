import { OCCASIONS } from "../src/data/loader";
import { scaledDisplay } from "../src/engine/scale";

let bad = 0, total = 0;
for (const o of OCCASIONS) {
  for (const ing of o.ingredients) {
    total++;
    const out = scaledDisplay(ing, ing.baseServes, "metric");
    const want = (ing.display || "").trim();
    if (want && out !== want) {
      bad++;
      if (bad <= 10) console.log(`  p${o.page} ${ing.name}: ported="${out}" original="${want}"`);
    }
  }
}
console.log(`PARITY ${total - bad}/${total} ingredients render identical to the original book`);
