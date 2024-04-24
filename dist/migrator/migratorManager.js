"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMigrationManager = void 0;
const ts_morph_1 = require("ts-morph");
const utils_1 = require("./utils");
const config_1 = require("./config");
const migrate_component_decorator_1 = __importDefault(require("./migrate-component-decorator"));
class MigrationManager {
    _clazz;
    _mainObject;
    _outFile;
    constructor(props) {
        this._mainObject = props.mainObject;
        this._clazz = props.clazz;
        this._outFile = props.outFile;
    }
    get mainObject() {
        return this._mainObject;
    }
    get clazz() {
        return this._clazz;
    }
    get outFile() {
        return this._outFile;
    }
    addModel(options) {
        if (this.mainObject.getProperty('model')) {
            throw new Error('The component has two models.');
        }
        const modelObject = (0, utils_1.getObjectProperty)(this.mainObject, 'model');
        modelObject
            .addPropertyAssignment({
            name: 'prop',
            initializer: `"${options.propName}"`,
        });
        modelObject
            .addPropertyAssignment({
            name: 'event',
            initializer: `"${options.eventName}"`,
        });
    }
    addProp(options) {
        const propsObject = (0, utils_1.getObjectProperty)(this.mainObject, 'props');
        const { propName, propNode, tsType, } = options;
        let propObject;
        if (!propNode) {
            propObject = (0, utils_1.addPropertyObject)(propsObject, propName);
            propObject
                .addPropertyAssignment({
                name: 'type',
                initializer: this.typeNodeToString(tsType),
            });
            return propObject;
        }
        if (propNode.isKind(ts_morph_1.SyntaxKind.Identifier) // e.g. String
            || propNode.isKind(ts_morph_1.SyntaxKind.ArrayLiteralExpression) // e.g. [String, Boolean]
        ) {
            propObject = (0, utils_1.addPropertyObject)(propsObject, propName);
            propObject
                .addPropertyAssignment({
                name: 'type',
                initializer: propNode.getText(),
            });
            return propObject;
        }
        /**
         * e.g. {
         *  type: String or [String, Number],
         *  required: true | false
         *  default: false
         * }
         */
        if (propNode.isKind(ts_morph_1.SyntaxKind.ObjectLiteralExpression)) {
            propObject = (0, utils_1.addPropertyObject)(propsObject, propName, propNode.getText());
            if (!propObject.getProperty('type')) {
                propObject
                    .addPropertyAssignment({
                    name: 'type',
                    initializer: this.typeNodeToString(tsType),
                });
            }
            return propObject;
        }
        throw new Error(`Error adding prop ${propName}, Kind: ${propNode.getKindName()}.`);
    }
    addComputedProp(options) {
        const computedObject = (0, utils_1.getObjectProperty)(this.mainObject, 'computed');
        if ('get' in options) {
            const syncPropObject = (0, utils_1.addPropertyObject)(computedObject, options.name);
            if (options.cache !== undefined) {
                syncPropObject.addPropertyAssignment({
                    name: 'cache',
                    initializer: `${options.cache}`,
                });
            }
            syncPropObject.addMethod({
                name: 'get',
                statements: options.get.statements,
                returnType: options.get.returnType,
            });
            if (options.set) {
                syncPropObject.addMethod({
                    name: 'set',
                    parameters: options.set.parameters,
                    statements: options.set.statements,
                });
            }
        }
        else {
            computedObject.addMethod({
                name: options.name,
                returnType: options.returnType,
                statements: options.statements,
            });
        }
    }
    addMethod(options) {
        const methodsMainObject = (0, utils_1.getObjectProperty)(this.mainObject, 'methods');
        if (methodsMainObject.getProperty(options.methodName)) {
            throw new Error(`Duplicated method ${options.methodName}`);
        }
        methodsMainObject.addMethod({
            name: options.methodName,
            parameters: options.parameters,
            isAsync: options.isAsync,
            returnType: options.returnType,
            statements: options.statements,
            typeParameters: options?.typeParameters,
        });
    }
    addWatch(options) {
        const watchMainObject = (0, utils_1.getObjectProperty)(this.mainObject, 'watch');
        const watchPropArray = (0, utils_1.getArrayProperty)(watchMainObject, `"${options.watchPath}"`);
        const newWatcher = watchPropArray
            .addElement(options.watchOptions ?? '{}')
            .asKindOrThrow(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
        newWatcher.addPropertyAssignment({
            name: 'handler',
            initializer: `"${options.handlerMethod}"`,
        });
    }
    addNamedImport(module, namedImport) {
        const importDeclaration = this._outFile
            .getImportDeclaration((imp) => imp.getModuleSpecifierValue() === module);
        if (!importDeclaration?.getNamedImports()
            .some((imp) => imp.getText() === namedImport)) {
            importDeclaration?.addNamedImport('PropType');
        }
    }
    typeNodeToString(typeNode) {
        const propertyType = typeNode?.getText() ?? 'any';
        const isArray = ts_morph_1.Node.isArrayTypeNode(typeNode);
        const isFunction = ts_morph_1.Node.isFunctionTypeNode(typeNode);
        const propertyConstructorMapping = {
            string: 'String',
            boolean: 'Boolean',
            number: 'Number',
        };
        let fallbackType = 'Object';
        fallbackType = isArray ? 'Array' : fallbackType;
        fallbackType = isFunction ? 'Function' : fallbackType;
        if (!propertyConstructorMapping[propertyType]) {
            if (typeNode?.isKind(ts_morph_1.SyntaxKind.UnionType)) {
                const unionTypes = typeNode.getType().getUnionTypes();
                const unionLiteralTypes = Array.from(new Set(unionTypes.map((type) => propertyConstructorMapping[type.getBaseTypeOfLiteralType().getText()])));
                return unionLiteralTypes.length > 1 ? `[${unionLiteralTypes.join(', ')}]` : unionLiteralTypes[0];
            }
            this.addNamedImport('vue', 'PropType');
            return `${fallbackType} as PropType<${propertyType}>`;
        }
        return propertyConstructorMapping[propertyType];
    }
}
exports.default = MigrationManager;
const getClassWithComponentDecorator = (file) => file
    .getClasses()
    .filter((clazz) => clazz.getDecorator('Component'))
    .pop();
const createMigrationManager = (sourceFile, outFile) => {
    // Do not modify this class.
    const sourceFileClass = getClassWithComponentDecorator(sourceFile);
    const outClazz = getClassWithComponentDecorator(outFile);
    if (!sourceFileClass || !outClazz) {
        throw new Error('Class implementing the @Component decorator not found.');
    }
    // Validation
    sourceFileClass
        .getProperties()
        .flatMap((prop) => prop.getDecorators())
        .forEach((decorator) => {
        if (!config_1.supportedDecorators.includes(decorator.getName())) {
            throw new Error(`Decorator @${decorator.getName()} not supported`);
        }
    });
    const defineComponentInitObject = (0, migrate_component_decorator_1.default)(sourceFileClass);
    let clazzReplacement;
    if (!outClazz.getDefaultKeyword()) {
        // Non default exported class
        clazzReplacement = [
            outClazz?.getExportKeyword()?.getText(),
            `const ${outClazz.getName()} =`,
            `defineComponent(${defineComponentInitObject})`,
        ]
            .filter((s) => s)
            .join(' ');
    }
    else {
        clazzReplacement = [
            outClazz?.getExportKeyword()?.getText(),
            outClazz?.getDefaultKeywordOrThrow()?.getText(),
            `defineComponent(${defineComponentInitObject})`,
        ]
            .filter((s) => s)
            .join(' ');
    }
    // Main structure
    const mainObject = outClazz
        .replaceWithText(clazzReplacement)
        .getFirstDescendantByKind(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
    if (!mainObject) {
        throw new Error('Unable to create defineComponent');
    }
    const migratePartProps = {
        clazz: sourceFileClass,
        mainObject,
        outFile,
        sourceFile,
    };
    return new MigrationManager(migratePartProps);
};
exports.createMigrationManager = createMigrationManager;
