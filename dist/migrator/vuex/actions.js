"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_morph_1 = require("ts-morph");
const utils_1 = require("../utils");
// Vuex @ Actions are methods
// @Action("setActivityPageAlert", { namespace: "activity" })
// @Action
const supportedActionOptions = ['namespace']; // @Action("", {...})
exports.default = (migrationManager) => {
    const { clazz, mainObject } = migrationManager;
    const vuexActions = (0, utils_1.extractPropertiesWithDecorator)(clazz, 'Action');
    if (vuexActions.length) {
        const methodsObject = (0, utils_1.getObjectProperty)(mainObject, 'methods');
        vuexActions.forEach((vuexAction) => {
            const decoratorArgs = vuexAction.getDecoratorOrThrow('Action').getArguments();
            const methodName = decoratorArgs[0]
                ? (0, utils_1.stringNodeToSTring)(decoratorArgs[0])
                : vuexAction.getName();
            const actionOptions = decoratorArgs[1]?.asKindOrThrow(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
            const namespace = actionOptions?.getProperty('namespace')
                ?.asKindOrThrow(ts_morph_1.SyntaxKind.PropertyAssignment)
                .getInitializerIfKindOrThrow(ts_morph_1.SyntaxKind.StringLiteral)
                .getLiteralText();
            actionOptions?.getProperties().forEach((prop) => {
                if (prop.isKind(ts_morph_1.SyntaxKind.PropertyAssignment)
                    && !supportedActionOptions.includes(prop.getName())) {
                    throw new Error(`@Action option ${prop.getName()} not supported.`);
                }
            });
            const actionName = (namespace ? [namespace, methodName].join('/') : methodName);
            // The property type is a function or any.
            // The function params are the params that the method should take
            const callSignature = vuexAction.getType().getCallSignatures()[0];
            let params;
            let returnType = undefined;
            let paramVars = [];
            if (callSignature) {
                // The function has paramenters
                const paramsString = callSignature.compilerSignature
                    .getParameters()
                    .flatMap((param) => param.getDeclarations())
                    .map((param) => param?.getText())
                    .filter((param) => param)
                    .join(', ');
                params = [
                    {
                        kind: ts_morph_1.StructureKind.Parameter,
                        name: paramsString,
                    },
                ];
                paramVars = callSignature.getParameters().map((param) => param.getName());
                returnType = `Promise<${callSignature.getReturnType().getText() ?? 'any'}>`; // Dispatch always returns a promise
            }
            else {
                returnType = vuexAction.getTypeNode()?.getText(); // Probably is set to any
            }
            const dispatchParameters = [`"${actionName}"`, ...paramVars].join(', ');
            methodsObject.addMethod({
                name: vuexAction.getName(),
                parameters: params,
                returnType,
                statements: `return this.$store.dispatch(${dispatchParameters});`,
            });
        });
    }
};
