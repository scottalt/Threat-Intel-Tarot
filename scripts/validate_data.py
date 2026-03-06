"""
Validation pipeline for Threat Intelligence Tarot card data.
Checks: technique ID format, tactic names, name consistency, deprecated IDs,
        duplicate techniques per card, tactic coverage.
"""
import re
import sys

with open('data/cards.ts', encoding='utf-8') as f:
    content = f.read()

errors = []
warnings = []

# ── 1. Extract all TTPs ────────────────────────────────────────────────────
pattern = re.compile(
    r'techniqueId: "([^"]+)",\s*name: "([^"]+)",\s*tactic: "([^"]+)"'
)
all_ttps = pattern.findall(content)
print(f"Total TTP entries: {len(all_ttps)}")

# ── 2. Valid MITRE ATT&CK tactic names ────────────────────────────────────
VALID_TACTICS = {
    "Reconnaissance", "Resource Development", "Initial Access", "Execution",
    "Persistence", "Privilege Escalation", "Defense Evasion", "Credential Access",
    "Discovery", "Lateral Movement", "Collection", "Command and Control",
    "Exfiltration", "Impact",
}

# ── 3. Technique ID format check ──────────────────────────────────────────
for tid, name, tactic in all_ttps:
    if not re.match(r'^T\d{4}(\.\d{3})?$', tid):
        errors.append(f"BAD FORMAT: {tid} (name={name})")

# ── 4. Tactic name validity ────────────────────────────────────────────────
for tid, name, tactic in all_ttps:
    if tactic not in VALID_TACTICS:
        errors.append(f"INVALID TACTIC: '{tactic}' on {tid} ({name})")

# ── 5. Consistency: same technique ID => same name and tactic ─────────────
by_id = {}
for tid, name, tactic in all_ttps:
    if tid not in by_id:
        by_id[tid] = {'names': set(), 'tactics': set()}
    by_id[tid]['names'].add(name)
    by_id[tid]['tactics'].add(tactic)

# T1078 is legitimately multi-tactic in MITRE ATT&CK
MULTI_TACTIC_OK = {'T1078', 'T1055'}

for tid, data in sorted(by_id.items()):
    if len(data['names']) > 1:
        errors.append(f"INCONSISTENT NAME: {tid} has names {data['names']}")
    if len(data['tactics']) > 1 and tid not in MULTI_TACTIC_OK:
        errors.append(f"INCONSISTENT TACTIC: {tid} has tactics {data['tactics']}")

# ── 6. Deprecated/wrong-context IDs ───────────────────────────────────────
DEPRECATED = {
    'T1436': 'Deprecated. Enterprise Commonly Used Port was replaced. Use T1571.',
    'T1417': 'Mobile-only technique. Enterprise equivalent: T1056.001.',
    'T1512': 'Deprecated Enterprise Video Capture. Use T1125.',
    'T1043': 'Deprecated.',
}
for tid in DEPRECATED:
    matches = [(t, n, tac) for t, n, tac in all_ttps if t == tid]
    if matches:
        for t, n, tac in matches:
            errors.append(f"DEPRECATED ID: {tid} ({n}) - {DEPRECATED[tid]}")

# ── 7. Duplicate technique IDs within a single card ───────────────────────
card_blocks = re.split(r'\n  \{', content)
for block in card_blocks:
    name_m = re.search(r'name: "([^"]+)"', block)
    if not name_m:
        continue
    card_name = name_m.group(1)
    ids = re.findall(r'techniqueId: "([^"]+)"', block)
    # Only check within actual ttps array
    if 'ttps:' not in block:
        continue
    seen = set()
    for tid in ids:
        if tid in seen:
            errors.append(f"DUPLICATE TTP: {card_name} has {tid} more than once")
        seen.add(tid)

# ── 8. Tactic coverage ────────────────────────────────────────────────────
present_tactics = {tac for _, _, tac in all_ttps}
missing_tactics = VALID_TACTICS - present_tactics
if missing_tactics:
    warnings.append(f"Missing tactics from full deck: {sorted(missing_tactics)}")

# ── 9. Card count ─────────────────────────────────────────────────────────
slugs = re.findall(r'slug: "([^"]+)"', content)
print(f"Card count: {len(slugs)}")

# ── 10. Technique stats ───────────────────────────────────────────────────
tactic_counts = {}
for _, _, tac in all_ttps:
    tactic_counts[tac] = tactic_counts.get(tac, 0) + 1

print("\n=== TACTIC COVERAGE ===")
for tac in sorted(VALID_TACTICS):
    cnt = tactic_counts.get(tac, 0)
    status = "✓" if cnt > 0 else "✗ MISSING"
    print(f"  {status}  {tac}: {cnt} uses")

print(f"\nUnique technique IDs: {len(by_id)}")
print(f"Total TTP uses: {len(all_ttps)}")

# ── Report ────────────────────────────────────────────────────────────────
print("\n=== VALIDATION REPORT ===")
if errors:
    print(f"ERRORS ({len(errors)}):")
    for e in errors:
        print(f"  ✗ {e}")
else:
    print("  ✓ No errors found")

if warnings:
    print(f"\nWARNINGS ({len(warnings)}):")
    for w in warnings:
        print(f"  ! {w}")
else:
    print("  ✓ No warnings")

print()
if errors:
    sys.exit(1)
else:
    print("VALIDATION PASSED")
    sys.exit(0)
