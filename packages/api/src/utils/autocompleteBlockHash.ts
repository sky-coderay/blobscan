import { prisma } from "@blobscan/db";
import { logger } from "@blobscan/logger";

/* Autocomplete a block hash from a truncated version of it.
   @param partialHash - The first bytes of a block hash.
   @returns The block hash, if there is a single ocurrence, or null.
 */
export async function autocompleteBlockHash(partialHash: string) {
  const blocks = await prisma.block.findMany({
    where: {
      hash: {
        startsWith: partialHash,
      },
    },
    select: {
      hash: true,
    },
  });

  if (blocks[0] === undefined) {
    return null;
  }

  if (blocks.length > 1) {
    logger.error(`Multiple blocks found for hash ${partialHash}`);
  }

  return blocks[0].hash;
}
