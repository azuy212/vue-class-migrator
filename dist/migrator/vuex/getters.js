"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_morph_1 = require("ts-morph");
const utils_1 = require("../utils");
const supportedGetterOptions = ['namespace']; // @Getter("", {...})
exports.default = (migrationManager) => {
    // Vuex getters are computed properties
    const { clazz } = migrationManager;
    const vuexGetters = (0, utils_1.extractPropertiesWithDecorator)(clazz, 'Getter');
    if (vuexGetters.length) {
        vuexGetters.forEach((vuexGetter) => {
            const decoratorArgs = vuexGetter.getDecoratorOrThrow('Getter').getArguments();
            const getterMethodName = decoratorArgs[0]
                ? (0, utils_1.stringNodeToSTring)(decoratorArgs[0])
                : vuexGetter.getName();
            const getterOptions = decoratorArgs[1]?.asKindOrThrow(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
            const namespace = getterOptions?.getProperty('namespace')
                ?.asKindOrThrow(ts_morph_1.SyntaxKind.PropertyAssignment)
                .getInitializerIfKindOrThrow(ts_morph_1.SyntaxKind.StringLiteral)
                .getLiteralText();
            getterOptions?.getProperties().forEach((prop) => {
                if (prop.isKind(ts_morph_1.SyntaxKind.PropertyAssignment)
                    && !supportedGetterOptions.includes(prop.getName())) {
                    throw new Error(`@Getter option ${prop.getName()} not supported.`);
                }
            });
            const propertyType = vuexGetter.getTypeNode()?.getText();
            const getterName = (namespace ? [namespace, getterMethodName].join('/') : getterMethodName);
            migrationManager.addComputedProp({
                name: vuexGetter.getName(),
                returnType: propertyType,
                statements: `return this.$store.getters["${getterName}"];`,
            });
        });
    }
};
