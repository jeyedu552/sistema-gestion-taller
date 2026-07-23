"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registry = exports.httpRequestCounter = void 0;
const prom_client_1 = __importDefault(require("prom-client"));
prom_client_1.default.collectDefaultMetrics();
exports.httpRequestCounter = new prom_client_1.default.Counter({
    name: 'ms_operaciones_http_requests_total',
    help: 'Total de peticiones HTTP en Operaciones',
    labelNames: ['method', 'route', 'status_code'],
});
exports.registry = prom_client_1.default.register;
