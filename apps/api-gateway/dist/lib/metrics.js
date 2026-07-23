"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registry = exports.proxyRequestCounter = void 0;
const prom_client_1 = __importDefault(require("prom-client"));
prom_client_1.default.collectDefaultMetrics();
exports.proxyRequestCounter = new prom_client_1.default.Counter({
    name: 'api_gateway_proxy_requests_total',
    help: 'Total de peticiones proxy redirigidas por el Gateway',
    labelNames: ['target_service', 'method'],
});
exports.registry = prom_client_1.default.register;
