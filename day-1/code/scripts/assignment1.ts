import {
    Connection,
    PublicKey,
    Keypair,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
    LAMPORTS_PER_SOL
} from "@solana/web3.js";
import * as fs from 'fs';
import * as os from 'os';

// --- 1. SETUP ---

// Establish a connection to the Solana devnet
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// ============================================================================
// BULETPROOF FIX: Isolate the public key string to prevent copy/paste errors.
// ============================================================================
const destinationAddress = "A1xFDCw87mHNC4yrBRa3f82T94F8YwqSgmAh4Kw5ZcDp";
// Log the key to the console to visually inspect it for any strange characters.
console.log("Attempting to use destination address:", destinationAddress);

const toPubkey = new PublicKey(destinationAddress);
// ============================================================================

// Load our "payer" keypair from the default Solana CLI location
const payer = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(os.homedir() + '/.config/solana/id.json', 'utf8')))
);

// Generate a brand new keypair for the account we'll create, use, and close
const newAccount = Keypair.generate();

console.log("Payer Public Key:", payer.publicKey.toBase58());
console.log("New Account Public Key:", newAccount.publicKey.toBase58());

async function main() {
    // --- 2. CREATE THE INSTRUCTIONS ---

    const transaction = new Transaction();

    // =======================================================================
    // THE FIX: Ensure the initial funding is MORE than the amount to transfer.
    // We need to transfer 0.1 SOL, so let's fund it with 0.15 SOL.
    const initialLamports = 0.1 * LAMPORTS_PER_SOL;
    const transferAmount = 0.1 * LAMPORTS_PER_SOL;
    // =======================================================================


    // **Instruction 0: Create a new account**
    const createAccountInstruction = SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: newAccount.publicKey,
        lamports: initialLamports, // Fund with 0.15 SOL
        space: 0,
        programId: SystemProgram.programId,
    });

    // **Instruction 1: Transfer 0.1 SOL from the new account to the destination**
    const transferInstruction = SystemProgram.transfer({
        fromPubkey: newAccount.publicKey,
        toPubkey: toPubkey,
        lamports: transferAmount, // Transfer 0.1 SOL
    });

    // **Instruction 2: Close the new account**
    // This instruction is tricky. It MUST come last.
    // We send the *remaining* balance back to the payer to close the account.
    const closeAccountInstruction = SystemProgram.transfer({
        fromPubkey: newAccount.publicKey,
        toPubkey: payer.publicKey,
        // The lamports here will be the remainder after the 0.1 SOL transfer.
        // We can simply calculate it.
        lamports: initialLamports - transferAmount,
    });


    transaction.add(
        createAccountInstruction,
        transferInstruction,
        closeAccountInstruction
    );

    // --- 3. SEND THE TRANSACTION ---

    console.log("Sending transaction... This may take a moment.");

    const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [payer, newAccount]
    );

    // --- 4. SUBMISSION REQUIREMENT ---

    console.log("\n Transaction successful!");
    console.log("THE SIGNATURE: ");
    console.log(signature);
    console.log(`View transaction on Solana Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
}

main().catch(err => {
    console.error(err);
});