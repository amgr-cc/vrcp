
type MigrationFile = { 
  file: string, 
  version: number,
  sql: string 
}

// read meda._journal files and generate a single migration file


// read all migration files from a directory and generate a single migration file
function readMigrationFiles(dirPath: string): MigrationFile[] {
  const fs = require('fs');
  const path = require('path');
  const files = fs.readdirSync(dirPath);
  const migrations: MigrationFile[] = files
    .filter((file: string) => file.endsWith('.sql')) // only .sql files
    .map((file: string) => {
      const filePath = path.join(dirPath, file);
      const ver = file.slice(0, 1 + file.indexOf('_')); // extract version number from filename (ex. 0000_migratefidd.sql)
      const sql: string = fs.readFileSync(filePath, 'utf-8');
      return { file, version: parseInt(ver) ?? -1, sql };
    });
  return migrations.sort((a, b) => a.version - b.version); // sort by version number
}

// convert migration file content to a typescript code
function convertToMigrationCode(migrations: MigrationFile[]): string {
  const migrationEntries = migrations.map(mig => {
    const sql = mig.sql.replace(/`/g, '\\`').replace(/\$/g, '\\$'); // escape backticks and dollar signs
    return `  '${mig.file}': {
    version: ${mig.version},
    sql: \`${sql}\`
  },`;
  });
  return `export const migrations = {\n${migrationEntries.join('\n')}\n};`;
}

// write content to file at path
function generateMigrationFile(content: string, path: string): void {
  const fs = require('fs');
  fs.writeFileSync(path, content);
}



function main () {
  try {
    const input = "src/db/migration/drizzle-kit";
    const output = "src/db/migration.ts";
    console.log(`Generating migration file from ${input} to ${output}...`);
    const migrations = readMigrationFiles(input);
    const content = convertToMigrationCode(migrations);
    generateMigrationFile(content, output);
    console.log(`completed to generate ${output}`);
  } catch (error) {
    console.error("Error generating definition file:", error);
  }

}

main();
