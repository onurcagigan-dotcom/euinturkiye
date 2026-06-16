import type { DataProvider } from "./provider";

let _instance: DataProvider | null = null;

export function getDataProvider(): DataProvider {
  if (_instance) return _instance;
  const src = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "demo";
  if (src === "firebase") {
    throw new Error("Firebase provider must be loaded client-side via getClientProvider()");
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { DemoDataProvider } = require("./demo");
  const inst: DataProvider = new DemoDataProvider();
  _instance = inst;
  return inst;
}
