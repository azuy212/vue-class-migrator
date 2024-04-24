"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
// @Ref
exports.default = (migrationManager) => {
    const { clazz } = migrationManager;
    const refs = (0, utils_1.extractPropertiesWithDecorator)(clazz, 'Ref');
    refs.forEach((reference) => {
        const decoratorArgs = reference.getDecoratorOrThrow('Ref').getArguments();
        const refName = decoratorArgs[0]
            ? (0, utils_1.stringNodeToSTring)(decoratorArgs[0])
            : reference.getName();
        const refType = reference.getTypeNode()?.getText() ?? 'any';
        const refStatement = `this.$refs["${refName}"]`;
        migrationManager.addComputedProp({
            name: reference.getName(),
            cache: false,
            get: {
                statements: `return ${refStatement}${refType ? ` as ${refType}` : ''};`,
            },
            set: {
                statements: undefined,
                parameters: undefined,
            },
        });
    });
};
