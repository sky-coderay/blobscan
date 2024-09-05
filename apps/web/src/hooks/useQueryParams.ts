import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { Rollup } from "@blobscan/api/enums";

import type { Rollup as LowercaseRollup } from "~/types";

export type Sort = "asc" | "desc";

type QueryParams = {
  from?: string;
  p: number;
  ps: number;
  rollup?: LowercaseRollup | "null";
  startDate?: Date;
  endDate?: Date;
  startBlock?: number;
  endBlock?: number;
  startSlot?: number;
  endSlot?: number;
  sort?: Sort;
};

const DEFAULT_INITIAL_PAGE_SIZE = 50;
const DEFAULT_INITIAL_PAGE = 1;

export function useQueryParams() {
  const router = useRouter();
  const [queryParams, setQueryParams] = useState<QueryParams>({
    p: DEFAULT_INITIAL_PAGE,
    ps: DEFAULT_INITIAL_PAGE_SIZE,
  });

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const {
      from,
      p,
      ps,
      rollup,
      startDate,
      endDate,
      startBlock,
      endBlock,
      startSlot,
      endSlot,
      sort,
    } = router.query;

    setQueryParams({
      from: (from as string)?.toLowerCase(),
      p: parseInt(p as string) || DEFAULT_INITIAL_PAGE,
      ps: parseInt(ps as string) || DEFAULT_INITIAL_PAGE_SIZE,
      rollup: rollup
        ? rollup === "null"
          ? rollup
          : (Rollup[
              (rollup as string).toUpperCase() as keyof typeof Rollup
            ]?.toLowerCase() as LowercaseRollup)
        : undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      startBlock: parseInt(startBlock as string) || undefined,
      endBlock: parseInt(endBlock as string) || undefined,
      startSlot: parseInt(startSlot as string) || undefined,
      endSlot: parseInt(endSlot as string) || undefined,
      sort: sort ? (sort as Sort) : undefined,
    });
  }, [router]);

  return queryParams;
}