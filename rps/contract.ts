import { BN, BN_ONE, BN_TWO } from "@polkadot/util";
import type { WeightV2 } from '@polkadot/types/interfaces'

const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE);
const PROOFSIZE = new BN(1_000_000);
const storageDepositLimit: BN = new BN(1000);

export async function registerPlayer(api: any, contract: any, account: any, name: string) {
    // Get the initial gas WeightV2 using api.consts.system.blockWeights['maxBlock']
    const gasLimit = api.registry.createType(
        'WeightV2',
        api.consts.system.blockWeights['maxBlock']
    )

    // Query the contract message
    // This will return the gas required and storageDeposit to execute the message
    // and the result of the message
    const { gasRequired, storageDeposit, result } = await contract.query.registerPlayer(
        account.address,
        {
            gasLimit: gasLimit,
            storageDepositLimit: null,
            value: new BN('1000000000000000000')
        }, name
    )

    // Check for errors
    if (result.isErr) {
        let error = ''
        if (result.asErr.isModule) {
            const dispatchError = api.registry.findMetaError(result.asErr.asModule)
            error = dispatchError.docs.length ? dispatchError.docs.concat().toString() : dispatchError.name
        } else {
            error = result.asErr.toString()
        }

        console.error(error)
        return
    }

    // Gas require is more than gas returned in the query
    // To be safe, we double the gasLimit.
    // Note, doubling gasLimit will not cause spending more gas for the Tx
    const estimatedGas = api.registry.createType(
        'WeightV2',
        {
            refTime: gasRequired.refTime.toBn().mul(BN_TWO),
            proofSize: gasRequired.proofSize.toBn().mul(BN_TWO),
        }
    ) as WeightV2

    const unsub = await contract.tx
        .registerPlayer({
            gasLimit: estimatedGas,
            storageDepositLimit: null,
            value: new BN('10000000') // 1 TOKEN or it could be value you want to send to the contract in title
        }, name)
        .signAndSend(account, (res: any) => {
            // Send the transaction, like elsewhere this is a normal extrinsic
            // with the same rules as applied in the API (As with the read example,
            // additional params, if required can follow)
            if (res.status.isInBlock) {
                console.log('in a block')
            }
            if (res.status.isFinalized) {
                console.log('Successfully sent the txn')
                unsub()
            }
        })
}

// pub fn register_asset(&mut self, game: String, name: String, price: Balance) {


export async function registerAsset(api: any, contract: any, account: any, game: string, name: String, price: any) {
    // Get the initial gas WeightV2 using api.consts.system.blockWeights['maxBlock']
    const gasLimit = api.registry.createType(
        'WeightV2',
        api.consts.system.blockWeights['maxBlock']
    )

    // Query the contract message
    // This will return the gas required and storageDeposit to execute the message
    // and the result of the message
    const { gasRequired, storageDeposit, result } = await contract.query.registerAsset(
        account.address,
        {
            gasLimit: gasLimit,
            storageDepositLimit: null,
            value: new BN('1000000000000000000')
        }, game, name, new BN(price)
    )

    // Check for errors
    if (result.isErr) {
        let error = ''
        if (result.asErr.isModule) {
            const dispatchError = api.registry.findMetaError(result.asErr.asModule)
            error = dispatchError.docs.length ? dispatchError.docs.concat().toString() : dispatchError.name
        } else {
            error = result.asErr.toString()
        }

        console.error(error)
        return
    }

    // Gas require is more than gas returned in the query
    // To be safe, we double the gasLimit.
    // Note, doubling gasLimit will not cause spending more gas for the Tx
    const estimatedGas = api.registry.createType(
        'WeightV2',
        {
            refTime: gasRequired.refTime.toBn().mul(BN_TWO),
            proofSize: gasRequired.proofSize.toBn().mul(BN_TWO),
        }
    ) as WeightV2

    const unsub = await contract.tx
        .registerAsset({
            gasLimit: estimatedGas,
            storageDepositLimit: null,
            value: new BN('10000000') // 1 TOKEN or it could be value you want to send to the contract in title
        }, game, name, new BN(price))
        .signAndSend(account, (res: any) => {
            // Send the transaction, like elsewhere this is a normal extrinsic
            // with the same rules as applied in the API (As with the read example,
            // additional params, if required can follow)
            if (res.status.isInBlock) {
                console.log('in a block')
            }
            if (res.status.isFinalized) {
                console.log('Successfully sent the txn')
                unsub()
            }
        })
}

export async function fetchGames(api: any, contract: any, account: any): Promise<any> {
    const { result, output } = await contract.query.games(
        account.address,
        {
            gasLimit: api?.registry.createType('WeightV2', {
                refTime: MAX_CALL_WEIGHT,
                proofSize: PROOFSIZE,
            }) as WeightV2,
            storageDepositLimit,
        });

    return result.toHuman();
}

export async function fetchAssets(api: any, contract: any, account: any, game: any): Promise<any> {
    const { result, output } = await contract.query.assets(
        account.address,
        {
            gasLimit: api?.registry.createType('WeightV2', {
                refTime: MAX_CALL_WEIGHT,
                proofSize: PROOFSIZE,
            }) as WeightV2,
            storageDepositLimit,
        }, game);

    return result.toHuman();
}

