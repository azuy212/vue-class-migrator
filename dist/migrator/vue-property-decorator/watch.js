"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_morph_1 = require("ts-morph");
const utils_1 = require("../utils");
// @Watcher
exports.default = (migrationManager) => {
    const { clazz } = migrationManager;
    const watchers = clazz.getMethods().filter((m) => m.getDecorator('Watch'));
    watchers.forEach((watcher) => {
        const watcherName = watcher.getName();
        const watcherDecorators = watcher
            .getDecorators()
            .filter((decorator) => decorator.getName() === 'Watch');
        watcherDecorators.forEach((watcherDecorator) => {
            const decoratorArgs = watcherDecorator.getArguments();
            const watchPath = (0, utils_1.stringNodeToSTring)(decoratorArgs[0]);
            const watchOptions = decoratorArgs[1]
                ?.asKindOrThrow(ts_morph_1.SyntaxKind.ObjectLiteralExpression)
                .getText();
            migrationManager.addWatch({
                watchPath,
                watchOptions,
                handlerMethod: watcherName,
            });
        });
        migrationManager.addMethod({
            methodName: watcherName,
            parameters: watcher.getParameters().map((p) => p.getStructure()),
            isAsync: watcher.isAsync(),
            returnType: watcher.getReturnTypeNode()?.getText(),
            statements: watcher.getBodyText() ?? '',
        });
    });
};
