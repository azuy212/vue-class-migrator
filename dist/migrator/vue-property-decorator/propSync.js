"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
// @PropSync
exports.default = (migrationManager) => {
    const { clazz } = migrationManager;
    const propSyncs = (0, utils_1.extractPropertiesWithDecorator)(clazz, 'PropSync');
    propSyncs.forEach((propSync) => {
        const decoratorArgs = propSync.getDecoratorOrThrow('PropSync').getArguments();
        if (!decoratorArgs.length) {
            throw new Error('@PropSync without arguments not supported');
        }
        const propName = (0, utils_1.stringNodeToSTring)(decoratorArgs[0]);
        const propTsType = propSync.getTypeNode();
        const propTsTypeText = propTsType?.getText();
        migrationManager.addProp({
            propName,
            propNode: decoratorArgs[1],
            tsType: propTsType,
        });
        migrationManager.addComputedProp({
            name: propSync.getName(),
            get: {
                statements: `return this.${propName};`,
                returnType: propTsTypeText,
            },
            set: {
                parameters: [{
                        name: 'value',
                        type: propTsTypeText,
                    }],
                statements: `this.$emit('update:${propName}', value);`,
            },
        });
    });
};
