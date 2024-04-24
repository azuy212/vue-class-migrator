"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const config_1 = require("../config");
exports.default = (clazz, mainObject) => {
    config_1.vueSpecialMethods
        .filter((m) => clazz.getMethod(m))
        .forEach((m) => {
        const method = clazz.getMethodOrThrow(m);
        const typeNode = method.getReturnTypeNode()?.getText();
        mainObject.addMethod({
            name: method.getName(),
            isAsync: method.isAsync(),
            returnType: typeNode,
            statements: method.getBodyText(),
        });
    });
    const methods = clazz
        .getMethods()
        .filter((m) => !config_1.vueSpecialMethods.includes(m.getName())
        && !['data'].includes(m.getName())
        && !m.getDecorator('Watch')
        && !m.getDecorator('Emit'));
    if (methods.length) {
        const methodsObject = (0, utils_1.getObjectProperty)(mainObject, 'methods');
        methods.forEach((method) => {
            const methodParams = method.getParameters();
            const methodParamsStructure = methodParams.map((p) => p.getStructure());
            const methodTypeParams = method.getTypeParameters();
            const methodTypeParamsStructure = methodTypeParams.map((p) => p.getStructure());
            if (method.getDecorators().length) {
                throw new Error(`The method ${method.getName()} has non supported decorators.`);
            }
            const typeNode = method.getReturnTypeNode()?.getText();
            methodsObject.addMethod({
                name: method.getName(),
                parameters: methodParamsStructure,
                isAsync: method.isAsync(),
                returnType: typeNode,
                statements: method.getBodyText(),
                typeParameters: methodTypeParamsStructure,
            });
        });
    }
};
