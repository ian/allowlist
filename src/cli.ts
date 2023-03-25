import chalk from "chalk";
import inquirer from "inquirer";
import { ethers, Wallet } from "ethers";

import { createMessage, sign } from "./lib";
import { Command } from "commander";
import { readFile, writeCSV, writeJSON } from "./util";
import { getSigner } from "./crypto";
import { Entry } from "./types";

const program = new Command();
program
  .name("allowlist")
  .description(
    "The easiest way to add Allowlists to your Solidity smart contracts."
  )
  .version(require("../package.json").version);

program
  .command("bip39")
  .description("Creates a random BIP39 key")
  .action(async () => {
    const wallet = Wallet.createRandom();
    console.log("BIP39 Mnemonic Generated:");
    console.log();
    console.log(chalk.greenBright(wallet.mnemonic.phrase));
    console.log();
    console.log(
      "Please make sure to store this somewhere safe. You will need it to sign the allowlist."
    );
  });

program
  .command("gen")
  .description("Generates a signature file for the given CSV file.")
  .argument("<files...>", "CSV files to process")
  .action(async (files, opts) => {
    const { mnemonic } = await inquirer.prompt([
      {
        name: "mnemonic",
        type: "input",
        message: "Enter your BIP39 mnemonic seed phrase",
      },
    ]);

    const entries: { [addy: string]: Entry & { count: number } } =
      {};
    const errors: { address: string; error: string }[] = [];

    const data = files.flatMap((file) => readFile(file));
    for (const a of data) {
      const addy =
        a.address || // basic
        a.wallet || // basic
        a.mint_wallet_address; // premint

      const allocation = a.allocation || 1;

      if (!addy || addy === "") continue;
      try {
        const address = ethers.utils.getAddress(addy);
        entries[address] ||= {
          address: addy,
          count: 0,
          allocation: parseInt(allocation),
        };
        entries[address].count += 1;
      } catch (err) {
        errors.push({
          address: addy,
          error: err.message,
        });
      }
    }

    const deduped = Object.values(entries);
    const dupes = Object.entries(entries).filter(
      ([_, entry]: [address: string, entry: { count: number }]) =>
        entry.count > 1
    );

    console.log()
    console.log("-- Results --")
    console.log("Total: ", data.length);
    console.log("Errors:", errors.length);
    console.log("Unique:", deduped.length);
    console.log("Dupes: ", dupes.length);

    const signatures = {};

    const signer = await getSigner(mnemonic, "m/44'/0'/0'");

    for (const entry of deduped) {
      const { address, allocation } = entry
      const msg = createMessage(address, allocation);
      const sig = await sign(signer, msg);
      const key = ethers.utils.keccak256(ethers.utils.getAddress(address));

      signatures[key] = {
        s: sig,
        n: allocation,
      };
    }

    console.log()
    console.log("Writing", deduped.length, "addresses to signatures.json");
    await writeJSON(process.cwd() + "/signatures.json", signatures);

    if (errors.length > 0) {
      console.log("Writing", errors.length, "errors to errors.csv");
      await writeCSV(process.cwd() + "/errors.csv", errors);
    }
  });

program.parse();
