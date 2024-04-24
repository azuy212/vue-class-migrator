"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
// @Prop
exports.default = (migrationManager) => {
    const { clazz } = migrationManager;
    const props = (0, utils_1.extractPropertiesWithDecorator)(clazz, 'Prop');
    props.forEach((prop) => {
        const decoratorArgs = prop.getDecoratorOrThrow('Prop').getArguments();
        const propOptions = decoratorArgs[0];
        const propTsType = prop.getTypeNode();
        migrationManager.addProp({
            propName: prop.getName(),
            propNode: propOptions,
            tsType: propTsType,
        });
    });
};
