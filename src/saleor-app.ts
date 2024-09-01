import { SaleorApp } from "@saleor/app-sdk/saleor-app";
import { FileAPL, UpstashAPL, SaleorCloudAPL, type APL } from "@saleor/app-sdk/APL";
import { RedisAPL } from "./apl";
import { invariant } from "./lib/invariant";
import { env } from "./lib/env.mjs";
import { isTest } from "./lib/isEnv";

// Define an interface for the dynamic import
interface TestAPLModule {
  TestAPL: new () => APL;
}

const getApl = async (): Promise<APL> => {
  if (isTest()) {
    const testModule = (await import("./__tests__/testAPL")) as TestAPLModule;
    return new testModule.TestAPL();
  }
  /* c8 ignore start */
  switch (env.APL) {
    case "redis":
      invariant(env.REDIS_URL, "Missing REDIS_URL env variable!");
      return new RedisAPL({
        url: env.REDIS_URL as string,
      });
    case "upstash":
      invariant(env.UPSTASH_URL, "Missing UPSTASH_URL env variable!");
      invariant(env.UPSTASH_TOKEN, "Missing UPSTASH_TOKEN env variable!");
      return new UpstashAPL({
        restURL: env.UPSTASH_URL,
        restToken: env.UPSTASH_TOKEN,
      });
    case "saleor-cloud": {
      invariant(env.REST_APL_ENDPOINT, "Missing REST_APL_ENDPOINT env variable!");
      invariant(env.REST_APL_TOKEN, "Missing REST_APL_TOKEN env variable!");
      return new SaleorCloudAPL({
        resourceUrl: env.REST_APL_ENDPOINT,
        token: env.REST_APL_TOKEN,
      });
    }
    default:
      return new FileAPL();
  }
  /* c8 ignore stop */
};

const apl = await getApl();

export const saleorApp = new SaleorApp({
  apl,
});
