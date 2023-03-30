import fs from "fs";
import path from "path";
import { Wallet, ethers } from "ethers";
import { readFile, writeCSV, writeJSON } from "./config";
import { Entry, SignatureWithSigner } from "types";
import { createSignature } from "utils/sigs";

export async function gen({
  mnemonic,
  files,
  outputFile,
}: {
  mnemonic: string;
  files: string[];
  outputFile: string;
}) {
  let count = 0;
  const signers: { [file: string]: string } = {};
  const entries: { [addy: string]: Entry & { count: number } } = {};
  const errors: { address: string; error: string }[] = [];
  // const data = files.flatMap((file) => readFile(file));

  for (let i = 0; i < files.length; i++) {
    const data = readFile(files[i]);
    const path = `m/44'/60'/0'/0/${i}`;
    const signer = await getSigner(mnemonic, path);
    const generated = await genSigs(data, signer);

    signers[files[i]] = signer.address;

    generated.entries.map((rec) => {
      entries[rec.address] ||= {
        ...rec,
        count: 0,
      };

      // Always take the higher allocation
      if (rec.num > entries[rec.address].num) {
        Object.assign(entries[rec.address], rec);
      }

      entries[rec.address].count += 1;
      count += 1;
    });

    errors.concat(errors);
  }

  const deduped = Object.values(entries);
  const dupes = Object.entries(entries).filter(
    ([_, entry]: [address: string, entry: { count: number }]) => entry.count > 1
  );

  console.log();
  console.log("-- Results --");
  console.log("Total: ", count);
  console.log("Errors:", errors.length);
  console.log("Unique:", deduped.length);
  console.log("Dupes: ", dupes.length);

  const signatures = {};

  for (const entry of deduped) {
    const { address, sig } = entry;
    const key = ethers.utils.keccak256(ethers.utils.getAddress(address));
    // const sig = await createSignature(signer, address, allocation);

    signatures[key] = sig;
  }

  console.log("Writing", deduped.length, "addresses to", outputFile);

  await fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  await writeJSON(process.cwd() + "/" + outputFile, signatures);

  if (errors.length > 0) {
    console.log("Writing", errors.length, "errors to errors.csv");
    await writeCSV(process.cwd() + "/errors.csv", errors);
  }

  Object.entries(signers).map(([file, address]) => {
    console.log();
    console.log("File:  ", file);
    console.log("Signer:", address);
  });
}

async function genSigs(data: { [key: string]: any }[], signer: Wallet) {
  const entries: {
    address: string;
    num: number;
    sig: SignatureWithSigner;
  }[] = [];

  const errors: { address: string; error: string }[] = [];

  for (const a of data) {
    const addy =
      a.address || // basic
      a.wallet || // basic
      a.mint_wallet_address; // premint

    const num = parseInt((a.allocation || a.amount || a.count || 1).toString());

    if (!addy || addy === "") continue;
    try {
      const address = ethers.utils.getAddress(addy);
      const sig = await createSignature(signer, address, num);

      entries.push({
        address: addy,
        num,
        sig,
      });
    } catch (err) {
      errors.push({
        address: addy,
        error: err.message,
      });
    }
  }

  return {
    entries,
    errors,
  };
}

async function getSigner(mnemonic: string, path: string) {
  return Wallet.fromMnemonic(mnemonic, path);
}
