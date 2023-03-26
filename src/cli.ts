#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import { Wallet } from "ethers";

import { gen } from "cli/gen";
import { version } from "../package.json"

const program = new Command();
program
  .name("allowlist")
  .description(
    "The easiest way to add Allowlists to your Solidity smart contracts."
  )
  .version(version);

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

    await gen(mnemonic, files);
  });


program.parse();
