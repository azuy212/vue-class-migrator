"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataMethod = void 0;
const ts_morph_1 = require("ts-morph");
const getDataMethod = (clazz, mainObject) => {
    const componentDecoratorDataMethod = mainObject.getProperty('data');
    const clazzDataMethod = clazz.getMethod('data');
    if (clazzDataMethod) {
        // From class data method
        const dataMethod = mainObject.addMethod({
            name: 'data',
            parameters: clazzDataMethod.getParameters().map((p) => p.getStructure()),
            isAsync: clazzDataMethod.isAsync(),
            returnType: clazzDataMethod.getReturnTypeNode()?.getText(),
            statements: clazzDataMethod.getBodyText(),
        });
        const returnObject = dataMethod
            .getStatementByKind(ts_morph_1.SyntaxKind.ReturnStatement)
            ?.getFirstDescendantByKindOrThrow(ts_morph_1.SyntaxKind.ObjectLiteralExpression)
            ?? dataMethod
                .addStatements('return {};')[0]
                .getFirstDescendantByKindOrThrow(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
        return {
            dataMethod,
            returnObject,
        };
    }
    // From @Component data property method
    if (componentDecoratorDataMethod) {
        if (componentDecoratorDataMethod.isKind(ts_morph_1.SyntaxKind.MethodDeclaration)) {
            // MethodDeclaration // data() {}
            const returnObject = componentDecoratorDataMethod
                .getStatementByKind(ts_morph_1.SyntaxKind.ReturnStatement)
                ?.getFirstDescendantByKindOrThrow(ts_morph_1.SyntaxKind.ObjectLiteralExpression)
                ?? componentDecoratorDataMethod
                    .addStatements('return {};')[0]
                    .getFirstDescendantByKindOrThrow(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
            return {
                dataMethod: componentDecoratorDataMethod,
                returnObject,
            };
        }
        if (componentDecoratorDataMethod.isKind(ts_morph_1.SyntaxKind.PropertyAssignment)) {
            // PropertyAssignment // data: () => {} | data: function() {}
            const initializer = componentDecoratorDataMethod.getInitializerOrThrow('Explicit data property initializer required');
            if (initializer.isKind(ts_morph_1.SyntaxKind.ArrowFunction)
                || initializer.isKind(ts_morph_1.SyntaxKind.FunctionDeclaration)) {
                const dataMethod = mainObject.addMethod({
                    name: 'data',
                    parameters: initializer.getParameters().map((p) => p.getStructure()),
                    isAsync: initializer.isAsync(),
                    returnType: initializer.getReturnTypeNode()?.getText(),
                    statements: initializer.getBodyText(),
                });
                componentDecoratorDataMethod.remove();
                const returnObject = initializer
                    .getStatementByKind(ts_morph_1.SyntaxKind.ReturnStatement)
                    ?.getFirstDescendantByKindOrThrow(ts_morph_1.SyntaxKind.ObjectLiteralExpression)
                    ?? initializer
                        .addStatements('return {};')[0]
                        .getFirstDescendantByKindOrThrow(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
                return {
                    dataMethod,
                    returnObject,
                };
            }
            throw new Error(`data property type not supported ${initializer.getType().getText()}`);
        }
    }
    const dataMethod = mainObject.addMethod({
        name: 'data',
    });
    const returnObject = dataMethod.addStatements('return {};')[0]
        .getFirstDescendantByKindOrThrow(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
    return {
        dataMethod,
        returnObject,
    };
};
exports.getDataMethod = getDataMethod;
exports.default = (clazz, mainObject) => {
    const ignoredPropertyNames = ['$props', '$slots', '$scopedSlots'];
    const classPropertyData = clazz.getProperties().filter((prop) => {
        const propertyName = prop.getName();
        return !prop.getDecorators().length
            && !ignoredPropertyNames.includes(propertyName)
            && !(prop.isStatic() && propertyName === 'components');
    });
    const componentDecoratorDataMethod = mainObject.getProperty('data');
    const clazzDataMethod = clazz.getMethod('data');
    if (clazzDataMethod && componentDecoratorDataMethod) {
        throw new Error('Having a class with the data() method and the @Component({data(): ...} at the same time is not supported.');
    }
    // Class properties go to the data property
    if (classPropertyData.length || clazzDataMethod) {
        const { dataMethod, returnObject } = (0, exports.getDataMethod)(clazz, mainObject);
        classPropertyData.forEach((propertyData) => {
            const typeNode = propertyData.getTypeNode()?.getText();
            const initializer = propertyData.getInitializer()?.getText();
            if (!initializer) {
                dataMethod.insertStatements(0, `/* ${propertyData.getText()} */`);
                return;
            }
            if (typeNode) {
                dataMethod.insertVariableStatement(0, {
                    declarationKind: ts_morph_1.VariableDeclarationKind.Const,
                    declarations: [{
                            name: propertyData.getName(),
                            type: typeNode,
                            initializer,
                        }],
                });
                returnObject.addShorthandPropertyAssignment({
                    name: propertyData.getName(),
                });
            }
            else {
                returnObject.addPropertyAssignment({
                    name: propertyData.getName(),
                    initializer,
                });
            }
        });
    }
};
