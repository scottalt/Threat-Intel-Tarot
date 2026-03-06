import re

with open('data/cards.ts', encoding='utf-8') as f:
    content = f.read()

# ============================================================
# STEP 1: Fix naming inconsistencies (standardize to MITRE ATT&CK names)
# ============================================================
fixes = [
    # T1003.001 - correct name is "LSASS Memory"
    (r'techniqueId: "T1003\.001", name: "LSASS Memory Credential Dumping"',
     'techniqueId: "T1003.001", name: "LSASS Memory"'),
    # T1036 - correct name is "Masquerading"
    (r'techniqueId: "T1036", name: "Masquerading \(LOLBins\)"',
     'techniqueId: "T1036", name: "Masquerading"'),
    # T1056.001 - correct sub-technique name is "Keylogging"
    (r'techniqueId: "T1056\.001", name: "Input Capture"',
     'techniqueId: "T1056.001", name: "Keylogging"'),
    # T1071.001 - correct name is "Web Protocols"
    (r'techniqueId: "T1071\.001", name: "Web Protocols C2"',
     'techniqueId: "T1071.001", name: "Web Protocols"'),
    # T1136.001 - correct name is "Create Local Account"
    (r'techniqueId: "T1136\.001", name: "Local Account Creation"',
     'techniqueId: "T1136.001", name: "Create Local Account"'),
    # T1566.004 - correct name is "Spearphishing Voice"
    (r'techniqueId: "T1566\.004", name: "Spearphishing Voice \(Vishing\)"',
     'techniqueId: "T1566.004", name: "Spearphishing Voice"'),
    # T1598.003 - correct name is "Spearphishing Link"
    (r'techniqueId: "T1598\.003", name: "Spearphishing Link \(Reconnaissance\)"',
     'techniqueId: "T1598.003", name: "Spearphishing Link"'),
    (r'techniqueId: "T1598\.003", name: "Spearphishing Link for Credentials"',
     'techniqueId: "T1598.003", name: "Spearphishing Link"'),
]

for pattern, replacement in fixes:
    count = len(re.findall(pattern, content))
    content = re.sub(pattern, replacement, content)
    print(f'Fixed {count}x: {replacement}')

# ============================================================
# STEP 2: Fix Bahamut deprecated technique IDs
# ============================================================
content = content.replace(
    '{ techniqueId: "T1436", name: "Commonly Used Port", tactic: "Command and Control" }',
    '{ techniqueId: "T1071.001", name: "Web Protocols", tactic: "Command and Control" }'
)
print('Fixed Bahamut T1436 -> T1071.001')

content = content.replace(
    '{ techniqueId: "T1417", name: "Input Capture", tactic: "Collection" }',
    '{ techniqueId: "T1056.001", name: "Keylogging", tactic: "Collection" }'
)
print('Fixed Bahamut T1417 -> T1056.001')

content = content.replace(
    '{ techniqueId: "T1512", name: "Video Capture", tactic: "Collection" }',
    '{ techniqueId: "T1125", name: "Video Capture", tactic: "Collection" }'
)
print('Fixed Bahamut T1512 -> T1125')

