import { BigNumber,constants,Contract,ethers,Wallet  } from "ethers";
import{FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";
const express = require('express');

const infura = process.env["INFURA_MAINNET"];
const private_key = process.env["PRIVATE_KEY"];
const provider = new ethers.providers.JsonRpcProvider(infura);
const flashBotRelayer = "https://relay.flashbots.net";
const flashBotwallet = new ethers.Wallet(private_key,provider);
function bigNumberToDecimal(value: BigNumber, base = 18): number {
    const divisor = BigNumber.from(10).pow(base)
    return value.mul(10000).div(divisor).toNumber() / 10000
}
const app = async function () {
    const flashBotProvider = await FlashbotsBundleProvider.create(provider,flashBotwallet,flashBotRelayer);
    const signedBundles = await flashBotProvider.signBundle([
        {
            signer: flashBotwallet,
            transaction: {
                chainId: 5,
                type: 2,
                maxFeePerGas: 10n ** 9n *3n,
                maxPriorityFeePerGas: 10n ** 9n *2n,
                gasLimit:100000,
                value: 0,
                data: '0x',
                to: "",//addrss which we can to intrect ,
            },
        },
    ])
    const signedBundle = [
        //list of transaction
    ]
    const blockNumber = await provider.getBlockNumber()
    console.log("simulation start");
    const simulation = await flashBotProvider.simulate(signedBundle,"latest")
    console.log("simulation end");
    console.log('simulation response', simulation)
    if ("error" in simulation || simulation.firstRevert !== undefined) {
        console.log(`Simulation Error , skipping`)
    }
    else {
        console.log(`Submitting bundle, profit sent to miner: ${bigNumberToDecimal(simulation.coinbaseDiff)}, effective gas price: ${bigNumberToDecimal(simulation.coinbaseDiff.div(simulation.totalGasUsed), 9)} GWEI`)
        const flashbotsTransaction = await
            flashBotProvider.sendRawBundle(
                signedBundle,
                blockNumber + 2
            )
        console.log("flashbotsTransaction", flashbotsTransaction)
    }
}

const main = () => {
    setInterval(app, 10000)
}


    
