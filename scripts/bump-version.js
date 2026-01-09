#!/usr/bin/env node
/**
 * Bump Version Script
 *
 * Updates version.json with:
 * - version: 0.X where X = commits since base + 1 (for the upcoming commit)
 * - commit: will be updated after commit
 * - date: current date
 *
 * Run before committing: node scripts/bump-version.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_COMMIT = '0fea415';
const VERSION_FILE = path.join(__dirname, '..', 'version.json');

try {
  // Get current commit count since base
  const currentCount = parseInt(
    execSync(`git rev-list --count ${BASE_COMMIT}..HEAD`).toString().trim(),
    10
  );

  // Next version will be current + 1 (for the upcoming commit)
  const nextVersion = `0.${currentCount + 1}`;

  // Get current commit hash (will be the parent of the new commit)
  const commitHash = execSync('git rev-parse --short HEAD').toString().trim();

  // Get current date
  const today = new Date().toISOString().split('T')[0];

  const versionData = {
    version: nextVersion,
    commit: commitHash,
    date: today,
  };

  fs.writeFileSync(VERSION_FILE, JSON.stringify(versionData, null, 2) + '\n');

  console.log(`Version bumped to ${nextVersion} (commit: ${commitHash}, date: ${today})`);
} catch (error) {
  console.error('Error bumping version:', error.message);
  process.exit(1);
}
