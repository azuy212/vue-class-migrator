import {
  IfStatement,
  Statement,
  SyntaxKind,
} from 'ts-morph';
import type MigrationManager from '../migratorManager';
import { stringNodeToSTring } from '../utils';

// @Emit
export default (migrationManager: MigrationManager) => {
  const { clazz } = migrationManager;

  const emitMethods = clazz.getMethods().filter((method) => method.getDecorator('Emit'));
  emitMethods.forEach((method) => {
    const decorators = method.getDecorators().filter((decorator) => decorator.getName() === 'Emit');
    const isAsync = method.isAsync();
    const methodParams = method.getParameters();
    const methodName = method.getName();
    const methodStatements = method.getStatements();

    const ifStatements = methodStatements.filter(
      (
        statement,
      ): statement is IfStatement => Statement.isIfStatement(
        statement,
      ),
    );

    if (ifStatements.length !== 0) {
      throw new Error('Conditional emit params not supported yet');
    }

    const methodReturnStatement = method.getStatementByKind(SyntaxKind.ReturnStatement);
    const methodOtherStatements = methodStatements
      .filter(
        (
          statement,
        ) => !Statement.isReturnStatement(statement),
      );

    const baseOptions = {
      methodName,
      isAsync,
      parameters: methodParams.length ? methodParams.map((arg) => arg.getStructure()) : undefined,
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
            ? stringNodeToSTring(decoratorArgs[0])
            : method.getName();

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
        });
      },
    });
  });
};
