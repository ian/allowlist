import { Wallet, ethers } from "ethers";
import { readFile, writeCSV, writeJSON } from "./config";
import { Entry } from "types";
import { createSignature } from "utils/sigs";

export async function gen(mnemonic, files: string[]) {
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
    // eventually we'll make this iterative over the list of mint groups
    const path = "m/44'/0'/0'" 
    const signer = await getSigner(mnemonic, path);

    for (const entry of deduped) {
      const { address, allocation } = entry
      const key = ethers.utils.keccak256(ethers.utils.getAddress(address));
      const sig = await createSignature(signer, address, allocation)

      signatures[key] = sig;
    }

    console.log()
    console.log("Writing", deduped.length, "addresses to signatures.json");
    await writeJSON(process.cwd() + "/allowlist.json", signatures);

    if (errors.length > 0) {
      console.log("Writing", errors.length, "errors to errors.csv");
      await writeCSV(process.cwd() + "/errors.csv", errors);
    }
}

async function getSigner(mnemonic:string, path:string) {
  return Wallet.fromMnemonic(mnemonic, path)
}
