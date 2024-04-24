import type MigrationManager from '../migratorManager';
import { addPropertyObject, extractPropertiesWithDecorator } from '../utils';

export default (migrationManager: MigrationManager) => {
  const { clazz, mainObject } = migrationManager;

  const provideProperties = extractPropertiesWithDecorator(clazz, 'Inject');

  if (provideProperties.length === 0) {
    return;
  }

  const injectObject = addPropertyObject(mainObject, 'inject', '{}');

  provideProperties.forEach((property) => {
    const injectDecoratorArgs = property.getDecoratorOrThrow('Inject').getArguments().at(0);
    const propertyName = property.getName();
    const injectKey = injectDecoratorArgs?.getText() ?? `'${propertyName}'`;

    injectObject.addPropertyAssignment({
      name: propertyName,
      initializer: injectKey,
    });
  });
};
