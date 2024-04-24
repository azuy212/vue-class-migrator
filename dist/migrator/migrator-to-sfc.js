"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vueFileToSFC = exports.getStyleSrc = exports.getScriptSrc = exports.injectScript = exports.getScriptContent = void 0;
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("./logger"));
const getScriptContent = (vueSourceFile) => {
    const scriptTagRegex = /<script[^>]*>([\s\S]*?)<\/script>/;
    const match = vueSourceFile.getText().match(scriptTagRegex);
    return match ? match[1] : undefined;
};
exports.getScriptContent = getScriptContent;
const injectScript = (tsSourceFile, vueTemplate) => {
    const scriptTag = vueTemplate.match(/<script.*\/>|<script.*>([\s\S]*)<\/script>/);
    if (!scriptTag) {
        throw new Error('Script tag not foung on vue file.');
    }
    return vueTemplate.replace(scriptTag[0], `<script lang="ts">\n${tsSourceFile.getText()}\n</script>`);
};
exports.injectScript = injectScript;
const injectScss = (scssSourceFile, vueTemplate, scoped) => {
    if (!scssSourceFile) {
        return vueTemplate;
    }
    // Match the style tag.
    const styleTag = vueTemplate.match(/<style.*\/>|<style.*>([\s\S]*)<\/style>/);
    if (!styleTag) {
        logger_1.default.warn(`Style file found but style tag not present on vue file. The scss file will be deleted.: ${scssSourceFile.getFilePath()}`);
        return vueTemplate;
    }
    return vueTemplate.replace(styleTag[0], `<style lang="scss"${scoped ? ' scoped' : ''}>\n${scssSourceFile.getText()}\n</style>`);
};
const getScriptSrc = (vueSourceFile) => {
    // Regex that extracts the src from the <script> tag.
    const scriptTagRegex = /<script[^>]+src=["']([^"']+)["'][^>]*>/;
    const match = vueSourceFile.getText().match(scriptTagRegex);
    return match ? match[1] : undefined;
};
exports.getScriptSrc = getScriptSrc;
const getStyleSrc = (vueSourceFile) => {
    // Regex that extracts the src from the <style> tag.
    const styleTagRegex = /<style[^>]+src=["']([^"']+)["'][^>]*>/;
    const match = vueSourceFile.getText().match(styleTagRegex);
    return match ? {
        filePath: match[1],
        scoped: match[0].includes(' scoped '),
    } : undefined;
};
exports.getStyleSrc = getStyleSrc;
const vueFileToSFC = async (project, vueSourceFile) => {
    let vueFileText = vueSourceFile.getText();
    const tsFileRelativePath = (0, exports.getScriptSrc)(vueSourceFile);
    if (tsFileRelativePath) {
        const tsFileAbsolutePath = path_1.default.resolve(vueSourceFile.getDirectoryPath(), tsFileRelativePath);
        const tsSourceFile = project.addSourceFileAtPath(tsFileAbsolutePath);
        vueFileText = (0, exports.injectScript)(tsSourceFile, vueFileText);
        await tsSourceFile.deleteImmediately();
    }
    const styleFileRelativePath = (0, exports.getStyleSrc)(vueSourceFile);
    if (styleFileRelativePath) {
        const styleFileAbsolutePath = path_1.default.resolve(vueSourceFile.getDirectoryPath(), styleFileRelativePath.filePath);
        const styleSourceFile = project.addSourceFileAtPath(styleFileAbsolutePath);
        vueFileText = injectScss(styleSourceFile, vueFileText, styleFileRelativePath.scoped);
        await styleSourceFile.deleteImmediately();
    }
    if (tsFileRelativePath || styleFileRelativePath) {
        vueSourceFile.removeText();
        vueSourceFile.insertText(0, vueFileText);
        await vueSourceFile.save();
    }
    return vueSourceFile;
};
exports.vueFileToSFC = vueFileToSFC;
