"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_morph_1 = require("ts-morph");
const utils_1 = require("../utils");
exports.default = (clazz, mainObject) => {
    const setters = clazz.getSetAccessors();
    // Setters become watched properties.
    if (setters.length) {
        let watcherMainObject;
        setters.forEach((setter) => {
            const setterName = setter.getName();
            if (clazz.getGetAccessor(setterName)) {
                const computedMainObject = (0, utils_1.getObjectProperty)(mainObject, 'computed');
                const setterProperty = computedMainObject.getProperty(setterName);
                let propObject;
                if (!setterProperty) {
                    propObject = computedMainObject.addPropertyAssignment({
                        name: setterName,
                        initializer: '{}',
                    }).getFirstDescendantByKind(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
                }
                else {
                    propObject = setterProperty
                        .getFirstDescendantByKindOrThrow(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
                    propObject.addMethod({
                        name: 'set',
                        parameters: setter.getParameters().map((p) => p.getStructure()),
                        returnType: setter.getReturnTypeNode()?.getText(),
                        statements: setter.getBodyText(),
                    });
                }
            }
            else {
                if (!watcherMainObject) {
                    watcherMainObject = (0, utils_1.getObjectProperty)(mainObject, 'watch');
                }
                const watcherObject = watcherMainObject
                    .addPropertyAssignment({
                    name: setter.getName(),
                    initializer: '{}',
                })
                    .getFirstDescendantByKindOrThrow(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
                watcherObject.addMethod({
                    name: 'handler',
                    parameters: setter.getParameters().map((p) => p.getStructure()),
                    returnType: setter.getReturnTypeNode()?.getText(),
                    statements: setter.getBodyText(),
                });
            }
        });
    }
};
