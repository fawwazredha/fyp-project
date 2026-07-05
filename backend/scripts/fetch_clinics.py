#!/usr/bin/env python3
"""
fetch_clinics.py
----------------
Generates clinic/hospital data for the CKD system's "Find a Clinic" feature,
using free OpenStreetMap data via the Overpass API.

- No API key, no billing account, no credit card required.
- Pairs with the Leaflet + OpenStreetMap map already in the app.

Run once:
    pip install requests
    python fetch_clinics.py

Output:
    clinicsData.ts   -> a ready-to-import TypeScript data module

Author note for the report: data source is OpenStreetMap (© OpenStreetMap
contributors), queried via the Overpass API.
"""

import json
import time
import sys
import requests

# Overpass endpoint (public, free). If one is slow, swap to a mirror below.
OVERPASS_URL = "https://overpass-api.de/api/interpreter"
# Mirrors you can try if the main one is busy:
#   https://overpass.kumi.systems/api/interpreter
#   https://maps.mail.ru/osm/tools/overpass/api/interpreter

# Display name (must match your MALAYSIA_STATES keys) -> ISO 3166-2 code.
# ISO codes are used because they match OSM admin boundaries reliably,
# avoiding name-spelling mismatches.
STATES = {
    "Johor":           "MY-01",
    "Kedah":           "MY-02",
    "Kelantan":        "MY-03",
    "Melaka":          "MY-04",
    "Negeri Sembilan": "MY-05",
    "Pahang":          "MY-06",
    "Penang":          "MY-07",
    "Perak":           "MY-08",
    "Perlis":          "MY-09",
    "Selangor":        "MY-10",
    "Terengganu":      "MY-11",
    "Sabah":           "MY-12",
    "Sarawak":         "MY-13",
    "Kuala Lumpur":    "MY-14",
    "Labuan":          "MY-15",
    "Putrajaya":       "MY-16",
}

# Optional: cap how many per state so cards/maps don't get huge.
# Set to None to keep every result. Hospitals are kept first.
MAX_PER_STATE = 25


def build_query(iso_code: str) -> str:
    """Overpass QL: all hospitals/clinics/doctors inside a state's boundary."""
    return f"""
    [out:json][timeout:90];
    area["ISO3166-2"="{iso_code}"]->.a;
    (
      nwr["amenity"~"^(hospital|clinic|doctors)$"](area.a);
    );
    out center tags;
    """


def get_coords(el: dict):
    """Nodes carry lat/lon directly; ways/relations use 'center'."""
    if "lat" in el and "lon" in el:
        return el["lat"], el["lon"]
    if "center" in el:
        return el["center"]["lat"], el["center"]["lon"]
    return None, None


def get_name(tags: dict):
    return tags.get("name") or tags.get("name:en") or tags.get("name:ms")


def build_address(tags: dict, fallback_state: str) -> str:
    parts = []
    for key in ("addr:housenumber", "addr:street", "addr:city", "addr:postcode"):
        val = tags.get(key)
        if val:
            parts.append(val)
    if parts:
        return ", ".join(parts)
    # fall back to whatever location hint exists
    return tags.get("addr:full") or tags.get("addr:city") or fallback_state


def classify(tags: dict) -> str:
    """Map OSM amenity to your two types."""
    return "hospital" if tags.get("amenity") == "hospital" else "clinic"


def fetch_state(name: str, iso_code: str):
    query = build_query(iso_code)
    for attempt in range(1, 4):
        try:
            resp = requests.post(
                OVERPASS_URL,
                data={"data": query},
                headers={"User-Agent": "CKD-FYP-ClinicFinder/1.0"},
                timeout=120,
            )
            resp.raise_for_status()
            return resp.json().get("elements", [])
        except Exception as exc:
            print(f"   attempt {attempt} failed for {name}: {exc}")
            time.sleep(5 * attempt)
    print(f"   giving up on {name}")
    return []


def main():
    result = {}
    for name, iso_code in STATES.items():
        print(f"Fetching {name} ({iso_code}) ...")
        elements = fetch_state(name, iso_code)

        seen = set()
        clinics = []
        for el in elements:
            tags = el.get("tags", {})
            cname = get_name(tags)
            if not cname:
                continue  # skip unnamed facilities
            lat, lng = get_coords(el)
            if lat is None:
                continue
            key = (cname.lower(), round(lat, 4), round(lng, 4))
            if key in seen:
                continue
            seen.add(key)
            clinics.append({
                "name": cname,
                "address": build_address(tags, name),
                "lat": round(lat, 5),
                "lng": round(lng, 5),
                "type": classify(tags),
            })

        # hospitals first, then alphabetical
        clinics.sort(key=lambda c: (c["type"] != "hospital", c["name"]))
        if MAX_PER_STATE:
            clinics = clinics[:MAX_PER_STATE]

        result[name] = clinics
        print(f"   -> {len(clinics)} kept")
        time.sleep(2)  # be polite to the free server

    write_ts(result)
    total = sum(len(v) for v in result.values())
    print(f"\nDone. {total} facilities across {len(result)} states.")
    print("Wrote clinicsData.ts")


def write_ts(data: dict):
    header = (
        "// Auto-generated from OpenStreetMap via the Overpass API.\n"
        "// Data source: © OpenStreetMap contributors.\n"
        "// Regenerate with: python fetch_clinics.py\n\n"
        "export interface Clinic {\n"
        "  name: string;\n"
        "  address: string;\n"
        "  lat: number;\n"
        "  lng: number;\n"
        "  type: 'clinic' | 'hospital';\n"
        "}\n\n"
        "export const CLINICS_DATA: Record<string, Clinic[]> = "
    )
    body = json.dumps(data, indent=2, ensure_ascii=False)
    with open("clinicsData.ts", "w", encoding="utf-8") as f:
        f.write(header + body + ";\n")


if __name__ == "__main__":
    main()