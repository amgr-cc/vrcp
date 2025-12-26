/**
 * Tool to add a draft entry to versions.json for OTA updates
 * or to create a new version block for native version bumps.
 */
import fs from 'fs';
import path from 'path';
import semver from 'semver';
import { fileURLToPath } from 'url';

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(path.dirname(__filename)); // mobile
const VERSIONS_PATH = path.join(__dirname, 'versions.json');

// --- Types ---
interface UpdateEntry {
  date: string;
  message: string;
}

interface VersionBlock {
  nativeVersion: string;
  updates: UpdateEntry[];
}

interface VersionsJson {
  versions: VersionBlock[];
}

// --- Helpers ---
const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

const main = () => {
  const mode = process.argv[2]; // 'ota' | 'native'
  const releaseType = (process.argv[3] || 'patch') as semver.ReleaseType;

  if (!['ota', 'native'].includes(mode)) {
    console.error('❌ Usage: npx tsx tools/version-bump.ts [ota|native] (patch|minor|major)');
    process.exit(1);
  }

  // 1. Load Changelog
  if (!fs.existsSync(VERSIONS_PATH)) {
    console.error('❌ versions.json not found.');
    process.exit(1);
  }

  const rawData = fs.readFileSync(VERSIONS_PATH, 'utf8');
  const changelog: VersionsJson = JSON.parse(rawData);

  // 2. Process based on mode
  if (mode === 'ota') {
    // === OTA Mode ===
    // Add a new update entry to the TOP of the current native version
    console.log('Adding new draft for OTA update...');

    const currentVersionBlock = changelog.versions[0];

    const newUpdate: UpdateEntry = {
      date: getToday(),
      message: "[Draft] New OTA update description"
    };

    // Add to the beginning of the updates array
    currentVersionBlock.updates.unshift(newUpdate);

    console.log(`Added draft to version ${currentVersionBlock.nativeVersion}`);

  } else if (mode === 'native') {
    // === Native Mode ===
    // Create a whole new version block
    console.log(`Preparing new native version (${releaseType})...`);

    const currentVer = changelog.versions[0].nativeVersion;
    const nextVer = semver.inc(currentVer, releaseType);

    if (!nextVer) {
      console.error(`❌ Failed to increment version from ${currentVer}`);
      process.exit(1);
    }

    const newVersionBlock: VersionBlock = {
      nativeVersion: nextVer,
      updates: [
        {
          date: getToday(),
          message: `[Draft] Initial release for v${nextVer}`
        }
      ]
    };

    // Add to the beginning of the versions array
    changelog.versions.unshift(newVersionBlock);

    console.log(`Created new native version block: ${nextVer}`);
  }

  // 3. Save
  fs.writeFileSync(VERSIONS_PATH, JSON.stringify(changelog, null, 2));
  console.log('✅ versions.json updated successfully. modify the draft as needed before finalizing.');
};

main();
