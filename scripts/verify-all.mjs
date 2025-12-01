import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

function log(message, type = 'info') {
    if (type === 'error') console.log(`${RED}${message}${RESET}`);
    else if (type === 'success') console.log(`${GREEN}${message}${RESET}`);
    else console.log(message);
}

function runCommand(command) {
    try {
        log(`Running: ${command}`);
        execSync(command, { stdio: 'inherit' });
        log(`Success: ${command}`, 'success');
        return true;
    } catch (error) {
        log(`Failed: ${command}`, 'error');
        return false;
    }
}

function checkFileExists(filePath) {
    if (fs.existsSync(filePath)) {
        log(`Found: ${filePath}`, 'success');
        return true;
    } else {
        log(`Missing: ${filePath}`, 'error');
        return false;
    }
}

async function main() {
    log('Starting verification...');

    // 1. Check critical files
    const criticalFiles = [
        '.env',
        'package.json',
        'next.config.ts',
        'src/app/layout.tsx',
        'src/app/page.tsx',
    ];

    let filesOk = true;
    for (const file of criticalFiles) {
        if (!checkFileExists(file)) filesOk = false;
    }

    // 2. Run Lint
    const lintOk = runCommand('npm run lint');

    // 3. Run Build
    const buildOk = runCommand('npm run build');

    // 4. Check for TODOs (simple grep)
    // We won't fail on this, just warn
    try {
        const todoOutput = execSync('grep -r "TODO" src || true', { encoding: 'utf-8' });
        if (todoOutput.trim()) {
            log('WARNING: Found TODOs in src:', 'info');
            console.log(todoOutput);
        }
    } catch (e) {
        // grep might not be available or fail
    }

    if (filesOk && lintOk && buildOk) {
        log('ALL CHECKS PASSED', 'success');
        process.exit(0);
    } else {
        log('SOME CHECKS FAILED', 'error');
        process.exit(1);
    }
}

main();
