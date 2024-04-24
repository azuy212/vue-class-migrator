import { SyntaxKind } from 'ts-morph';
import type MigrationManager from '../migratorManager';
import { extractPropertiesWithDecorator } from '../utils';
import { getDataMethod } from '../vue-class-component/migrate-data';

export default (migrationManager: MigrationManager) => {
  const { clazz, mainObject } = migrationManager;

  const provideClazzMethod = clazz.getMethods().find((method) => method.getName() === 'provide');
  if (provideClazzMethod) {
    throw new Error('A method named "provide" should not be here');
  }

  const provideProperties = extractPropertiesWithDecorator(clazz, 'Provide');

  if (provideProperties.length === 0) {
    return;
  }

  const provideMethodsDeclaration = mainObject.addMethod({
    name: 'provide',
  });

  const provideMethodReturnObject = provideMethodsDeclaration
    .addStatements('return {}')[0]
    .getFirstDescendantByKindOrThrow(SyntaxKind.ObjectLiteralExpression);

  const { returnObject } = getDataMethod(clazz, mainObject);

  provideProperties.forEach((property) => {
    const propertyArgs = property.getDecoratorOrThrow('Provide').getArguments()[0];
    const provideValue = property.getInitializerOrThrow().getText();
    const propertyName = property.getName();
    const provideKey = propertyArgs?.getText() ?? `'${propertyName}'`;

    returnObject.addPropertyAssignment({
      name: propertyName,
      initializer: provideValue,
    });

    provideMethodReturnObject.addPropertyAssignment({
      name: provideKey,
      initializer: `this.${propertyName}`,
    });
  });
};
