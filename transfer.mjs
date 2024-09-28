import {
    Horizon as Aurora,
    Asset,
    Keypair,
    TransactionBuilder,
    BASE_FEE,
    Operation,
} from "diamante-sdk-js";

const server = new Aurora.Server("https://diamtestnet.diamcircle.io");

export const setupReceiver = async (receiver, distributor, assetName) => {
    try {
        // Load receiver's account information
        const account = await server.loadAccount(receiver.publicKey());
        // Create the asset with the distributor's public key as the issuer
        const asset = new Asset(assetName, distributor.publicKey());

        const transaction = new TransactionBuilder(account, {
            fee: BASE_FEE,
            networkPassphrase: "Diamante Testnet 2024",
        })
            .addOperation(
                Operation.changeTrust({
                    asset: asset,
                })
            )
            .setTimeout(100)
            .build();

        transaction.sign(receiver);
        const result = await server.submitTransaction(transaction);
        
        if (result.successful) {
            console.log(`Trustline created for asset ${asset.code} with issuer ${asset.getIssuer()}`);
            console.log(`Transaction hash: ${result.hash}`);
        }
    } catch (e) {
        console.error("Error in setupReceiver:", e);
    }
};

export const transferAsset = async (holder, assetName, distributor, receiver) => {
    try {
        // Load holder's account information
        const account = await server.loadAccount(holder.publicKey());
        const asset = new Asset(assetName, distributor.publicKey());

        const transaction = new TransactionBuilder(account, {
            fee: BASE_FEE,
            networkPassphrase: "Diamante Testnet 2024",
        })
            .addOperation(
                Operation.payment({
                    destination: receiver.publicKey(),
                    asset: asset,
                    amount: "500", // Adjust the amount as needed
                })
            )
            .setTimeout(100)
            .build();

        transaction.sign(holder);
        const result = await server.submitTransaction(transaction);
        
        if (result.successful) {
            console.log(`Asset ${asset.code} transferred from ${holder.publicKey()} to ${receiver.publicKey()}`);
            console.log(`Transaction hash: ${result.hash}`); 
        }
    } catch (e) {
        console.error("Error in transferAsset:", e);
    }
};
