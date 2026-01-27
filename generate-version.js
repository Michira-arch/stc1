import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const version = Date.now().toString();

const versionData = {
    version: version,
    buildDate: new Date().toISOString()
};

const publicDir = path.join(__dirname, 'public');

if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

const filePath = path.join(publicDir, 'version.json');

fs.writeFileSync(filePath, JSON.stringify(versionData, null, 2));

console.log(`Version ${version} generated at ${filePath}`);
