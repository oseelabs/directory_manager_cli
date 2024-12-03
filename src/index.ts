#! /usr/bin/env node

const { Command } = require('commander');
const figlet = require('figlet');
const fs = require('fs');
const path = require('path');

const program = new Command();

console.log(figlet.textSync('Dir Manager'));

program
    .version("0.0.1")
    .description('A simple directory manager')
    .option("-l, --ls [filepath]", "List contents of a directory")
    .option("-m, --mkdir <dirname>", "Create a new directory")
    .option("-t, --touch <filename>", "Create a new file")
    .parse(process.argv);

const options = program.opts();

// List Contents of a directory
async function listDirectoryContents(filepath: string = ".") {
    try {
        const files = await fs.promises.readdir(filepath);
        const detailedFilesPromises = files.map(async (file: string) => {
            let fileDetails = await fs.promises.lstat(path.resolve(filepath, file));
            const { size, birthtime } = fileDetails;
            return { filename: file, "size(KB)": size, created_at: birthtime };
        });

        const detailedFiles = await Promise.all(detailedFilesPromises);
        console.table(detailedFiles);
    } catch (error) {
        console.error("Error occurred while reading the directory!", error);  
    }
}

// Create a directory
function createDirectory(filepath: string) {
    if (!fs.existsSync(filepath)) {
        fs.mkdirSync(filepath);
        console.log("Directory created successfully!");
    }
}

// Create a file
function createFile(filepath: string) {
    fs.openSync(filepath, 'w');
    console.log("Empty File created successfully!");
}

// Check if options has been passed
if (options.ls) {
    const filepath = typeof options.ls === 'string' ? options.ls : __dirname;
    listDirectoryContents(filepath);
} else if (options.mkdir) {
    createDirectory(path.resolve(__dirname, options.mkdir));
} else if (options.touch) {
    createFile(path.resolve(__dirname, options.touch));
}

// Showing help page
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
