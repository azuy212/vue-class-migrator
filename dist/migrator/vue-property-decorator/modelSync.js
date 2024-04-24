"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
// @ModelSync
exports.default = (migrationManager) => {
    const { clazz } = migrationManager;
    const modelSyncs = (0, utils_1.extractPropertiesWithDecorator)(clazz, 'ModelSync');
    if (modelSyncs.length > 1) {
        throw new Error('Only one @ModelSync allowed.');
    }
    modelSyncs.forEach((modelSync) => {
        const decoratorArgs = modelSync.getDecoratorOrThrow('ModelSync').getArguments();
        if (!decoratorArgs.length) {
            throw new Error('@ModelSync without arguments not supported');
        }
        const propName = (0, utils_1.stringNodeToSTring)(decoratorArgs[0]);
        const eventName = (0, utils_1.stringNodeToSTring)(decoratorArgs[1]);
        const propOptions = decoratorArgs[2];
        const propTsType = modelSync.getTypeNode();
        const propTsTypeText = propTsType?.getText();
        migrationManager.addModel({
            eventName,
            propName,
        });
        migrationManager.addProp({
            propName,
            propNode: propOptions,
            tsType: propTsType,
        });
        migrationManager.addComputedProp({
            name: modelSync.getName(),
            get: {
                statements: `return this.${propName};`,
                returnType: propTsTypeText,
            },
            set: {
                parameters: [{
                        name: 'value',
                        type: propTsTypeText,
                    }],
                statements: `this.$emit('${eventName}', value);`,
            },
        });
    });
};
