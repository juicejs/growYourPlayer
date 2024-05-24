"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Helper = void 0;
const ethers_1 = require("ethers");
const node_fetch_1 = __importDefault(require("node-fetch"));
const web3_1 = __importDefault(require("web3"));
const config = {
    "BNB_POOL": "0xcf39b3bf82cdda2ae208729e6dfa8abc68729561",
    "ETH_POOL": "0xf7FC05A09C121A7ed1dD5BD8321464D79a4bc625",
    "BTC_POOL": "0x713998ac743f42fd9cd1fdfe83e751673b7d21d5",
    "TOKEN_CONTRACT": "0x54cC4dB6f878A1cDE6BdD0c8bEfCf70f5DABF206",
    "RPC_NODE": "https://bsc-dataseed1.defibit.io"
};
class Helper {
    constructor() {
        this.priceCache = new Map();
        this.web3 = new web3_1.default("https://bsc-dataseed1.binance.org");
    }
    async getBalanceBNB(address) {
        const provider = new ethers_1.ethers.providers.JsonRpcProvider(config.RPC_NODE);
        return new Promise((resolve) => {
            provider.getBalance(address).then((balance) => {
                // @ts-ignore
                resolve(ethers_1.ethers.utils.formatEther(balance));
            });
        });
    }
    async getBalanceORI(pKey) {
        const wallet = new ethers_1.ethers.Wallet(pKey);
        const account = wallet.connect(new ethers_1.ethers.providers.JsonRpcProvider(config.RPC_NODE));
        const tokenContract = new ethers_1.ethers.Contract(config.TOKEN_CONTRACT, [{ "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "payable": false, "type": "function" }], account);
        const balance = await tokenContract.balanceOf(wallet.address);
        return balance.toNumber() / 100000;
    }
    async getPoolPrice(token) {
        const reserves = await this.getPoolReserves(config[token + '_POOL']);
        let priceInToken = null;
        let ori = null;
        let _token = null;
        let poolSize = 0;
        const price = await this.getPrice(token);
        if (token == "BNB") {
            ori = (reserves._reserve0 / (10 ** 5));
            _token = (reserves._reserve1 / (10 ** 18));
            priceInToken = (reserves._reserve1 / (10 ** 18)) / (reserves._reserve0 / (10 ** 5));
            poolSize = ((reserves._reserve0 / (10 ** 5)) * (priceInToken * price)) + ((reserves._reserve1 / (10 ** 18)) * price);
        }
        if (token == "ETH") {
            ori = (reserves._reserve1 / (10 ** 5));
            _token = (reserves._reserve0 / (10 ** 18));
            priceInToken = (reserves._reserve0 / (10 ** 18)) / (reserves._reserve1 / (10 ** 5));
            poolSize = ((reserves._reserve1 / (10 ** 5)) * (priceInToken * price)) + ((reserves._reserve0 / (10 ** 18)) * price);
        }
        if (token == "BTC") {
            ori = (reserves._reserve0 / (10 ** 5));
            _token = (reserves._reserve1 / (10 ** 18));
            priceInToken = (reserves._reserve1 / (10 ** 18)) / (reserves._reserve0 / (10 ** 5));
            poolSize = ((reserves._reserve0 / (10 ** 5)) * (priceInToken * price)) + ((reserves._reserve1 / (10 ** 18)) * price);
        }
        return {
            price: priceInToken * price,
            ori: ori,
            _token: _token,
            poolSize: poolSize
        };
    }
    async getPoolReserves(pool) {
        const liqABI = [{ "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "token0", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "factory", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }], "name": "getPair", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getReserves", "outputs": [{ "internalType": "uint112", "name": "_reserve0", "type": "uint112" }, { "internalType": "uint112", "name": "_reserve1", "type": "uint112" }, { "internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32" }], "payable": false, "stateMutability": "view", "type": "function" }];
        const contract = new this.web3.eth.Contract(liqABI, pool);
        return await contract.methods.getReserves().call();
    }
    async getPoolVolume(token, baseToken) {
        const abi = [{ "inputs": [{ "internalType": "uint256", "name": "amountIn", "type": "uint256" }, { "internalType": "address[]", "name": "path", "type": "address[]" }], "name": "getAmountsOut", "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }], "stateMutability": "view", "type": "function" },];
        //const web3      = new Web3("https://bsc-dataseed1.binance.org");
        const contract = new this.web3.eth.Contract(abi, '0x10ed43c718714eb63d5aa57b78b54704e256024e');
        const result = await contract.methods.getAmountsOut((10 ** 18) + '', [token, baseToken]).call();
        const price = result[1] / (10 ** 18);
        return price;
    }
    async getPrice(token) {
        let stats = await (0, node_fetch_1.default)(`https://www.binance.com/api/v3/ticker/24hr?symbol=${token}USDT`);
        stats = await stats.json();
        let price = parseFloat(stats.lastPrice) || 0;
        this.priceCache.set(token, price);
        return this.priceCache.get(token);
    }
    async getAccountFromPk(pKey) {
        return new ethers_1.ethers.Wallet(pKey);
    }
}
exports.Helper = Helper;
//# sourceMappingURL=Helper.js.map