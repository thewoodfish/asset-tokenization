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

// Local imports
import * as util from "./utility.js";
// import * as chain from "./mediator.cjs.js";

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))


// Blockchain essentials
import { mnemonicGenerate, cryptoWaitReady, blake2AsHex, xxhashAsHex } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';
import { contracts, MultiAddress, assets } from "@polkadot-api/descriptors"
import { getPolkadotSigner } from "polkadot-api/signer"
import { getInkClient } from "polkadot-api/ink"
import { createClient } from "polkadot-api"
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat"
import { getWsProvider } from "polkadot-api/ws-provider/web"

const client = createClient(
    withPolkadotSdkCompat(
        getWsProvider("ws://127.0.0.1:9944"),
    ),
);

const typedApi = client.getTypedApi(assets);
const assetVerse = getInkClient(contracts.assets)

const CONTRACT_INSTANCE = "5G19nGcPGPx2RihrokRHbeKPh6LAkAtoUfnQVAenFq4WMdtG";
const keyring = new Keyring({ type: 'sr25519' });

// You optionally can make sure the hash hasn't changed by checking compatibility
// if (!(await contract.isCompatible())) {
//     throw new Error("Contract has changed");
// }

// test accounts
let alice = {};
let bob = {};
let alice_signer = {};

// wait 5 secs for the wasm init
setTimeout(async () => {
    await cryptoWaitReady().then(() => {
        alice = keyring.addFromUri('//Alice');    // for running tests
        bob = keyring.addFromUri('//Bob');    // for running tests

        alice_signer = getPolkadotSigner(alice.publicKey, "Sr25519", alice.sign);
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
    createAccount(req.body, res);
});

app.post('/register-asset', (req, res) => {
    registerAsset(req.body, res);
});

app.get('/get-assets', (req, res) => {
    fetchAssets(res);
});

// Fetch available games and their assets
async function fetchAssets(res) {
    const storage = await typedApi.apis.ContractsApi.get_storage(
        CONTRACT_INSTANCE,
        assetVerse.storage().encode(),
    )
    console.log(
        "storage",
        storage.success ? storage.value?.asHex() : storage.value,
    )

    if (storage.success && storage.value) {
        const decoded = assetVerse.storage().decode(storage.value)
        console.log("storage nft", decoded)
    }
}

// Create a new account on chain 
async function createAccount(req, res) {
    try {
        // First generate the mnemonics and account
        const mnemonic = mnemonicGenerate();
        const user = keyring.createFromUri(mnemonic, 'sr25519');

        const createAccount = assetVerse.message("register_player");
        const data = createAccount.encode({ name: req.data });

        const response = await typedApi.apis.ContractsApi.call(
            alice.address /* user.address */,
            CONTRACT_INSTANCE,
            100_000_000n,
            undefined,
            undefined,
            data,
        )

        if (response.result.success) {
            console.log(createAccount.decode(response.result.value));
            console.log(assetVerse.event.filter(CONTRACT_INSTANCE, response.events));

            console.log("tx events", assetVerse.event.filter(CONTRACT_INSTANCE, response.events));

            return res.send({
                data: {
                    seed: mnemonic,
                    ss58_addr: user.address
                },
                error: false
            })

        } else {
            console.log(
                response.result.value,
                response.gas_consumed,
                response.gas_required,
            );

            throw new Error();
        }
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
        let req_data = req.data.split("$$$");

        // pub fn register_asset(&mut self, name: String, price: Balance) {
        //     // Insert into storage
        //     self.assets.insert(&name, &price);
        // }

        // Asset name (prefixed by game name)
        let asset_info = [req_data[0], req_data[1]];
        let asset_name = asset_info.join("_");

        // Set up request
        const registerAsset = assetVerse.message("register_asset");
        const data = registerAsset.encode({ name: asset_name, price: BigInt(req_data[2]) });

        const response = await typedApi.apis.ContractsApi.call(
            alice.address /* user.address */,
            CONTRACT_INSTANCE,
            100_000_000n,
            undefined,
            undefined,
            data,
        )

        if (response.result.success) {
            console.log(registerAsset.decode(response.result.value));
            console.log(assetVerse.event.filter(CONTRACT_INSTANCE, response.events));

            console.log("tx events", assetVerse.event.filter(CONTRACT_INSTANCE, response.events));

            return res.send({
                data: "Asset successfully registered!",
                error: false
            })

        } else {
            console.log(
                response.result.value,
                response.gas_consumed,
                response.gas_required,
            );

            throw new Error();
        }
    } catch (e) {
        return res.send({
            data: "Error registering assets",
            error: false
        })
    }
}

// listen on port 3000
app.listen(port, () => console.info(`listening on port ${port}`))