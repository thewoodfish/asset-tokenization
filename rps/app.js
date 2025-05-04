// Copyright (c) 2025 Algorealm, Inc.

// Imports
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import path, { parse } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 4000;
const cors = require("cors");

// Static files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/img', express.static(__dirname + 'public/img'));

// Set views
app.set('views', './views');
app.set('view engine', 'ejs');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))


// blockchain essentials
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import { mnemonicGenerate, cryptoWaitReady, blake2AsHex, xxhashAsHex } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';


// blockchain config
const contract_addr = "5GfEb4cAtED2TfiG4DX19z995SrR7XRR7NMhxx2v8FecNARJ";
const wsProvider = new WsProvider('ws://127.0.0.1:9944');
const api = await ApiPromise.create({ provider: wsProvider });
const contract = new ContractPromise(api, meta.metadata(), contract_addr);
const keyring = new Keyring({ type: 'sr25519' });

// contract API import
const chain = await import('./contract.cjs');

// contract metadata import
import * as meta from "./metadata.js";

// test accounts
let alice = {};
let bob = {};

// wait 5 secs for the wasm init
setTimeout(async () => {
    await cryptoWaitReady().then(() => {
        alice = keyring.addFromUri('//Alice');    // for running tests
        bob = keyring.addFromUri('//Bob');    // for running tests
    });
}, 5000);

app.get('', (req, res) => {
    res.render('index', { text: 'This is sparta' });
});

// Chain Menu
app.get('/chain-menu', (req, res) => {
    res.render('chain-x', {});
});

app.post('/gen-keys', (req, res) => {
    registerPlayer(req.body, res);
});

app.post('/register-asset', (req, res) => {
    registerAsset(req.body, res);
});

app.get('/get-games', (_req, res) => {
    fetchGames(res);
});

app.post('/get-assets', (req, res) => {
    fetchAssets(req.body, res);
});

app.post('/buy-asset', (req, res) => {
    buyAsset(req.body, res);
});

app.post('/auth', (req, res) => {
    authAccount(req.body, res);
});

app.post('/gift-asset', (req, res) => {
    giftAsset(req.body, res);
});

app.post('/swap-assets', (req, res) => {
    swapAssets(req.body, res);
});

// Create a new account on chain 
async function registerPlayer(req, res) {
    try {
        // First generate the mnemonics and account
        const mnemonic = mnemonicGenerate();
        const user = keyring.createFromUri(mnemonic, 'sr25519');

        // Call contract to register account
        await chain.registerPlayer(api, contract, /* user */bob, req.data).then(() => {
            // Return the keys to the user for next auth
            return res.send({
                data: {
                    seed: mnemonic,
                },
                error: false
            })
        });
    } catch (e) {
        return res.send({
            data: {
                seed: "",
            },
            error: true
        })
    }
}

// Register asset onchain
async function registerAsset(req, res) {
    try {
        // Get data
        const data = req.data.split("$$$");

        // Call contract to register asset
        await chain.registerAsset(api, contract, /* user */bob, data[0] + "$", data[1] + "$", BigInt(data[2])).then(() => {
            // Return the keys to the user for next auth
            return res.send({
                data: "Asset successfully registered",
                error: false
            })
        });
    } catch (e) {
        return res.send({
            data: "Error registering assets",
            error: false
        })
    }
}

// Fetch games
async function fetchGames(res) {
    // We get all the games first
    await chain.fetchGames(api, contract, /*user */ bob).then(data => {
        // Decode data
        data = filterNonStringChars(decodeContractData(data));

        return res.send({
            data,
            error: false
        })
    });
}


// Fetch games
async function fetchAssets(req, res) {
    // We get all the games first
    await chain.fetchAssets(api, contract, /*user */ bob, req.data.trim() + "$").then(data => {
        // Decode data
        data = filterNonStringChars(decodeContractData(data));
        return res.send({
            data,
            error: false
        })
    });
}

// Purchase asset
async function buyAsset(req, res) {
    try {
        // Get data
        const data = req.data.split("$$$");

        // Call contract to purchase asset
        await chain.buyAsset(api, contract, /* user */bob, data[0].trim() + "$", data[1] + "$", parseInt(data[2])).then(() => {
            // Return the keys to the user for next auth
            return res.send({
                data: "Asset successfully bought!",
                error: false
            })
        });
    } catch (e) {
        return res.send({
            data: "Asset purchase failed. Please try again later",
            error: false
        })
    }
}

// Gift asset to someone else
async function giftAsset(req, res) {
    try {
        // Get data
        const data = req.data.split("$$$");

        console.log(data);

        // Call contract to buy asset
        await chain.giftAsset(api, contract, /* user */bob, data[3], data[1].trim() + "$", parseInt(data[2])).then(() => {
            // Return the keys to the user for next auth
            return res.send({
                data: "Asset gifted successfully!",
                error: false
            })
        });
    } catch (e) {
        return res.send({
            data: "Gifting failed. Please try again later",
            error: false
        })
    }
}


// Swap assets across games
async function swapAssets(req, res) {
    try {
        // Get data
        const data = req.data.split("$$$");

        // Call contract to buy asset
        await chain.swapAsset(api, contract, /* user */bob, data[1] + "$", parseInt(data[2]), data[4] + "$", parseInt(data[5])).then(() => {
            // Return the keys to the user for next auth
            return res.send({
                data: "Asset swaped successfully!",
                error: false
            })
        });
    } catch (e) {
        return res.send({
            data: "Swapping failed. Please try again later",
            error: false
        })
    }
}


function filterNonStringChars(str) {
    return str.replace(/[^$a-zA-Z0-9 \-~]/g, "");
}

function decodeContractData(data) {
    const hexString = data.Ok.data.slice(2);
    const buffer = Buffer.from(hexString.slice(2), 'hex');
    return buffer.toString().trim();
}

// listen on port 3000
app.listen(port, () => console.info(`listening on port ${port}`))