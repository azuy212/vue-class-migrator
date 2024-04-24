"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAndMigrateFile = exports.migrateDirectory = exports.migrateFile = void 0;
const path_1 = __importDefault(require("path"));
const ts_morph_1 = require("ts-morph");
const logger_1 = __importDefault(require("./logger"));
const vue_class_component_1 = __importDefault(require("./vue-class-component"));
const vue_property_decorator_1 = __importDefault(require("./vue-property-decorator"));
const vuex_1 = __importDefault(require("./vuex"));
const migrator_to_sfc_1 = require("./migrator-to-sfc");
const migratorManager_1 = require("./migratorManager");
const migrateTsFile = async (project, sourceFile) => {
    const filePath = sourceFile.getFilePath();
    const { name, ext } = path_1.default.parse(path_1.default.basename(filePath));
    const outPath = path_1.default.join(path_1.default.dirname(filePath), `${name}_migrated${ext}`);
    const outFile = project.createSourceFile(outPath, sourceFile.getText(), { overwrite: true });
    try {
        const migrationManager = (0, migratorManager_1.createMigrationManager)(sourceFile, outFile);
        (0, vue_class_component_1.default)(migrationManager);
        (0, vue_property_decorator_1.default)(migrationManager);
        (0, vuex_1.default)(migrationManager);
    }
    catch (error) {
        await outFile.deleteImmediately();
        throw error;
    }
    return outFile.moveImmediately(sourceFile.getFilePath(), { overwrite: true });
};
const migrateVueFile = async (project, vueSourceFile) => {
    const scriptContent = (0, migrator_to_sfc_1.getScriptContent)(vueSourceFile);
    if (!scriptContent) {
        throw new Error('Unable to extract script tag content');
    }
    const filePath = vueSourceFile.getFilePath();
    const { name } = path_1.default.parse(path_1.default.basename(filePath));
    const outPath = path_1.default.join(path_1.default.dirname(filePath), `${name}_temp_migrated.ts`);
    let outFile = project.createSourceFile(outPath, scriptContent, { overwrite: true });
    try {
        outFile = await migrateTsFile(project, outFile);
        const vueFileText = vueSourceFile.getText();
        vueSourceFile.removeText();
        vueSourceFile.insertText(0, (0, migrator_to_sfc_1.injectScript)(outFile, vueFileText));
        await vueSourceFile.save();
        return vueSourceFile;
    }
    finally {
        await outFile.deleteImmediately();
    }
};
const migrateFile = async (project, sourceFile) => {
    logger_1.default.info(`Migrating ${sourceFile.getBaseName()}`);
    if (!sourceFile.getText().includes('@Component')) {
        throw new Error('File already migrated');
    }
    const ext = sourceFile.getExtension();
    if (ext === '.ts') {
        return migrateTsFile(project, sourceFile);
    }
    if (ext === '.vue') {
        return migrateVueFile(project, sourceFile);
    }
    throw new Error(`Extension ${ext} not supported`);
};
exports.migrateFile = migrateFile;
const migrateDirectory = async (directoryPath, toSFC) => {
    const directoryToMigrate = path_1.default.resolve(process.cwd(), directoryPath);
    const project = new ts_morph_1.Project({});
    project.addSourceFilesAtPaths(`${directoryToMigrate}/**/*.(ts|vue|scss)`)
        .filter((sourceFile) => !['.vue', '.ts'].includes(sourceFile.getExtension())
        || sourceFile.getFilePath().includes('node_modules'))
        .forEach((file) => project.removeSourceFile(file));
    const finalFilesToMigrate = project
        .getSourceFiles()
        .filter((file) => ['.vue', '.ts'].includes(file.getExtension())
        && !file.getFilePath().includes('node_modules')
        && file.getText().includes('@Component'));
    logger_1.default.info(`Migrating directory: ${directoryToMigrate}, ${finalFilesToMigrate.length} Files needs migration`);
    const migrationPromises = finalFilesToMigrate
        .map((sourceFile, index) => {
        logger_1.default.info(`Progress: ${index + 1}/${finalFilesToMigrate.length} (${Math.round(((index + 1) / finalFilesToMigrate.length) * 100)}%)`);
        return (0, exports.migrateFile)(project, sourceFile)
            .catch((err) => {
            logger_1.default.error(`Error migrating ${sourceFile.getFilePath()}`);
            logger_1.default.error(err);
            return Promise.reject(err);
        });
    });
    try {
        await Promise.all(migrationPromises);
    }
    catch (error) {
        return;
    }
    if (toSFC) {
        const vueFiles = project
            .getSourceFiles()
            .filter((file) => ['.vue'].includes(file.getExtension()));
        logger_1.default.info(`Migrating directory: ${directoryToMigrate}, files to SFC`);
        await Promise.all(vueFiles.map((f) => (0, migrator_to_sfc_1.vueFileToSFC)(project, f)));
    }
};
exports.migrateDirectory = migrateDirectory;
const parseAndMigrateFile = async (filePath, toSFC) => {
    const fileToMigrate = path_1.default.resolve(process.cwd(), filePath);
    const project = new ts_morph_1.Project();
    const sourceFile = project.addSourceFileAtPath(fileToMigrate);
    if (!['.vue', '.ts'].includes(sourceFile.getExtension())) {
        throw new Error('Only Vue or TS files are supported');
    }
    if (!sourceFile.getText().includes('@Component')) {
        throw new Error('File doesn\'t seems to be a Vue Class Component');
    }
    try {
        await (0, exports.migrateFile)(project, sourceFile);
    }
    catch (error) {
        return;
    }
    if (toSFC) {
        if (sourceFile.getExtension() !== '.vue') {
            throw new Error('Only Vue files are supported with SFC option');
        }
        await (0, migrator_to_sfc_1.vueFileToSFC)(project, sourceFile);
    }
};
exports.parseAndMigrateFile = parseAndMigrateFile;
