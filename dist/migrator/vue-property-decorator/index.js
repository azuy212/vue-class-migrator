"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportedDecorators = void 0;
const prop_1 = __importDefault(require("./prop"));
const propSync_1 = __importDefault(require("./propSync"));
const model_1 = __importDefault(require("./model"));
const modelSync_1 = __importDefault(require("./modelSync"));
const ref_1 = __importDefault(require("./ref"));
const watch_1 = __importDefault(require("./watch"));
const emit_1 = __importDefault(require("./emit"));
const provide_1 = __importDefault(require("./provide"));
const inject_1 = __importDefault(require("./inject"));
exports.default = (migrationManager) => {
    (0, prop_1.default)(migrationManager);
    (0, propSync_1.default)(migrationManager);
    (0, model_1.default)(migrationManager);
    (0, modelSync_1.default)(migrationManager);
    (0, ref_1.default)(migrationManager);
    (0, watch_1.default)(migrationManager);
    (0, emit_1.default)(migrationManager);
    (0, provide_1.default)(migrationManager);
    (0, inject_1.default)(migrationManager);
};
exports.supportedDecorators = [
    'Prop',
    'PropSync',
    'Ref',
    'Model',
    'ModelSync',
    'Watch',
    'Emit',
    'Provide',
    'Inject',
]; // Class Property decorators
