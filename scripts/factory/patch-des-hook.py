#!/usr/bin/env python3
"""Work around an nWave 3.22.x bug in the DES pre-bash hook (runner only; ~/.claude is throwaway there).

The hook (nWave scripts/shared/hook_definitions.py, _BASH_EXECUTION_LOG_GUARD, unchanged since v3.3.0) blocks any
Bash command mentioning the DES execution log unless the command text contains
`des.cli.(log_phase|init_log|verify_deliver_integrity)`. But nWave's skills tell agents to run the installer's
wrapper commands (`des-log-phase`, `des-init-log`, `des-verify-integrity`, `des-commit`), which never match, and
`commit` is missing entirely. So nWave's own `des-commit --owned-paths ... <log>` is blocked.

This widens the allow pattern to the wrappers and des.cli.commit. Direct shell edits of the log (sed, echo >, ...)
stay blocked. Usage: patch-des-hook.py [settings.json]   (default ~/.claude/settings.json)
"""
import json
import sys
from pathlib import Path

OLD = "des\\.cli\\.(log_phase|init_log|verify_deliver_integrity)"
NEW = "des\\.cli\\.(log_phase|init_log|verify_deliver_integrity|commit)|des-(log-phase|init-log|verify-integrity|commit)( |$)"

path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / ".claude" / "settings.json"
settings = json.loads(path.read_text())
patched = already = 0
for entry in settings.get("hooks", {}).get("PreToolUse", []):
    for hook in entry.get("hooks", []):
        cmd = hook.get("command", "")
        if not cmd.startswith("# des-hook:pre-bash"):
            continue
        if NEW in cmd:
            already += 1
        elif OLD in cmd:
            hook["command"] = cmd.replace(OLD, NEW)
            patched += 1
path.write_text(json.dumps(settings, indent=2))
print(f"des pre-bash hook: patched {patched}, already patched {already}")
sys.exit(0 if patched or already else 1)  # 1 = hook not found / format changed: check nWave version
