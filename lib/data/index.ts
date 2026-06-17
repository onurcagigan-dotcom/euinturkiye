import type { DataProvider } from "./provider";
import { GatedDataProvider } from "./gated-provider";

let _instance: DataProvider | null = null;

export function getDataProvider(): DataProvider {
  if (_instance) return _instance;
  const src = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "demo";
  if (src === "firebase") {
    throw new Error("Firebase provider must be loaded client-side via getClientProvider()");
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { DemoDataProvider } = require("./demo");
  const realInstance: DataProvider = new DemoDataProvider();
  const inst: DataProvider = new GatedDataProvider(realInstance);
  _instance = inst;
  return inst;
}
