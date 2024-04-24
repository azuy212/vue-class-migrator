"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportedPropDecorators = void 0;
const actions_1 = __importDefault(require("./actions"));
const getters_1 = __importDefault(require("./getters"));
const mutations_1 = __importDefault(require("./mutations"));
exports.default = (migrationManager) => {
    (0, actions_1.default)(migrationManager);
    (0, getters_1.default)(migrationManager);
    (0, mutations_1.default)(migrationManager);
};
exports.supportedPropDecorators = [
    'Action',
    'Getter',
    'Mutation',
];
