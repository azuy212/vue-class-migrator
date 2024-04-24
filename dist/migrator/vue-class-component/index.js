"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const migrate_data_1 = __importDefault(require("./migrate-data"));
const migrate_extends_1 = __importDefault(require("./migrate-extends"));
const migrate_getters_1 = __importDefault(require("./migrate-getters"));
const migrate_imports_1 = __importDefault(require("./migrate-imports"));
const migrate_methods_1 = __importDefault(require("./migrate-methods"));
const migrate_setters_1 = __importDefault(require("./migrate-setters"));
exports.default = (migrationManager) => {
    (0, migrate_imports_1.default)(migrationManager.outFile);
    (0, migrate_extends_1.default)(migrationManager.clazz, migrationManager.mainObject);
    (0, migrate_data_1.default)(migrationManager.clazz, migrationManager.mainObject);
    (0, migrate_getters_1.default)(migrationManager);
    (0, migrate_setters_1.default)(migrationManager.clazz, migrationManager.mainObject);
    (0, migrate_methods_1.default)(migrationManager.clazz, migrationManager.mainObject);
};
