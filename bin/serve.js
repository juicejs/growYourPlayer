"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Juice_1 = require("@juicejs/juice/Juice");
const OriWebsite_1 = require("../src/OriWebsite");
// const express = require('express');const app = express();const PORT = 8235;
Juice_1.Juice.init([]).connect({
    connectionString: "mongodb+srv://juicecomerce-website:5ej78TkMC4390Uc6@juice-db-cluster-development-784f52e2.mongo.ondigitalocean.com/juicecommerce-website?tls=true&authSource=admin&replicaSet=juice-db-cluster-development"
}).start(OriWebsite_1.OriWebsite);
// app.use(express.static('./'));
//
// app.get('/', (req, res) => {
//     res.send('Hello World!');});
//
// app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
//# sourceMappingURL=serve.js.map