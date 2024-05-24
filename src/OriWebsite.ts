import * as Path from "path";
import {Juice} from "@juicejs/juice/Juice";
import {Networking} from "@juicejs/juice/modules/networking/Networking";
import {IndexController} from "./controllers/IndexController";
import {IJuiceApplication} from "@juicejs/juice/core/IJuiceApplication";
import {WebApplication} from "@juicejs/juice/modules/networking/applications/WebApplication";
import {ColoredConsoleLogger} from "@juicejs/juice/modules/logging/ColoredConsoleLogger";
import {ApplicationConfiguration} from "@juicejs/juice/core/decorators/ApplicationConfiguration";
import * as fs from "fs";
import {Helper} from "./Helper";
const cron = require('node-cron');

@ApplicationConfiguration({
    key: "ori-website",
    options: {
        logger: "logger:colored-console"
    }
})
export class OriWebsite implements IJuiceApplication {

    options?: any;
    webApp: WebApplication;

    constructor() {
    }

    async configure(): Promise<boolean> {
        await Juice.configuration().install({
            key: "networking",
            options: {
                port: 8235
            }
        })

        this.webApp = new WebApplication();
        this.webApp.setViewpath(Path.join(__dirname, "../views"));
        this.webApp.setPublicpath(Path.join(__dirname, "../public"));

        await this.webApp.init();

        this.webApp.addController("/", new IndexController());

        return true;
    }

    prepare() {
        Juice.install(Networking);
        Juice.register(ColoredConsoleLogger);
        return true;
    }

    async ready(): Promise<any> {
        const networking = Juice.service<Networking>("networking");
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

    async updatePrice(){
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




}
