import { ClassDeclaration, ObjectLiteralExpression } from 'ts-morph';
import { getObjectProperty } from '../utils';
import { vueSpecialMethods } from '../config';

export default (clazz: ClassDeclaration, mainObject: ObjectLiteralExpression) => {
  vueSpecialMethods
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
    .filter(
      (m) => !vueSpecialMethods.includes(m.getName())
        && !['data'].includes(m.getName())
        && !m.getDecorator('Watch')
        && !m.getDecorator('Emit'),
    );

  if (methods.length) {
    const methodsObject = getObjectProperty(mainObject, 'methods');

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
