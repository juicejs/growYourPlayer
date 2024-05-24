"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OriWebsite = void 0;
const Path = __importStar(require("path"));
const Juice_1 = require("@juicejs/juice/Juice");
const Networking_1 = require("@juicejs/juice/modules/networking/Networking");
const IndexController_1 = require("./controllers/IndexController");
const WebApplication_1 = require("@juicejs/juice/modules/networking/applications/WebApplication");
const ColoredConsoleLogger_1 = require("@juicejs/juice/modules/logging/ColoredConsoleLogger");
const ApplicationConfiguration_1 = require("@juicejs/juice/core/decorators/ApplicationConfiguration");
const fs = __importStar(require("fs"));
const cron = require('node-cron');
let OriWebsite = class OriWebsite {
    constructor() {
    }
    async configure() {
        await Juice_1.Juice.configuration().install({
            key: "networking",
            options: {
                port: 8235
            }
        });
        this.webApp = new WebApplication_1.WebApplication();
        this.webApp.setViewpath(Path.join(__dirname, "../views"));
        this.webApp.setPublicpath(Path.join(__dirname, "../public"));
        await this.webApp.init();
        this.webApp.addController("/", new IndexController_1.IndexController());
        return true;
    }
    prepare() {
        Juice_1.Juice.install(Networking_1.Networking);
        Juice_1.Juice.register(ColoredConsoleLogger_1.ColoredConsoleLogger);
        return true;
    }
    async ready() {
        const networking = Juice_1.Juice.service("networking");
        await networking.deployApplication("/", this.webApp);
        await networking.deployStaticPath("/images", Path.join(__dirname, "../images"));
        await networking.deployStaticPath("/css", Path.join(__dirname, "../css"));
        await networking.deployStaticPath("/js", Path.join(__dirname, "../js"));
        await networking.deployStaticPath("/vue", Path.join(__dirname, "../vue"));
        await networking.deployStaticPath("/data", Path.join(__dirname, "../data"));
        cron.schedule('0 */1 * * *', async () => {
            await this.updatePrice();
        });
        return true;
    }
    async updatePrice() {
        const Web3 = require("web3");
        const shareAbi = require("../data/OriShare.json");
        const bidAbi = require("../data/OriBid.json");
        const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed1.binance.org'));
        const oriShare = await new web3.eth.Contract(shareAbi.abi, "0x30e3214b3Aa01eC09bd92b2bffC7E6AF09E862D0");
        const oriShare2 = await new web3.eth.Contract(shareAbi.abi, "0xf2d25a74Be5665458454aE6A3EdCEef9496d0876");
        const oriBid = await new web3.eth.Contract(bidAbi.abi, "0x3C935E0aF2479Bb7C3A078f78f338CC3aD1B5a42");
        const balance1 = await oriBid.methods.getBalance().call();
        const balance2 = await oriShare.methods.getBalance().call();
        const balance3 = await oriShare.methods.getBalance().call();
        fs.appendFileSync("./data/history.csv", (new Date()).toISOString() + "," + balance1 + "," + balance2 + "," + balance3 + "\n");
        console.log("Logged values");
    }
};
exports.OriWebsite = OriWebsite;
exports.OriWebsite = OriWebsite = __decorate([
    (0, ApplicationConfiguration_1.ApplicationConfiguration)({
        key: "ori-website",
        options: {
            logger: "logger:colored-console"
        }
    })
], OriWebsite);
//# sourceMappingURL=OriWebsite.js.map