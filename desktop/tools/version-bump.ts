/**
 * Tool to add a draft entry to versions.json for OTA updates
 * or to create a new version block for native version bumps.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import semver from 'semver';

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(path.dirname(__filename)); // desktop
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
  const releaseType = (process.argv[2] || 'patch') as semver.ReleaseType;


  // 1. Load Changelog
  if (!fs.existsSync(VERSIONS_PATH)) {
    console.error('❌ versions.json not found.');
    process.exit(1);
  }

  const rawData = fs.readFileSync(VERSIONS_PATH, 'utf8');
  const changelog: VersionsJson = JSON.parse(rawData);

  // 2. Process based on mode
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

  // 3. Save
  fs.writeFileSync(VERSIONS_PATH, JSON.stringify(changelog, null, 2));
  console.log('✅ versions.json updated successfully. modify the draft as needed before finalizing.');
};

main();
