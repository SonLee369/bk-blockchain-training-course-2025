// Simple approach - just create tokens without metadata
import {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
    MINT_SIZE,
    TOKEN_PROGRAM_ID,
    createAssociatedTokenAccountInstruction,
    createInitializeMintInstruction,
    createMintToInstruction,
    getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import * as fs from "fs";
import * as os from "os";

// --- SETUP ---
const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const payer = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(os.homedir() + '/.config/solana/id.json', 'utf8')))
);
const otherReceiver = new PublicKey("63EEC9FfGyksm7PkVC6z8uAmqozbQcTzbkWJNsgqjkFs");

// Generate mint keypairs
const fungibleMintKp = Keypair.generate();
const nftMintKp = Keypair.generate();
const fungibleDecimals = 6;

async function main() {
    console.log("Starting token creation...");
    console.log("Payer:", payer.publicKey.toBase58());
    console.log("Fungible Mint:", fungibleMintKp.publicKey.toBase58());
    console.log("NFT Mint:", nftMintKp.publicKey.toBase58());

    // --- CREATE FUNGIBLE TOKEN ---
    console.log("\n Creating Fungible Token...");

    const payerATA = getAssociatedTokenAddressSync(fungibleMintKp.publicKey, payer.publicKey);
    const otherReceiverATA = getAssociatedTokenAddressSync(fungibleMintKp.publicKey, otherReceiver);

    const ftTransaction = new Transaction().add(
        // Create mint account
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: fungibleMintKp.publicKey,
            space: MINT_SIZE,
            lamports: await connection.getMinimumBalanceForRentExemption(MINT_SIZE),
            programId: TOKEN_PROGRAM_ID,
        }),
        // Initialize mint
        createInitializeMintInstruction(
            fungibleMintKp.publicKey,
            fungibleDecimals,
            payer.publicKey,
            payer.publicKey
        ),
        // Create payer's ATA
        createAssociatedTokenAccountInstruction(
            payer.publicKey,
            payerATA,
            payer.publicKey,
            fungibleMintKp.publicKey
        ),
        // Mint 100 tokens to payer
        createMintToInstruction(
            fungibleMintKp.publicKey,
            payerATA,
            payer.publicKey,
            100 * (10 ** fungibleDecimals)
        ),
        // Create other receiver's ATA
        createAssociatedTokenAccountInstruction(
            payer.publicKey,
            otherReceiverATA,
            otherReceiver,
            fungibleMintKp.publicKey
        ),
        // Mint 10 tokens to other receiver
        createMintToInstruction(
            fungibleMintKp.publicKey,
            otherReceiverATA,
            payer.publicKey,
            10 * (10 ** fungibleDecimals)
        )
    );

    const ftSignature = await sendAndConfirmTransaction(
        connection,
        ftTransaction,
        [payer, fungibleMintKp]
    );
    console.log("Fungible Token created:", ftSignature);

    // --- CREATE NFT ---
    console.log("\n Creating NFT...");

    const nftATA = getAssociatedTokenAddressSync(nftMintKp.publicKey, payer.publicKey);

    const nftTransaction = new Transaction().add(
        // Create NFT mint account
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: nftMintKp.publicKey,
            space: MINT_SIZE,
            lamports: await connection.getMinimumBalanceForRentExemption(MINT_SIZE),
            programId: TOKEN_PROGRAM_ID,
        }),
        // Initialize NFT mint (0 decimals)
        createInitializeMintInstruction(
            nftMintKp.publicKey,
            0,
            payer.publicKey,
            payer.publicKey
        ),
        // Create NFT ATA
        createAssociatedTokenAccountInstruction(
            payer.publicKey,
            nftATA,
            payer.publicKey,
            nftMintKp.publicKey
        ),
        // Mint 1 NFT
        createMintToInstruction(
            nftMintKp.publicKey,
            nftATA,
            payer.publicKey,
            1
        )
    );

    const nftSignature = await sendAndConfirmTransaction(
        connection,
        nftTransaction,
        [payer, nftMintKp]
    );
    console.log("NFT created:", nftSignature);

    // --- RESULTS ---
    console.log("\n SUCCESS! All tokens created!");

    console.log("\n THE SIGNATURES:");
    console.log("Fungible Token:", ftSignature);
    console.log("NFT:", nftSignature);

    console.log("\n THE ADDRESSES:");
    console.log("Fungible Mint:", fungibleMintKp.publicKey.toBase58());
    console.log("NFT Mint:", nftMintKp.publicKey.toBase58());
    console.log("Your FT Balance:", payerATA.toBase58());
    console.log("Other's FT Balance:", otherReceiverATA.toBase58());
    console.log("Your NFT:", nftATA.toBase58());

    console.log("\n VIEW ON EXPLORER:");
    console.log(`FT: https://explorer.solana.com/tx/${ftSignature}?cluster=devnet`);
    console.log(`NFT: https://explorer.solana.com/tx/${nftSignature}?cluster=devnet`);
}

main().catch(err => {
    console.error("Error:", err);
});