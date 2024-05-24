"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexController = void 0;
const ExpressController_1 = require("@juicejs/juice/core/http/ExpressController");
const Helper_1 = require("../Helper");
const fs = require("fs");
const players = require("../../data/players.json");
const readLastLines = require('read-last-lines');
const fetch = require("node-fetch");
class IndexController extends ExpressController_1.ExpressController {
    constructor() {
        super();
        this.lastFetchCache = null;
        this.poolCache = {
            bnb: {},
            eth: {},
            btc: {}
        };
        this.priceCache = 0;
        this.getPairs();
        setInterval(() => {
            this.getPairs();
            console.log("now");
        }, 5 * 60 * 1000);
    }
    ;
    async index(request, response) {
        response.render("index", {});
    }
    async invest(request, response) {
        const COLOR_UPCOMING = '#B01619';
        const COLOR_NEW = '#2d6924';
        const prices = await this.fetchPrices();
        let total = 0;
        players.forEach(player => {
            player.price = {};
            if (prices[player.modalId]) {
                player.price = prices[player.modalId];
                total += prices[player.modalId].balance;
            }
        });
        response.render("invest", {
            players: players,
            invested: Math.floor(total * 100 / 500000)
        });
    }
    async playerAge(birthday) {
        let today = new Date();
        let birthDate = new Date(birthday);
        let age = today.getFullYear() - birthDate.getFullYear();
        let m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age.toString();
    }
    async trade(request, response) {
        const payload = {
            pools: this.poolCache
        };
        response.render("trade", payload);
    }
    async news(request, response) {
        response.render("about", {});
    }
    async about_chi(request, response) {
        response.render("about_chi", {});
    }
    async about_ar(request, response) {
        response.render("about_ar", {});
    }
    async about_hr(request, response) {
        response.render("about_hr", {});
    }
    async roadmap(request, response) {
        response.render("roadmap", {});
    }
    async terms_conditions(request, response) {
        response.render("terms_conditions", {});
    }
    async privacy_policy(request, response) {
        response.render("privacy_policy", {});
    }
    async devest(request, response) {
        response.render("devest", {});
    }
    async media(request, response) {
        response.render("media", {});
    }
    async demo(request, response) {
        response.render("activator", {});
    }
    async fetchPrices() {
        if (this.lastFetch && this.lastFetch > (Date.now() - 500000))
            return this.lastFetchCache;
        this.lastFetch = Date.now();
        const Web3 = require("web3");
        const provider = new Web3.providers.HttpProvider('https://bsc-dataseed1.binance.org');
        const web3 = new Web3(provider);
        const shareAbi = require("../../data/OriShare.json");
        const bidAbi = require("../../data/OriBid.json");
        const oriShare2 = await new web3.eth.Contract(shareAbi.abi, "0xf2d25a74Be5665458454aE6A3EdCEef9496d0876");
        const oriShare = await new web3.eth.Contract(shareAbi.abi, "0x30e3214b3Aa01eC09bd92b2bffC7E6AF09E862D0");
        const oriBid = await new web3.eth.Contract(bidAbi.abi, "0x3C935E0aF2479Bb7C3A078f78f338CC3aD1B5a42");
        const price = await this.getPrice();
        let balance = await oriBid.methods
            .getBalance()
            .call();
        let balance2 = await oriShare.methods
            .getBalance()
            .call();
        let balance3 = await oriShare2.methods
            .getBalance()
            .call();
        balance = Math.floor(balance / 100000);
        balance2 = Math.floor(balance2 / 100000);
        balance3 = Math.floor(balance3 / 100000);
        const lines = await readLastLines.read('./data/history.csv', 24);
        const values = lines.split("\n");
        const balances = values[0].split(",");
        let historyBalance1 = parseInt(balances[1]) / 100000;
        let profit1 = parseFloat(((balance * 100 / historyBalance1) - 100).toFixed(2));
        let historyBalance2 = parseInt(balances[2]) / 100000;
        let profit2 = parseFloat(((balance2 * 100 / historyBalance2) - 100).toFixed(2));
        let historyBalance3 = parseInt(balances[3]) / 100000;
        let profit3 = parseFloat(((balance3 * 100 / historyBalance3) - 100).toFixed(2));
        this.lastFetchCache = {
            1: {
                balance: balance,
                price: (balance * price).toFixed(0),
                profit: profit1
            },
            22: {
                balance: balance2,
                price: (balance2 * price).toFixed(0),
                profit: profit2
            },
            18: {
                balance: balance3,
                price: (balance3 * price).toFixed(0),
                profit: profit3
            }
        };
        return this.lastFetchCache;
    }
    async getPools() {
        return this.poolCache;
    }
    async getPairs() {
        const helper = new Helper_1.Helper();
        this.poolCache.bnb = await helper.getPoolPrice("BNB");
        this.poolCache.eth = await helper.getPoolPrice("ETH");
        this.poolCache.btc = await helper.getPoolPrice("BTC");
        let max = 0;
        if (this.poolCache.bnb.price > max) {
            max = this.poolCache.bnb.price;
            this.poolCache.bnb.max = true;
        }
        if (this.poolCache.btc.price > max) {
            max = this.poolCache.btc.price;
            this.poolCache.btc.max = true;
        }
        if (this.poolCache.eth.price > max) {
            max = this.poolCache.eth.price;
            this.poolCache.eth.max = true;
        }
        if (this.poolCache.bnb.max) {
            this.poolCache.bnb.value = 100;
            const g = this.poolCache.bnb.price;
            this.poolCache.btc.value = (this.poolCache.btc.price * 100) / g;
            this.poolCache.eth.value = (this.poolCache.eth.price * 100) / g;
            this.poolCache.btc.spred = this.poolCache.bnb.price - this.poolCache.btc.price;
            this.poolCache.eth.spred = this.poolCache.bnb.price - this.poolCache.eth.price;
        }
        if (this.poolCache.btc.max) {
            this.poolCache.btc.value = 100;
            const g = this.poolCache.btc.price;
            this.poolCache.bnb.value = (this.poolCache.bnb.price * 100) / g;
            this.poolCache.eth.value = (this.poolCache.eth.price * 100) / g;
            this.poolCache.bnb.spred = this.poolCache.btc.price - this.poolCache.bnb.price;
            this.poolCache.eth.spred = this.poolCache.btc.price - this.poolCache.eth.price;
        }
        if (this.poolCache.eth.max) {
            this.poolCache.eth.value = 100;
            const g = this.poolCache.eth.price;
            this.poolCache.bnb.value = (this.poolCache.bnb.price * 100) / g;
            this.poolCache.btc.value = (this.poolCache.btc.price * 100) / g;
            this.poolCache.bnb.spred = this.poolCache.eth.price - this.poolCache.bnb.price;
            this.poolCache.eth.spred = this.poolCache.eth.price - this.poolCache.eth.price;
        }
        console.log(this.poolCache);
    }
    async getPrice() {
        return this.poolCache.bnb.price;
    }
}
exports.IndexController = IndexController;
__decorate([
    (0, ExpressController_1.Get)("/")
], IndexController.prototype, "index", null);
__decorate([
    (0, ExpressController_1.Get)("/invest")
], IndexController.prototype, "invest", null);
__decorate([
    (0, ExpressController_1.Get)("/trade")
], IndexController.prototype, "trade", null);
__decorate([
    (0, ExpressController_1.Get)("/about")
], IndexController.prototype, "news", null);
__decorate([
    (0, ExpressController_1.Get)("/about/zh")
], IndexController.prototype, "about_chi", null);
__decorate([
    (0, ExpressController_1.Get)("/about/ar")
], IndexController.prototype, "about_ar", null);
__decorate([
    (0, ExpressController_1.Get)("/about/hr")
], IndexController.prototype, "about_hr", null);
__decorate([
    (0, ExpressController_1.Get)("/roadmap")
], IndexController.prototype, "roadmap", null);
__decorate([
    (0, ExpressController_1.Get)("/terms_conditions")
], IndexController.prototype, "terms_conditions", null);
__decorate([
    (0, ExpressController_1.Get)("/privacy_policy")
], IndexController.prototype, "privacy_policy", null);
__decorate([
    (0, ExpressController_1.Get)("/devest")
], IndexController.prototype, "devest", null);
__decorate([
    (0, ExpressController_1.Get)("/media")
], IndexController.prototype, "media", null);
__decorate([
    (0, ExpressController_1.Get)("/demo-access")
], IndexController.prototype, "demo", null);
//# sourceMappingURL=IndexController.js.map