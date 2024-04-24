"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportedDecorators = exports.vueSpecialMethods = void 0;
const vuex_1 = require("./vuex");
const vue_property_decorator_1 = require("./vue-property-decorator");
exports.vueSpecialMethods = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeUnmount',
    'unmounted',
    'errorCaptured',
    'renderTracked',
    'renderTriggered',
    'activated',
    'deactivated',
    'serverPrefetch',
    'beforeDestroy',
    'destroyed',
]; // Vue methods that won't be included under methods: {...}, they go to the root.
exports.supportedDecorators = [
    ...vuex_1.supportedPropDecorators,
    ...vue_property_decorator_1.supportedDecorators,
]; // Class Property decorators
