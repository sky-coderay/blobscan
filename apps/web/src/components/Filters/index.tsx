import { useEffect, useReducer } from "react";
import type { FC } from "react";
import { useRouter } from "next/router";
import type { DateRangeType } from "react-tailwindcss-datepicker";
import type { UrlObject } from "url";

import { Button } from "~/components/Button";
import type { Sort } from "~/hooks/useQueryParams";
import { useQueryParams } from "~/hooks/useQueryParams";
import { getISODate } from "~/utils";
import { Card } from "../Cards/Card";
import type { Option } from "../Dropdown";
import type { NumberRange } from "../Inputs/NumberRangeInput";
import { BlockNumberFilter } from "./BlockNumberFilter";
import { ROLLUP_OPTIONS, RollupFilter } from "./RollupFilter";
import { SlotFilter } from "./SlotFilter";
import { SortToggle } from "./SortToggle";
import { TimestampFilter } from "./TimestampFilter";

type FiltersState = {
  rollup: Option | null;
  timestampRange: DateRangeType | null;
  blockNumberRange: NumberRange | null;
  slotRange: NumberRange | null;
  sort: Sort;
};

type ClearAction<V extends keyof FiltersState> = {
  type: "CLEAR";
  payload?: { field: V };
};

type UpdateAction = {
  type: "UPDATE";
  payload: Partial<FiltersState>;
};

type FiltersAction<V extends keyof FiltersState> =
  | ClearAction<V>
  | UpdateAction;

const INIT_STATE: FiltersState = {
  rollup: null,
  timestampRange: {
    endDate: null,
    startDate: null,
  },
  blockNumberRange: null,
  slotRange: null,
  sort: "desc",
};

function reducer<V extends keyof FiltersState>(
  prevState: FiltersState,
  { type, payload }: FiltersAction<V>
): FiltersState {
  switch (type) {
    case "CLEAR":
      return payload
        ? {
            ...prevState,
            [payload.field]: null,
          }
        : { ...INIT_STATE };
    case "UPDATE":
      return {
        ...prevState,
        ...payload,
      };
  }
}

export const Filters: FC = function () {
  const router = useRouter();
  const queryParams = useQueryParams();
  const [filters, dispatch] = useReducer(reducer, INIT_STATE);
  const disableClear =
    !filters.rollup &&
    !filters.timestampRange?.endDate &&
    !filters.timestampRange?.startDate &&
    !filters.blockNumberRange &&
    !filters.slotRange &&
    !filters.sort;

  const handleFilter = () => {
    const query: UrlObject["query"] = {};
    const { rollup, timestampRange, blockNumberRange, slotRange, sort } =
      filters;

    if (rollup) {
      if (rollup.value === "null") {
        query.rollup = rollup.value;
      } else {
        query.from = rollup.value;
      }
    }

    if (timestampRange) {
      const { startDate, endDate } = timestampRange;

      if (startDate) {
        query.startDate = getISODate(startDate);
      }

      if (endDate) {
        query.endDate = getISODate(endDate);
      }
    }

    if (blockNumberRange) {
      const { start, end } = blockNumberRange;

      if (start) {
        query.startBlock = start;
      }

      if (end) {
        query.endBlock = end;
      }
    }

    if (slotRange) {
      const { start, end } = slotRange;

      if (start) {
        query.startSlot = start;
      }

      if (end) {
        query.endSlot = end;
      }
    }

    if (sort) {
      query.sort = sort;
    }

    router.push({
      pathname: router.pathname,
      query,
    });
  };

  useEffect(() => {
    const {
      rollup,
      from,
      startDate,
      endDate,
      startBlock,
      endBlock,
      startSlot,
      endSlot,
      sort,
    } = queryParams;
    const newFilters: Partial<FiltersState> = {};

    if (rollup || from) {
      const rollupOption = ROLLUP_OPTIONS.find(
        (opt) => opt.value === rollup || opt.value === from
      );

      if (rollupOption) {
        newFilters.rollup = rollupOption;
      }
    }

    if (startDate || endDate) {
      newFilters.timestampRange = {
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      };
    }

    if (startBlock || endBlock) {
      newFilters.blockNumberRange = {
        start: startBlock,
        end: endBlock,
      };
    }

    if (startSlot || endSlot) {
      newFilters.slotRange = {
        start: startSlot,
        end: endSlot,
      };
    }

    if (sort) {
      newFilters.sort = sort;
    }

    dispatch({ type: "UPDATE", payload: newFilters });
  }, [queryParams]);

  return (
    <Card>
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:gap-0">
        <div className="flex w-full flex-col items-center gap-2 md:flex-row">
          <SortToggle
            type={filters.sort}
            onChange={(newSort) => {
              dispatch({ type: "UPDATE", payload: { sort: newSort } });
            }}
          />
          <div className="w-full md:w-40">
            <RollupFilter
              selected={filters.rollup}
              onChange={(newRollup) =>
                dispatch({ type: "UPDATE", payload: { rollup: newRollup } })
              }
            />
          </div>
          <div className="w-full md:w-64">
            <TimestampFilter
              value={filters.timestampRange}
              onChange={(newTimestampRange) =>
                dispatch({
                  type: "UPDATE",
                  payload: { timestampRange: newTimestampRange },
                })
              }
            />
          </div>
          <div className="flex gap-2">
            <div className="w-full md:w-52">
              <BlockNumberFilter
                range={filters.blockNumberRange}
                onChange={(newBlockNumberRange) =>
                  dispatch({
                    type: "UPDATE",
                    payload: { blockNumberRange: newBlockNumberRange },
                  })
                }
              />
            </div>
            <div className="w-full md:w-52">
              <SlotFilter
                range={filters.slotRange}
                onChange={(newSlotRange) =>
                  dispatch({
                    type: "UPDATE",
                    payload: { slotRange: newSlotRange },
                  })
                }
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <Button
            className="w-full lg:w-auto"
            variant="outline"
            onClick={() => dispatch({ type: "CLEAR" })}
            disabled={disableClear}
          >
            Clear
          </Button>
          <Button className="w-full lg:w-auto" onClick={handleFilter}>
            Filter
          </Button>
        </div>
      </div>
    </Card>
  );
};