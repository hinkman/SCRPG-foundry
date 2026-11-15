#!/usr/bin/env node
/**
 * Keep system.json "version" and the "download" URL tag in lockstep.
 *
 *   node tools/bump-system-version.mjs --check          # exit 1 on drift
 *   node tools/bump-system-version.mjs 0.9.17           # set version + download
 *   node tools/bump-system-version.mjs --patch          # bump patch (x.y.Z+1)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const systemPath = path.join(root, "system.json");
const DOWNLOAD_TEMPLATE =
    "https://github.com/hinkman/SCRPG-foundry/releases/download/v{version}/scrpg-foundry.zip";

function downloadFor(version) {
    return DOWNLOAD_TEMPLATE.replace("{version}", version);
}

function versionFromDownload(url) {
    const match = String(url ?? "").match(/\/download\/v([^/]+)\/scrpg-foundry\.zip$/);
    return match?.[1] ?? null;
}

function readSystem() {
    return JSON.parse(fs.readFileSync(systemPath, "utf8"));
}

function writeSystem(data) {
    fs.writeFileSync(systemPath, `${JSON.stringify(data, null, 4)}\n`);
}

function bumpPatch(version) {
    const parts = String(version).split(".").map(Number);
    if (parts.length !== 3 || parts.some(n => Number.isNaN(n))) {
        throw new Error(`Cannot auto-bump non-semver version: ${version}`);
    }
    parts[2] += 1;
    return parts.join(".");
}

function check(data) {
    const expected = downloadFor(data.version);
    const fromUrl = versionFromDownload(data.download);
    if (data.download !== expected || fromUrl !== data.version) {
        console.error(
            `system.json version/download mismatch:\n` +
            `  version:  ${data.version}\n` +
            `  download: ${data.download}\n` +
            `  expected: ${expected}`
        );
        process.exit(1);
    }
    console.log(`OK: version ${data.version} matches download URL.`);
}

function setVersion(next) {
    const data = readSystem();
    data.version = next;
    data.download = downloadFor(next);
    writeSystem(data);
    console.log(`Updated system.json to version ${next}`);
    console.log(`download → ${data.download}`);
}

const arg = process.argv[2];
if (!arg || arg === "--check") {
    check(readSystem());
} else if (arg === "--patch") {
    const data = readSystem();
    setVersion(bumpPatch(data.version));
} else if (arg.startsWith("-")) {
    console.error(`Unknown flag: ${arg}`);
    console.error("Usage: bump-system-version.mjs [--check|--patch|<version>]");
    process.exit(1);
} else {
    setVersion(arg);
}
