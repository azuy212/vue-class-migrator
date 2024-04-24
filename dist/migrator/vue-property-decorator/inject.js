"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.default = (migrationManager) => {
    const { clazz, mainObject } = migrationManager;
    const provideProperties = (0, utils_1.extractPropertiesWithDecorator)(clazz, 'Inject');
    if (provideProperties.length === 0) {
        return;
    }
    const injectObject = (0, utils_1.addPropertyObject)(mainObject, 'inject', '{}');
    provideProperties.forEach((property) => {
        const injectDecoratorArgs = property.getDecoratorOrThrow('Inject').getArguments().at(0);
        const propertyName = property.getName();
        const injectKey = injectDecoratorArgs?.getText() ?? `'${propertyName}'`;
        injectObject.addPropertyAssignment({
            name: propertyName,
            initializer: injectKey,
        });
    });
};
