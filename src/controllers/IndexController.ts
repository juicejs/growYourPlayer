import * as express from "express";
import {ExpressController, Get} from "@juicejs/juice/core/http/ExpressController";
import {Helper} from "../Helper";
const fs = require("fs");
const players = require("../../data/players.json");
const readLastLines = require('read-last-lines');
const fetch = require("node-fetch");

export class IndexController extends ExpressController {

    lastFetch: number;
    lastFetchCache: any = null;

    constructor() {
        super();
        this.getPairs();
        setInterval(() => {
            this.getPairs();
            console.log("now");
        }, 5 * 60 * 1000)
    };

    @Get("/")
    public async index(request: express.Request, response: express.Response) {
        response.render("index", {});
    }

    @Get("/invest")
    public async invest(request: express.Request, response: express.Response) {
        const COLOR_UPCOMING = '#B01619';
        const COLOR_NEW = '#2d6924';

        const prices = await this.fetchPrices();
        let total = 0;
        players.forEach(player => {
            player.price = {};
            if(prices[player.modalId]){
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
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate()))
        {
            age--;
        }
        return age.toString();
    }


    @Get("/trade")
    public async trade(request: express.Request, response: express.Response) {
        const payload = {
            pools: this.poolCache
        }
        response.render("trade", payload);
    }

    @Get("/about")
    public async news(request: express.Request, response: express.Response) {
        response.render("about", {});
    }
    @Get("/about/zh")
    public async about_chi(request: express.Request, response: express.Response) {
        response.render("about_chi", {});

    }
    @Get("/about/ar")
    public async about_ar(request: express.Request, response: express.Response) {
        response.render("about_ar", {});
    }
    @Get("/about/hr")
    public async about_hr(request: express.Request, response: express.Response) {
        response.render("about_hr", {});
    }

    @Get("/roadmap")
    public async roadmap(request: express.Request, response: express.Response) {
        response.render("roadmap", {});
    }
    @Get("/terms_conditions")
    public async terms_conditions(request: express.Request, response: express.Response) {
        response.render("terms_conditions", {});
    }

    @Get("/privacy_policy")
    public async privacy_policy(request: express.Request, response: express.Response) {
        response.render("privacy_policy", {});
    }

    @Get("/devest")
    public async devest(request: express.Request, response: express.Response) {
        response.render("devest", {});
    }

    @Get("/media")
    public async media(request: express.Request, response: express.Response) {
        response.render("media", {});
    }

    @Get("/demo-access")
    public async demo(request: express.Request, response: express.Response) {
        response.render("activator", {});
    }

    async fetchPrices(): Promise<any> {
        if (this.lastFetch && this.lastFetch > (Date.now()-500000))
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

        const lines = await readLastLines.read('./data/history.csv', 24)
        const values = lines.split("\n");
        const balances = values[0].split(",");

        let historyBalance1 = parseInt(balances[1]) / 100000;
        let profit1 = parseFloat(((balance*100/historyBalance1)-100).toFixed(2));

        let historyBalance2 = parseInt(balances[2]) / 100000;
        let profit2 = parseFloat(((balance2*100/historyBalance2)-100).toFixed(2));

        let historyBalance3 = parseInt(balances[3]) / 100000;
        let profit3 = parseFloat(((balance3*100/historyBalance3)-100).toFixed(2));

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
        }
        return this.lastFetchCache;
    }

    private poolCache: any = {
        bnb: {},
        eth: {},
        btc: {}
    }

    async getPools() {
        return this.poolCache;
    }

    async getPairs(){
        const helper = new Helper();
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

        if (this.poolCache.bnb.max){
            this.poolCache.bnb.value = 100;
            const g = this.poolCache.bnb.price;
            this.poolCache.btc.value = (this.poolCache.btc.price * 100) / g;
            this.poolCache.eth.value = (this.poolCache.eth.price * 100) / g;
            this.poolCache.btc.spred = this.poolCache.bnb.price - this.poolCache.btc.price;
            this.poolCache.eth.spred = this.poolCache.bnb.price - this.poolCache.eth.price;
        }
        if (this.poolCache.btc.max){
            this.poolCache.btc.value = 100;
            const g = this.poolCache.btc.price;
            this.poolCache.bnb.value = (this.poolCache.bnb.price * 100) / g;
            this.poolCache.eth.value = (this.poolCache.eth.price * 100) / g;
            this.poolCache.bnb.spred = this.poolCache.btc.price - this.poolCache.bnb.price;
            this.poolCache.eth.spred = this.poolCache.btc.price - this.poolCache.eth.price;
        }
        if (this.poolCache.eth.max){
            this.poolCache.eth.value = 100;
            const g = this.poolCache.eth.price;
            this.poolCache.bnb.value = (this.poolCache.bnb.price * 100) / g;
            this.poolCache.btc.value = (this.poolCache.btc.price * 100) / g;
            this.poolCache.bnb.spred = this.poolCache.eth.price - this.poolCache.bnb.price;
            this.poolCache.eth.spred = this.poolCache.eth.price - this.poolCache.eth.price;
        }


        console.log(this.poolCache);
    }

    priceCache: number = 0;
    priceUpdate: number;

    async getPrice() {
        return this.poolCache.bnb.price;
    }


}
