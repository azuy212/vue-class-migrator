"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_morph_1 = require("ts-morph");
const utils_1 = require("../utils");
// @Emit
exports.default = (migrationManager) => {
    const { clazz } = migrationManager;
    const emitMethods = clazz.getMethods().filter((method) => method.getDecorator('Emit'));
    emitMethods.forEach((method) => {
        const decorators = method.getDecorators().filter((decorator) => decorator.getName() === 'Emit');
        const isAsync = method.isAsync();
        const methodParams = method.getParameters();
        const methodTypeParams = method.getTypeParameters();
        const methodTypeParamsStructure = methodTypeParams.map((p) => p.getStructure());
        const methodName = method.getName();
        const methodStatements = method.getStatements();
        const ifStatements = methodStatements.filter((statement) => ts_morph_1.Statement.isIfStatement(statement));
        if (ifStatements.length !== 0) {
            throw new Error('Conditional emit params not supported yet');
        }
        const methodReturnStatement = method.getStatementByKind(ts_morph_1.SyntaxKind.ReturnStatement);
        const methodOtherStatements = methodStatements
            .filter((statement) => !ts_morph_1.Statement.isReturnStatement(statement));
        const baseOptions = {
            methodName,
            isAsync,
            parameters: methodParams.length ? methodParams.map((arg) => arg.getStructure()) : undefined,
            typeParameters: methodTypeParamsStructure,
        };
        migrationManager.addMethod({
            ...baseOptions,
            statements(writer) {
                methodOtherStatements.forEach((statement) => {
                    writer.writeLine(statement.getText());
                });
                decorators.forEach((decorator) => {
                    const decoratorArgs = decorator.getArguments();
                    const eventName = decoratorArgs[0]
                        ? (0, utils_1.stringNodeToSTring)(decoratorArgs[0])
                        : method.getName();
                    if (methodParams.length === 0 && !methodReturnStatement) {
                        writer.writeLine(`this.$emit('${eventName}')`);
                        return;
                    }
                    let emitArgs = new Set([...methodParams.map((arg) => arg.getNameNode()?.getText())]);
                    if (methodReturnStatement) {
                        emitArgs = new Set([methodReturnStatement.getExpressionOrThrow().getText(), ...Array.from(emitArgs)]);
                    }
                    writer.writeLine(`this.$emit('${eventName}', ${Array.from(emitArgs).join(', ')})`);
                });
            },
        });
    });
};
