import { z } from "zod";

import { logger } from "@blobscan/logger";

import { autocompleteBlockHash } from "../utils/autocompleteBlockHash";

export const OptimismDecodedDataSchema = z.object({
  timestampSinceL2Genesis: z.number(),
  lastL1OriginNumber: z.number(),
  parentL2BlockHash: z.string(),
  l1OriginBlockHash: z.string(),
  numberOfL2Blocks: z.number(),
  changedByL1Origin: z.number(),
  totalTxs: z.number(),
  contractCreationTxsNumber: z.number(),
});

type OptimismDecodedData = z.infer<typeof OptimismDecodedDataSchema>;

export async function parseOptimismDecodedData(
  data: string
): Promise<OptimismDecodedData | null> {
  let json;

  try {
    json = JSON.parse(data);
  } catch (error) {
    return null;
  }

  const decoded = OptimismDecodedDataSchema.safeParse(json);

  if (!decoded.success) {
    return null;
  }

  const hash = await autocompleteBlockHash(decoded.data.l1OriginBlockHash);

  if (hash) {
    decoded.data.l1OriginBlockHash = hash;
  } else {
    logger.error(
      `Failed to get full block hash for L1 origin block hash: ${decoded.data.l1OriginBlockHash}`
    );
  }

  return decoded.data;
}
