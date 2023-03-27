export type Entry = { 
  address: string; 
  allocation: number
};

export type Signature = {
  s: string;
  n: number;
};

export type SignatureWithSigner = {
  x: string;
} & Signature;

export type SignaturesJSON = {
  [key: string]: SignatureWithSigner
}