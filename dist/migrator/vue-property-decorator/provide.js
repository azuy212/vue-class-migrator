"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_morph_1 = require("ts-morph");
const utils_1 = require("../utils");
const migrate_data_1 = require("../vue-class-component/migrate-data");
exports.default = (migrationManager) => {
    const { clazz, mainObject } = migrationManager;
    const provideClazzMethod = clazz.getMethods().find((method) => method.getName() === 'provide');
    if (provideClazzMethod) {
        throw new Error('A method named "provide" should not be here');
    }
    const provideProperties = (0, utils_1.extractPropertiesWithDecorator)(clazz, 'Provide');
    if (provideProperties.length === 0) {
        return;
    }
    const provideMethodsDeclaration = mainObject.addMethod({
        name: 'provide',
    });
    const provideMethodReturnObject = provideMethodsDeclaration
        .addStatements('return {}')[0]
        .getFirstDescendantByKindOrThrow(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
    const { returnObject } = (0, migrate_data_1.getDataMethod)(clazz, mainObject);
    provideProperties.forEach((property) => {
        const propertyArgs = property.getDecoratorOrThrow('Provide').getArguments()[0];
        const provideValue = property.getInitializerOrThrow().getText();
        const propertyName = property.getName();
        const provideKey = propertyArgs?.getText() ?? `'${propertyName}'`;
        returnObject.addPropertyAssignment({
            name: propertyName,
            initializer: provideValue,
        });
        provideMethodReturnObject.addPropertyAssignment({
            name: provideKey,
            initializer: `this.${propertyName}`,
        });
    });
};
