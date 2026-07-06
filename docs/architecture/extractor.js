const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const OUTPUT_FILE = path.join(__dirname, 'phase1_inventory.json');

const EXCLUDE_DIRS = ['node_modules', '.next', '.git', 'migrations', 'uploads', 'data', 'models', '__pycache__', 'venv', 'env', '.venv', 'build', 'dist', 'playwright-report'];

function getDomainFromPath(filePath) {
    const l = filePath.toLowerCase();
    if (l.includes('auth') || l.includes('user') || l.includes('profile')) return 'D1 - User & Identity';
    if (l.includes('lesson') || l.includes('step') || l.includes('roadmap') || l.includes('learning-path') || l.includes('quiz') || l.includes('project')) return 'D2 - LMS';
    if (l.includes('community') || l.includes('post') || l.includes('report') || l.includes('comment')) return 'D3 - Community';
    if (l.includes('job') || l.includes('career')) return 'D4 - Career';
    if (l.includes('ai') || l.includes('recommendation') || l.includes('feedback')) return 'D5 - AI Engine';
    if (l.includes('chat') || l.includes('notification')) return 'D6 - Communication';
    if (l.includes('admin')) return 'D7 - System Administration';
    if (l.includes('n8n') || l.includes('sync')) return 'D9 - Platform Operations';
    return 'D8 - Cross-Cutting Operations';
}

function getLayerFromPath(filePath) {
    const l = filePath.toLowerCase();
    if (l.includes('controllers') || l.includes('routes')) return 'Presentation Layer';
    if (l.includes('services')) return 'Service Layer';
    if (l.includes('middleware')) return 'Security Layer';
    if (l.includes('prisma') || l.includes('schema.prisma')) return 'Data Access Layer';
    if (l.includes('components') || l.includes('app/') || l.includes('pages/')) return 'UI Layer';
    if (l.includes('hooks')) return 'UI Logic Layer';
    if (l.includes('context') || l.includes('store')) return 'State Management Layer';
    if (l.includes('utils') || l.includes('config') || l.includes('lib')) return 'Infrastructure Layer';
    return 'Core/Domain Layer';
}

function extractItemsFromFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const items = [];
    const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
    const domain = getDomainFromPath(relPath);
    const layer = getLayerFromPath(relPath);

    if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        const regexes = [
            { type: 'Component/Function', re: /export\s+(?:default\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(/g },
            { type: 'Arrow Function', re: /export\s+const\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[^=]*)\s*=>/g },
            { type: 'Class', re: /export\s+(?:default\s+)?class\s+([a-zA-Z0-9_]+)/g },
            { type: 'Route/Endpoint', re: /router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g },
            { type: 'Controller Method', re: /exports\.([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[^=]*)\s*=>/g }
        ];

        regexes.forEach(({ type, re }) => {
            let match;
            while ((match = re.exec(content)) !== null) {
                let name = match[1];
                if (type === 'Route/Endpoint') {
                    name = `[${match[1].toUpperCase()}] ${match[2]}`;
                }
                items.push({
                    "Module Name": path.basename(filePath),
                    "File Path": relPath,
                    "Function/Class Name": name,
                    "Type": type,
                    "Domain": domain,
                    "Layer": layer,
                    "Concerns": [],
                    "Params": "",
                    "Returns": "",
                    "Dependencies": [],
                    "Endpoints": type === 'Route/Endpoint' ? [name] : [],
                    "Description": "Extracted automatically",
                    "Complexity": "Low"
                });
            }
        });
    }

    if (filePath.endsWith('.py')) {
        const regexes = [
            { type: 'Function', re: /def\s+([a-zA-Z0-9_]+)\s*\(/g },
            { type: 'Class', re: /class\s+([a-zA-Z0-9_]+)\s*(?:\([^)]*\))?:/g },
            { type: 'FastAPI Endpoint', re: /@app\.(get|post|put|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g }
        ];

        regexes.forEach(({ type, re }) => {
            let match;
            while ((match = re.exec(content)) !== null) {
                let name = match[1];
                if (type === 'FastAPI Endpoint') {
                    name = `[${match[1].toUpperCase()}] ${match[2]}`;
                }
                items.push({
                    "Module Name": path.basename(filePath),
                    "File Path": relPath,
                    "Function/Class Name": name,
                    "Type": type,
                    "Domain": domain,
                    "Layer": layer,
                    "Concerns": [],
                    "Params": "",
                    "Returns": "",
                    "Dependencies": [],
                    "Endpoints": type === 'FastAPI Endpoint' ? [name] : [],
                    "Description": "Extracted automatically",
                    "Complexity": "Low"
                });
            }
        });
    }

    return items;
}

function walkDir(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (EXCLUDE_DIRS.includes(file)) continue;
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            walkDir(filePath, fileList);
        } else {
            if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.py')) {
                fileList.push(filePath);
            }
        }
    }
    return fileList;
}

const allFiles = walkDir(ROOT_DIR);
let inventory = [];

allFiles.forEach(file => {
    try {
        const items = extractItemsFromFile(file);
        if (items.length > 0) {
            inventory = inventory.concat(items);
        }
    } catch (e) {
        console.error(`Error processing ${file}: ${e.message}`);
    }
});

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(inventory, null, 2));
console.log(`Successfully extracted ${inventory.length} items to ${OUTPUT_FILE}`);
