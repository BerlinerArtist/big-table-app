"""
Split occasions.json into:
  1. src/data/occasions-preview.json  -> PUBLIC, ships in the client bundle.
     Full data for the free occasion, metadata-only for the rest.
  2. server/occasions-full.json       -> PRIVATE. Never deployed publicly.
"""
import json
from pathlib import Path

FREE_OCCASION_IDS = {"romantic-anniversary-dinner"}

SRC = Path("src/data/occasions.json")
PREVIEW_OUT = Path("src/data/occasions-preview.json")
FULL_OUT = Path("server/occasions-full.json")

FULL_OUT.parent.mkdir(parents=True, exist_ok=True)

data = json.loads(SRC.read_text())

FULL_OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2))

METADATA_FIELDS = [
    "page", "id", "occasion", "tier", "recipeTitle", "cuisine",
    "forTwo", "mode", "slider", "ovenCelsius", "difficulty", "stats",
]

preview_occasions = []
for occ in data["occasions"]:
    if occ["id"] in FREE_OCCASION_IDS:
        preview_occasions.append(occ)
    else:
        stripped = {k: occ.get(k) for k in METADATA_FIELDS}
        stripped["ingredients"] = []
        stripped["swaps"] = []
        stripped["phases"] = []
        stripped["nutritionPerServing"] = {}
        stripped["pairings"] = []
        stripped["notes"] = []
        stripped["timeline"] = []
        stripped["details"] = occ.get("details", [])
        preview_occasions.append(stripped)

preview = {"meta": data["meta"], "occasions": preview_occasions}
PREVIEW_OUT.write_text(json.dumps(preview, ensure_ascii=False, indent=2))

print(f"Wrote {PREVIEW_OUT} ({len(preview_occasions)} occasions, metadata-only except free)")
print(f"Wrote {FULL_OUT} (full data, {len(data['occasions'])} occasions) — DO NOT deploy this file publicly")
