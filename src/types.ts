export type Entry = {
  address: string;
  num: number;
  sig: SignatureWithSigner;
};

export type Signature = {
  s: string;
  n: number;
};

export type SignatureWithSigner = {
  x: string;
} & Signature;

export type SignaturesJSON = {
  [key: string]: SignatureWithSigner;
};