# ============================================================
# STEP 3: Add Privilege Escalation TTPs to cards
# ============================================================
priv_esc_additions = {
    "Equation Group": [
        '{ techniqueId: "T1068", name: "Exploitation for Privilege Escalation", tactic: "Privilege Escalation" }',
    ],
    "APT28": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
        '{ techniqueId: "T1068", name: "Exploitation for Privilege Escalation", tactic: "Privilege Escalation" }',
    ],
    "APT29": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
        '{ techniqueId: "T1068", name: "Exploitation for Privilege Escalation", tactic: "Privilege Escalation" }',
    ],
    "Sandworm": [
        '{ techniqueId: "T1068", name: "Exploitation for Privilege Escalation", tactic: "Privilege Escalation" }',
    ],
    "Turla": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
    ],
    "APT1": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
    ],
    "APT41": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
        '{ techniqueId: "T1068", name: "Exploitation for Privilege Escalation", tactic: "Privilege Escalation" }',
    ],
    "Volt Typhoon": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
    ],
    "Lazarus Group": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
        '{ techniqueId: "T1068", name: "Exploitation for Privilege Escalation", tactic: "Privilege Escalation" }',
    ],
    "APT38": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
    ],
    "Kimsuky": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
    ],
    "APT33": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
    ],
    "APT34": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
    ],
    "APT35": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
    ],
    "FIN7": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
        '{ techniqueId: "T1068", name: "Exploitation for Privilege Escalation", tactic: "Privilege Escalation" }',
    ],
    "REvil": [
        '{ techniqueId: "T1548.002", name: "Bypass User Account Control", tactic: "Privilege Escalation" }',
        '{ techniqueId: "T1068", name: "Exploitation for Privilege Escalation", tactic: "Privilege Escalation" }',
    ],
    "LockBit": [
        '{ techniqueId: "T1068", name: "Exploitation for Privilege Escalation", tactic: "Privilege Escalation" }',
        '{ techniqueId: "T1548.002", name: "Bypass User Account Control", tactic: "Privilege Escalation" }',
    ],
    "Conti": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
        '{ techniqueId: "T1548.002", name: "Bypass User Account Control", tactic: "Privilege Escalation" }',
    ],
    "Scattered Spider": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
    ],
    "BlackCat / ALPHV": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
        '{ techniqueId: "T1068", name: "Exploitation for Privilege Escalation", tactic: "Privilege Escalation" }',
    ],
    "APT10": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
    ],
    "APT40": [
        '{ techniqueId: "T1068", name: "Exploitation for Privilege Escalation", tactic: "Privilege Escalation" }',
    ],
    "Hafnium": [
        '{ techniqueId: "T1068", name: "Exploitation for Privilege Escalation", tactic: "Privilege Escalation" }',
    ],
    "MuddyWater": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
    ],
    "Gamaredon": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
    ],
    "Callisto Group": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
    ],
    "Cl0p": [
        '{ techniqueId: "T1068", name: "Exploitation for Privilege Escalation", tactic: "Privilege Escalation" }',
    ],
    "DarkSide": [
        '{ techniqueId: "T1548.002", name: "Bypass User Account Control", tactic: "Privilege Escalation" }',
        '{ techniqueId: "T1068", name: "Exploitation for Privilege Escalation", tactic: "Privilege Escalation" }',
    ],
    "Hive": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
    ],
    "BlackMatter": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
        '{ techniqueId: "T1068", name: "Exploitation for Privilege Escalation", tactic: "Privilege Escalation" }',
    ],
    "Carbanak": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
    ],
    "TrickBot / Ryuk": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
        '{ techniqueId: "T1548.002", name: "Bypass User Account Control", tactic: "Privilege Escalation" }',
    ],
    "FIN6": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
    ],
    "IcedID / Bokbot": [
        '{ techniqueId: "T1068", name: "Exploitation for Privilege Escalation", tactic: "Privilege Escalation" }',
    ],
    "UNC2452": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
        '{ techniqueId: "T1068", name: "Exploitation for Privilege Escalation", tactic: "Privilege Escalation" }',
    ],
    "Lapsus$": [
        '{ techniqueId: "T1548.002", name: "Bypass User Account Control", tactic: "Privilege Escalation" }',
    ],
    "UNC3944": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
    ],
    "TA505": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
    ],
    "FIN4": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
    ],
    "FIN8": [
        '{ techniqueId: "T1134", name: "Access Token Manipulation", tactic: "Privilege Escalation" }',
    ],
}

added_count = 0
for card_name, new_ttps in priv_esc_additions.items():
    escaped = re.escape(card_name)
    pattern = re.compile(
        r'(name: "' + escaped + r'".*?ttps: \[)(.*?)(\],\s*\n\s*notableOps)',
        re.DOTALL
    )

    def make_adder(ttps):
        def add_ttps(m):
            prefix = m.group(1)
            ttps_content = m.group(2)
            suffix = m.group(3)
            indent = '      '
            additions = '\n' + '\n'.join(f'{indent}{t},' for t in ttps)
            return prefix + ttps_content + additions + '\n    ' + suffix
        return add_ttps

    new_content = pattern.sub(make_adder(new_ttps), content, count=1)
    if new_content != content:
        content = new_content
        added_count += 1
        print(f'Added {len(new_ttps)} Priv Esc TTP(s) to {card_name}')
    else:
        print(f'WARNING: Could not find card: {card_name}')

print(f'\nTotal cards updated with Priv Esc: {added_count}')

with open('data/cards.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done writing data/cards.ts')
