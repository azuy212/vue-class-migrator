import { SyntaxKind } from 'ts-morph';
import type MigrationManager from '../migratorManager';
import { stringNodeToSTring } from '../utils';

// @Emit
export default (migrationManager: MigrationManager) => {
  const { clazz } = migrationManager;

  const emitMethods = clazz.getMethods().filter((method) => method.getDecorator('Emit'));
  emitMethods.forEach((method) => {
    const decoratorArgs = method.getDecoratorOrThrow('Emit')?.getArguments();
    const eventName = stringNodeToSTring(decoratorArgs[0]);
    const returnTypeNodeText = method.getReturnTypeNode()?.getText();
    const isAsync = method.isAsync();
    const methodParams = method.getParameters();
    const methodName = method.getName();
    const methodReturnStatement = method.getStatementByKind(SyntaxKind.ReturnStatement);
    const methodNonReturnStatements = method
      .getStatements()
      .filter((statement) => statement.getKind() !== SyntaxKind.ReturnStatement);

    const baseOptions = {
      methodName,
      returnType: returnTypeNodeText,
      isAsync,
      parameters: methodParams.length ? methodParams.map((arg) => arg.getStructure()) : undefined,
    };

    migrationManager.addMethod({
      ...baseOptions,
      statements(writer) {
        methodNonReturnStatements.forEach((statement) => {
          writer.writeLine(statement.getText());
        });

        if (methodParams.length === 0 && !methodReturnStatement) {
          writer.writeLine(`this.$emit('${eventName}')`);
          return;
        }

        let emitArgs = new Set<string>(
          [...methodParams.map((arg) => arg.getNameNode()?.getText())],
        );

        if (methodReturnStatement) {
          emitArgs = new Set(
            [methodReturnStatement.getExpressionOrThrow().getText(), ...Array.from(emitArgs)],
          );
        }
        writer.writeLine(`this.$emit('${eventName}', ${Array.from(emitArgs).join(', ')})`);
      },
    });
  });
};
