#!/usr/bin/env bash
set -euo pipefail

config="playwright.config.js"

if [[ ! -f "$config" ]]; then
  echo "precondition failed: $config is missing" >&2
  exit 2
fi

if grep -Eq "trace:[[:space:]]*['\"]on['\"]|screenshot:[[:space:]]*['\"]on['\"]" "$config"; then
  echo "bug present: Playwright records traces/screenshots for every passing test" >&2
  exit 1
fi

if ! grep -Eq "trace:[[:space:]]*['\"]retain-on-failure['\"]" "$config"; then
  echo "precondition failed: expected trace retention to preserve failure evidence" >&2
  exit 2
fi

if ! grep -Eq "screenshot:[[:space:]]*['\"]only-on-failure['\"]" "$config"; then
  echo "precondition failed: expected screenshots to preserve failure evidence" >&2
  exit 2
fi

echo "fixed: Playwright only retains trace/screenshot artifacts for failing tests"
