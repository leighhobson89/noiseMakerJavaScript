const fs = require('fs-extra');
const path = require('path');

const rootDir = __dirname; // Root directory of the project
const outputDir = path.join(rootDir, 'www'); // Target directory
const androidDir = path.join(rootDir, 'android'); // Android directory
const ignoreList = [
    'noiseMakerJavascriptDesktop',
    '.gitignore',
    'node_modules',
    'utilities',
    '.git',
    'capacitor.config.json',
    'package.json',
    'package-lock.json',
    'www'
];

// Function to determine if a file or directory should be ignored
function shouldIgnore(file) {
    return ignoreList.some(ignoreItem => file.includes(ignoreItem));
}

async function build() {
    try {
        console.log('Deleting Android folder...');
        if (await fs.pathExists(androidDir)) {
            await fs.remove(androidDir); // Delete the android directory
            console.log('Android folder deleted.');
        } else {
            console.log('Android folder does not exist.');
        }

        console.log('Clearing target directory...');
        await fs.emptyDir(outputDir); // Clear the www directory

        console.log('Copying files...');
        const copyRecursive = async (source, destination) => {
            const items = await fs.readdir(source);
            for (const item of items) {
                const sourcePath = path.join(source, item);
                const destinationPath = path.join(destination, item);

                if (shouldIgnore(sourcePath)) {
                    console.log(`Ignoring: ${sourcePath}`);
                    continue;
                }

                const stats = await fs.stat(sourcePath);
                if (stats.isDirectory()) {
                    await fs.ensureDir(destinationPath);
                    await copyRecursive(sourcePath, destinationPath);
                } else {
                    await fs.copy(sourcePath, destinationPath);
                }
            }
        };

        await copyRecursive(rootDir, outputDir);

        console.log('Build complete! Files copied to the www directory.');
    } catch (error) {
        console.error('Error during build:', error);
    }
}

build();
