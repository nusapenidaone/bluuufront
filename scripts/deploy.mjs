#!/usr/bin/env node
// One-shot frontend deploy: build → stage → commit → push.
//
// Usage:
//   npm run deploy -- "commit message"
//   npm run deploy                       (uses a default message)
//
// Notes:
// - Rebuilds the frontend first so the committed build in
//   themes/bluuu/assets/home/ always matches the source in src/.
// - Pushes to whatever branch is currently checked out.
// - PHP files under plugins/ are NOT deployed by git — they go via FTP.

import { execSync } from "node:child_process";

function run(cmd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

function capture(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

// Commit message: everything passed after `--`, or a timestamped default.
const message =
  process.argv.slice(2).join(" ").trim() ||
  `chore: update frontend build (${new Date().toISOString().slice(0, 16).replace("T", " ")})`;

try {
  // 1. Build
  run("npx vite build");

  // 2. Stage everything (source + regenerated build output)
  run("git add -A");

  // 3. Commit — skip cleanly if there's nothing to commit
  const staged = capture("git diff --cached --name-only");
  if (!staged) {
    console.log("\nNothing to commit — working tree already up to date.");
    process.exit(0);
  }
  run(`git commit -m ${JSON.stringify(message)}`);

  // 4. Push to the current branch
  const branch = capture("git rev-parse --abbrev-ref HEAD");
  run(`git push origin ${branch}`);

  console.log(`\n✓ Deployed to origin/${branch}`);
  console.log("  (Reminder: PHP files under plugins/ still deploy via FTP separately.)");
} catch (err) {
  console.error(`\n✗ Deploy failed: ${err.message}`);
  process.exit(1);
}
