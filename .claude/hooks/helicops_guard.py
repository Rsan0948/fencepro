#!/usr/bin/env python3
"""PreToolUse hook: enforce HelicOps MCP pipeline for source/config files."""
import json
import sys

ENFORCED_EXTENSIONS = {
    ".py", ".ts", ".tsx", ".js", ".jsx", ".rs", ".java", ".kt", ".scala",
    ".json", ".toml", ".yaml", ".yml",
}

EXEMPT_PATHS = (
    "/.git/", "/.helicops/cache/", "/.helicops/runtime/", "/.venv/", "/venv/",
    "/__pycache__/", "/node_modules/", "/target/", "/dist/", "/build/",
)

REQUIRED_FLOW = (
    "get_generation_context -> authorize_tool_call -> get_applicable_guardrails -> "
    "propose_write -> validate_write -> commit_write"
)


def normalize(path):
    if not isinstance(path, str) or not path:
        return ""
    path = path.replace("\\", "/")
    return path if path.startswith("/") else "/" + path


def extension(path):
    name = path.rsplit("/", 1)[-1]
    if "." not in name:
        return ""
    return "." + name.rsplit(".", 1)[-1].lower()


def is_enforced(path):
    path = normalize(path)
    if not path:
        return False
    if any(exempt in path for exempt in EXEMPT_PATHS):
        return False
    return extension(path) in ENFORCED_EXTENSIONS


def paths_from_tool_input(tool_input):
    paths = []
    if not isinstance(tool_input, dict):
        return paths
    file_path = tool_input.get("file_path")
    if isinstance(file_path, str):
        paths.append(file_path)
    edits = tool_input.get("edits")
    if isinstance(edits, list):
        for edit in edits:
            if isinstance(edit, dict) and isinstance(edit.get("file_path"), str):
                paths.append(edit["file_path"])
    return paths


def main():
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError as exc:
        json.dump({"decision": "block", "reason": f"Invalid hook payload: {exc}"}, sys.stdout)
        return 0

    blocked_paths = [path for path in paths_from_tool_input(data.get("tool_input", {})) if is_enforced(path)]
    if blocked_paths:
        json.dump({
            "decision": "block",
            "reason": (
                "BLOCKED: Source/config files must go through the HelicOps MCP pipeline. "
                f"Use {REQUIRED_FLOW} instead of Write/Edit/MultiEdit directly. "
                f"Blocked path(s): {', '.join(blocked_paths)}"
            ),
        }, sys.stdout)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
