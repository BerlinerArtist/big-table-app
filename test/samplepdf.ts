import fs from "fs";
import { OCCASIONS } from "../src/data/loader";
import { buildKitchenPack } from "../src/lib/pdf";

const occ = OCCASIONS.find((o) => o.id.includes("anniversary"))!;
const doc = buildKitchenPack(occ, 6, "metric", "19:00", "");
fs.writeFileSync(
  "/mnt/user-data/outputs/sample-kitchen-pack.pdf",
  Buffer.from(doc.output("arraybuffer"))
);
console.log("occasion:", occ.occasion, "| pages:", doc.getNumberOfPages());
