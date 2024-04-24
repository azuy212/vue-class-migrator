"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const migrator_1 = require("./migrator");
const migrator_2 = require("./migrator/migrator");
const program = new commander_1.Command()
    .option('-d, --directory <string>', 'Directory to migrate')
    .option('-f, --file <string>', 'File to migrate')
    .option('-s, --sfc', 'If you would like to generate a SFC and remove the original scss and ts files', false)
    .action((options) => (options.directory
    ? (0, migrator_1.migrateDirectory)(options.directory, options.sfc)
    : (0, migrator_2.parseAndMigrateFile)(options.file, options.sfc)))
    .parse(process.argv);
exports.default = program;
