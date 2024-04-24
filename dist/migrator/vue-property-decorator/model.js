"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
// @Model
exports.default = (migrationManager) => {
    const { clazz } = migrationManager;
    const models = (0, utils_1.extractPropertiesWithDecorator)(clazz, 'Model');
    models.forEach((model) => {
        const decoratorArgs = model.getDecoratorOrThrow('Model').getArguments();
        const propName = model.getName();
        const eventName = (0, utils_1.stringNodeToSTring)(decoratorArgs[0]);
        const propOptions = decoratorArgs[1];
        const propTsType = model.getTypeNode();
        migrationManager.addModel({
            eventName,
            propName,
        });
        migrationManager.addProp({
            propName,
            propNode: propOptions,
            tsType: propTsType,
        });
    });
};