export async function buyAsset(api: any, contract: any, account: any, game: string, name: String, amount: any) {
    // Get the initial gas WeightV2 using api.consts.system.blockWeights['maxBlock']
    const gasLimit = api.registry.createType(
        'WeightV2',
        api.consts.system.blockWeights['maxBlock']
    )

    // Query the contract message
    // This will return the gas required and storageDeposit to execute the message
    // and the result of the message
    const { gasRequired, storageDeposit, result } = await contract.query.purchaseAsset(
        account.address,
        {
            gasLimit: gasLimit,
            storageDepositLimit: null,
            value: new BN('1000000000000000000')
        }, game, name, amount
    )

    // Check for errors
    if (result.isErr) {
        let error = ''
        if (result.asErr.isModule) {
            const dispatchError = api.registry.findMetaError(result.asErr.asModule)
            error = dispatchError.docs.length ? dispatchError.docs.concat().toString() : dispatchError.name
        } else {
            error = result.asErr.toString()
        }

        console.error(error)
        return
    }

    // Gas require is more than gas returned in the query
    // To be safe, we double the gasLimit.
    // Note, doubling gasLimit will not cause spending more gas for the Tx
    const estimatedGas = api.registry.createType(
        'WeightV2',
        {
            refTime: gasRequired.refTime.toBn().mul(BN_TWO),
            proofSize: gasRequired.proofSize.toBn().mul(BN_TWO),
        }
    ) as WeightV2

    const unsub = await contract.tx
        .purchaseAsset({
            gasLimit: estimatedGas,
            storageDepositLimit: null,
            value: new BN('10000000') // 1 TOKEN or it could be value you want to send to the contract in title
        }, game, name, amount)
        .signAndSend(account, (res: any) => {
            // Send the transaction, like elsewhere this is a normal extrinsic
            // with the same rules as applied in the API (As with the read example,
            // additional params, if required can follow)
            if (res.status.isInBlock) {
                console.log('in a block')
            }
            if (res.status.isFinalized) {
                console.log('Successfully sent the txn')
                unsub()
            }
        })
}


export async function giftAsset(api: any, contract: any, account: any, reciever: any, name: String, amount: any) {
    // Get the initial gas WeightV2 using api.consts.system.blockWeights['maxBlock']
    const gasLimit = api.registry.createType(
        'WeightV2',
        api.consts.system.blockWeights['maxBlock']
    )

    // Query the contract message
    // This will return the gas required and storageDeposit to execute the message
    // and the result of the message
    const { gasRequired, storageDeposit, result } = await contract.query.giftAsset(
        account.address,
        {
            gasLimit: gasLimit,
            storageDepositLimit: null,
            value: new BN('1000000000000000000')
        }, reciever, name, amount
    )

    // Check for errors
    if (result.isErr) {
        let error = ''
        if (result.asErr.isModule) {
            const dispatchError = api.registry.findMetaError(result.asErr.asModule)
            error = dispatchError.docs.length ? dispatchError.docs.concat().toString() : dispatchError.name
        } else {
            error = result.asErr.toString()
        }

        console.error(error)
        return
    }

    // Gas require is more than gas returned in the query
    // To be safe, we double the gasLimit.
    // Note, doubling gasLimit will not cause spending more gas for the Tx
    const estimatedGas = api.registry.createType(
        'WeightV2',
        {
            refTime: gasRequired.refTime.toBn().mul(BN_TWO),
            proofSize: gasRequired.proofSize.toBn().mul(BN_TWO),
        }
    ) as WeightV2

    const unsub = await contract.tx
        .giftAsset({
            gasLimit: estimatedGas,
            storageDepositLimit: null,
            value: new BN('10000000') // 1 TOKEN or it could be value you want to send to the contract in title
        }, reciever, name, amount)
        .signAndSend(account, (res: any) => {
            // Send the transaction, like elsewhere this is a normal extrinsic
            // with the same rules as applied in the API (As with the read example,
            // additional params, if required can follow)
            if (res.status.isInBlock) {
                console.log('in a block')
            }
            if (res.status.isFinalized) {
                console.log('Successfully sent the txn')
                unsub()
            }
        })
}

export async function swapAsset(api: any, contract: any, account: any, asset: String, amount: any, asset_1: String, amount_1: any) {
    // Get the initial gas WeightV2 using api.consts.system.blockWeights['maxBlock']
    const gasLimit = api.registry.createType(
        'WeightV2',
        api.consts.system.blockWeights['maxBlock']
    )

    // Query the contract message
    // This will return the gas required and storageDeposit to execute the message
    // and the result of the message
    const { gasRequired, storageDeposit, result } = await contract.query.exchangeAsset(
        account.address,
        {
            gasLimit: gasLimit,
            storageDepositLimit: null,
            value: new BN('1000000000000000000')
        }, asset, amount, asset_1, amount_1
    )

    // Check for errors
    if (result.isErr) {
        let error = ''
        if (result.asErr.isModule) {
            const dispatchError = api.registry.findMetaError(result.asErr.asModule)
            error = dispatchError.docs.length ? dispatchError.docs.concat().toString() : dispatchError.name
        } else {
            error = result.asErr.toString()
        }

        console.error(error)
        return
    }

    // Gas require is more than gas returned in the query
    // To be safe, we double the gasLimit.
    // Note, doubling gasLimit will not cause spending more gas for the Tx
    const estimatedGas = api.registry.createType(
        'WeightV2',
        {
            refTime: gasRequired.refTime.toBn().mul(BN_TWO),
            proofSize: gasRequired.proofSize.toBn().mul(BN_TWO),
        }
    ) as WeightV2

    const unsub = await contract.tx
        .exchangeAsset({
            gasLimit: estimatedGas,
            storageDepositLimit: null,
            value: new BN('1000000000000000000') // 1 TOKEN or it could be value you want to send to the contract in title
        }, asset, amount, asset_1, amount_1)
        .signAndSend(account, (res: any) => {
            // Send the transaction, like elsewhere this is a normal extrinsic
            // with the same rules as applied in the API (As with the read example,
            // additional params, if required can follow)
            if (res.status.isInBlock) {
                console.log('in a block')
            }
            if (res.status.isFinalized) {
                console.log('Successfully sent the txn')
                unsub()
            }
        })
}

