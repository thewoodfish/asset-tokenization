// Copyright (c) 2023 Algorealm, Inc.

// imports
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import path, { parse } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;
const cors = require("cors");

// static files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/img', express.static(__dirname + 'public/img'));

// set views
app.set('views', './views');
app.set('view engine', 'ejs');

// blockchain essentials
// import { ApiPromise, WsProvider } from '@polkadot/api';
// import { mnemonicGenerate, cryptoWaitReady, blake2AsHex } from '@polkadot/util-crypto';
// const { Keyring } = require('@polkadot/keyring');
// import { ContractPromise } from '@polkadot/api-contract';

// local imports
import * as util from "./utility.js";
import * as meta from "./metadata.js";
// import * as chain from "./mediator.cjs.js";

// blockchain config
// const wsProvider = new WsProvider('wss://rococo-contracts-rpc.polkadot.io');
// const chainApi = await ApiPromise.create({ provider: wsProvider });
// const keyring = new Keyring({ type: 'sr25519' });
// const contract_addr = "5GpVUDUCJtMcXtwocMuD89JXZ94BNdxhdn3MaqBRXmo5BZFH";
// const contract = new ContractPromise(chainApi, meta.metadata(), contract_addr);

// Funded account (ROC)
// const MNEMONICS = "dilemma quarter decrease simple climb boring liberty tobacco upper axis neutral suit";

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.get('', (req, res) => {
    res.render('index', { text: 'This is sparta' });
});

// listen on port 3000
app.listen(port, () => console.info(`listening on port ${port}`));