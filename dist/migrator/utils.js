"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringNodeToSTring = exports.extractPropertiesWithDecorator = exports.getArrayProperty = exports.getObjectProperty = exports.addPropertyArray = exports.addPropertyObject = void 0;
const ts_morph_1 = require("ts-morph");
const addPropertyObject = (mainObject, propName, initializer = '{}') => mainObject
    .addPropertyAssignment({
    name: propName,
    initializer,
})
    .getFirstDescendantByKindOrThrow(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
exports.addPropertyObject = addPropertyObject;
const addPropertyArray = (mainObject, propName, initializer = '[]') => mainObject
    .addPropertyAssignment({
    name: propName,
    initializer,
})
    .getFirstDescendantByKindOrThrow(ts_morph_1.SyntaxKind.ArrayLiteralExpression);
exports.addPropertyArray = addPropertyArray;
const getObjectProperty = (mainObject, property) => {
    const computedObject = mainObject
        .getProperty(property)
        ?.getFirstDescendantByKind(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
    if (computedObject) {
        return computedObject;
    }
    return (0, exports.addPropertyObject)(mainObject, property);
};
exports.getObjectProperty = getObjectProperty;
const getArrayProperty = (mainObject, property) => {
    const computedObject = mainObject
        .getProperty(property)
        ?.getFirstDescendantByKind(ts_morph_1.SyntaxKind.ArrayLiteralExpression);
    if (computedObject) {
        return computedObject;
    }
    return (0, exports.addPropertyArray)(mainObject, property);
};
exports.getArrayProperty = getArrayProperty;
const extractPropertiesWithDecorator = (clazz, decoratorName) => clazz
    .getProperties()
    .filter((prop) => prop.getDecorator(decoratorName));
exports.extractPropertiesWithDecorator = extractPropertiesWithDecorator;
const stringNodeToSTring = (nodeOrExpression) => {
    if (nodeOrExpression.isKind(ts_morph_1.SyntaxKind.StringLiteral)
        || nodeOrExpression.isKind(ts_morph_1.SyntaxKind.NoSubstitutionTemplateLiteral)) {
        return nodeOrExpression.getLiteralText();
    }
    throw new Error(`Node is not a string: ${nodeOrExpression.getKindName()}`);
};
exports.stringNodeToSTring = stringNodeToSTring;
