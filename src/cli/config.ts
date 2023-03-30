import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import Papa from "papaparse";

export const readFile = (name: string) => {
  const csv = fs.readFileSync(process.cwd() + "/" + name, "utf8");
  return Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
  }).data;
};

export const writeJSON = (filename: string, json) => {
  return fs.writeFileSync(
    filename,
    // JSON.stringify(json)
    JSON.stringify(json, null, 2)
  );
};

export const writeCSV = (filename: string, data) => {
  return createObjectCsvWriter({
    path: filename,
    header: [
      { id: "address", title: "Address" },
      { id: "error", title: "Error" },
    ],
  }).writeRecords(data); // returns a promise
};

export const stringToUint8Array = (str: string) => {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes;
};
