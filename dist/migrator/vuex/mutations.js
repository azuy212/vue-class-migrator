"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_morph_1 = require("ts-morph");
const utils_1 = require("../utils");
// Vuex @Mutations are methods
// @Mutation("setActivityPageAlert", { namespace: "activity" })
// @Mutation
const supportedMutationOptions = ['namespace']; // @Mutation("", {...})
exports.default = (migrationManager) => {
    const { clazz, mainObject } = migrationManager;
    const vuexMutations = (0, utils_1.extractPropertiesWithDecorator)(clazz, 'Mutation');
    if (vuexMutations.length) {
        const methodsObject = (0, utils_1.getObjectProperty)(mainObject, 'methods');
        vuexMutations.forEach((vuexMutation) => {
            const decoratorArgs = vuexMutation.getDecoratorOrThrow('Mutation').getArguments();
            const methodName = decoratorArgs[0]
                ? (0, utils_1.stringNodeToSTring)(decoratorArgs[0])
                : vuexMutation.getName();
            const mutationOptions = decoratorArgs[1]?.asKindOrThrow(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
            const namespace = mutationOptions?.getProperty('namespace')
                ?.asKindOrThrow(ts_morph_1.SyntaxKind.PropertyAssignment)
                .getInitializerIfKindOrThrow(ts_morph_1.SyntaxKind.StringLiteral)
                .getLiteralText();
            mutationOptions?.getProperties().forEach((prop) => {
                if (prop.isKind(ts_morph_1.SyntaxKind.PropertyAssignment)
                    && !supportedMutationOptions.includes(prop.getName())) {
                    throw new Error(`@Mutation option ${prop.getName()} not supported.`);
                }
            });
            const mutationName = (namespace ? [namespace, methodName].join('/') : methodName);
            // The property type is a function or any.
            // The function params are the params that the method should take
            const callSignature = vuexMutation.getType().getCallSignatures()[0];
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
                returnType = vuexMutation.getTypeNode()?.getText(); // Probably is set to any
            }
            const dispatchParameters = [`"${mutationName}"`, ...paramVars].join(', ');
            methodsObject.addMethod({
                name: vuexMutation.getName(),
                parameters: params,
                returnType,
                statements: `return this.$store.commit(${dispatchParameters});`,
            });
        });
    }
};
