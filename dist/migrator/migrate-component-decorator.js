"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_morph_1 = require("ts-morph");
exports.default = (clazz) => {
    const decorator = clazz.getDecorator('Component');
    if (!decorator) {
        throw new Error(`Class ${clazz.getName()} doesn't have a component decorator.`);
    }
    const componentProperties = decorator
        .getArguments()
        .pop()
        ?.asKindOrThrow(ts_morph_1.SyntaxKind.ObjectLiteralExpression, '@Component props argument should be and object {}');
    const dataProp = componentProperties?.getProperty('data');
    if (dataProp
        && ![
            ts_morph_1.SyntaxKind.MethodDeclaration,
            ts_morph_1.SyntaxKind.PropertyAssignment,
        ].some((kind) => dataProp.isKind(kind))) {
        throw new Error(`@Component Data prop should be an object or a method. Type: ${dataProp.getKindName()}`);
    }
    return componentProperties?.getText() ?? '{}';
};
