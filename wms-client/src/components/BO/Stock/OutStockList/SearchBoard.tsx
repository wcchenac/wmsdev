import React, { useState, useEffect, useRef, useMemo, useCallback, MouseEvent } from "react";
import SearchContainer from "./SearchContainer";
import { SelectedUser, OutStockUpdateRequest } from "../../../../types";
import { OutStockInfo } from "./SearchInfo";

import equal from "fast-deep-equal";

interface ToBeSubmitItem {
  selected: boolean;
  whName: string;
}

interface ToBeSubmitDateMap {
  [id: string]: ToBeSubmitItem;
}

interface ToBeSubmitMap {
  [date: string]: ToBeSubmitDateMap;
}

interface QueryResult {
  [date: string]: OutStockInfo[];
}

interface SearchBoardProps {
  queryResult: QueryResult;
  selectedUserList: SelectedUser[];
  handleSubmitClick: (request: OutStockUpdateRequest) => void;
  handleDeleteClick: (info: OutStockInfo) => void;
  downloadFile: (e: { target: { name: string; value: string } }) => void;
  handleModalShow: () => void;
  initialize: () => void;
}

function extractUser(list: SelectedUser[]): string[] {
  const array: string[] = [];
  list.forEach((object) => {
    if (object.selected) {
      array.push(object.user);
    }
  });
  return array;
}

function filterAlgorithm(
  date: string,
  queryResult: QueryResult,
  userArray: string[]
): OutStockInfo[] {
  const outStockList = queryResult[date] ?? [];
  const outStockListFiltered: OutStockInfo[] = [];

  userArray.forEach((user) =>
    outStockList
      .filter((outStockInfo) => outStockInfo.createdBy === user)
      .forEach((result) => outStockListFiltered.push(result))
  );

  return outStockListFiltered.sort((a, b) => {
    const productA = a.productNo.toUpperCase();
    const productB = b.productNo.toUpperCase();
    if (productA < productB) return -1;
    if (productA > productB) return 1;
    return 0;
  });
}

function initialToBeSubmit(
  queryResult: QueryResult | undefined,
  selectedUserList: SelectedUser[]
): ToBeSubmitMap {
  if (!queryResult) {
    return {};
  }
  const toBeSubmit: ToBeSubmitMap = {};
  const dateArray = Object.keys(queryResult).sort();
  const userArray = extractUser(selectedUserList);

  dateArray.forEach((date) => {
    toBeSubmit[date] = {};
    const outStockListFiltered = filterAlgorithm(date, queryResult, userArray);
    const waitSelectList = outStockListFiltered.filter(
      (outStockRequest) => outStockRequest.handled === false
    );
    waitSelectList.forEach((object) => {
      toBeSubmit[date][object.id] = { selected: true, whName: "" };
    });
  });
  return toBeSubmit;
}

function retainVisibleToBeSubmit(
  current: ToBeSubmitMap,
  queryResult: QueryResult,
  selectedUserList: SelectedUser[]
): ToBeSubmitMap {
  const visible = initialToBeSubmit(queryResult, selectedUserList);
  for (const date of Object.keys(visible)) {
    for (const id of Object.keys(visible[date])) {
      const existing = current[date]?.[id];
      if (existing) {
        visible[date][id] = { selected: existing.selected, whName: existing.whName };
      }
    }
  }
  return visible;
}

const SearchBoard: React.FC<SearchBoardProps> = ({
  queryResult,
  selectedUserList,
  handleSubmitClick,
  handleDeleteClick,
  downloadFile,
  handleModalShow,
  initialize,
}) => {
  const [toBeSubmit, setToBeSubmit] = useState<ToBeSubmitMap>(() =>
    initialToBeSubmit(queryResult, selectedUserList)
  );
  /** Date tab currently shown; falls back to the first date when unset or no longer listed. */
  const [activeDate, setActiveDate] = useState<string | null>(null);

  const prevQueryResultRef = useRef<QueryResult | undefined>(queryResult);
  const prevSelectedUserListRef = useRef<SelectedUser[]>(selectedUserList);
  const didMountRef = useRef<boolean>(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      prevQueryResultRef.current = queryResult;
      prevSelectedUserListRef.current = selectedUserList;
      return;
    }

    const prevQueryResult = prevQueryResultRef.current;
    const prevSelectedUserList = prevSelectedUserListRef.current;

    if (prevQueryResult !== queryResult && !equal(prevQueryResult, queryResult)) {
      const prevWasEmpty = Object.keys(prevQueryResult ?? {}).length === 0;
      setToBeSubmit((current) =>
        prevWasEmpty
          ? initialToBeSubmit(queryResult, selectedUserList)
          : retainVisibleToBeSubmit(current, queryResult, selectedUserList)
      );
    } else if (
      prevSelectedUserList !== selectedUserList &&
      queryResult !== undefined &&
      !equal(prevSelectedUserList, selectedUserList)
    ) {
      // Drop rows the user filter just hid, and keep warehouse choices for rows still shown.
      setToBeSubmit((current) =>
        retainVisibleToBeSubmit(current, queryResult, selectedUserList)
      );
    }

    prevQueryResultRef.current = queryResult;
    prevSelectedUserListRef.current = selectedUserList;
  }, [queryResult, selectedUserList]);

  const handleToBeSubmitChange = useCallback(
    (date: string, checked: boolean, id: number): void => {
      setToBeSubmit((prev) => ({
        ...prev,
        [date]: {
          ...prev[date],
          [id]: {
            ...prev[date][id],
            selected: !checked,
          },
        },
      }));
    },
    []
  );

  const handleToBeSubmitWHChange = useCallback(
    (date: string, value: string, id: number): void => {
      setToBeSubmit((prev) => ({
        ...prev,
        [date]: {
          ...prev[date],
          [id]: {
            ...prev[date][id],
            whName: value,
          },
        },
      }));
    },
    []
  );

  const allSelectMethod = useCallback((date: string, selected: boolean): void => {
    setToBeSubmit((prev) => {
      const dateEntries = prev[date];
      if (!dateEntries) {
        return prev;
      }
      const nextDateEntries: ToBeSubmitDateMap = {};
      for (const key of Object.keys(dateEntries)) {
        nextDateEntries[key] =
          dateEntries[key].selected !== selected
            ? { ...dateEntries[key], selected }
            : dateEntries[key];
      }
      return { ...prev, [date]: nextDateEntries };
    });
  }, []);

  /**
   * Selected rows that are on screen for the current user filter.
   * Hidden rows stay out of both validation and the submit payload.
   */
  const visibleSelection = useMemo((): { id: string; whName: string }[] => {
    if (queryResult === undefined) {
      return [];
    }

    const userArray = extractUser(selectedUserList);
    const selected: { id: string; whName: string }[] = [];

    for (const day of Object.keys(toBeSubmit)) {
      if (queryResult[day] === undefined) {
        continue;
      }
      const visibleIds = new Set(
        filterAlgorithm(day, queryResult, userArray)
          .filter((row) => row.handled === false)
          .map((row) => String(row.id))
      );
      for (const id of Object.keys(toBeSubmit[day])) {
        const item = toBeSubmit[day][id];
        if (item.selected && visibleIds.has(id)) {
          selected.push({ id, whName: item.whName });
        }
      }
    }
    return selected;
  }, [queryResult, selectedUserList, toBeSubmit]);

  const onSubmitClick = useCallback(
    (_e: MouseEvent<HTMLButtonElement>): void => {
      const requests: { [id: string]: string } = {};
      visibleSelection.forEach((item) => {
        requests[item.id] = item.whName;
      });
      const outStockUpdateRequest: OutStockUpdateRequest = { outStockUpdate: requests };
      handleSubmitClick(outStockUpdateRequest);
    },
    [visibleSelection, handleSubmitClick]
  );

  /**
   * The save button is disabled when any visible selected row has no warehouse,
   * and when nothing visible is selected. An empty warehouse on an earlier date
   * must stay disabled even if a later date is filled in.
   */
  const isSubmitDisabled = useMemo((): boolean => {
    if (visibleSelection.some((item) => equal(item.whName, ""))) {
      return true;
    }
    return visibleSelection.length === 0;
  }, [visibleSelection]);

  if (queryResult === undefined) {
    return null;
  }

  const dateArray = Object.keys(queryResult).sort();
  const userArray = extractUser(selectedUserList);
  const currentDate =
    activeDate !== null && dateArray.includes(activeDate)
      ? activeDate
      : dateArray[0];

  return (
    <React.Fragment>
      <div className="row justify-content-end">
        <div className="col-md-auto">
          <button
            className="btn btn-primary me-2"
            disabled={isSubmitDisabled}
            onClick={onSubmitClick}
          >
            儲存
          </button>
        </div>
      </div>
      <br />
      <nav>
        <div className="nav nav-pills" id="nav-tab" role="tablist">
          {dateArray.map((date) => (
            <a
              className={
                date === currentDate ? "nav-item nav-link active" : "nav-item nav-link"
              }
              id={"nav-tab-" + date}
              key={date}
              href={"#nav-" + date}
              role="tab"
              aria-controls={"nav-" + date}
              aria-selected={date === currentDate}
              onClick={(e) => {
                e.preventDefault();
                setActiveDate(date);
              }}
            >
              {date}
            </a>
          ))}
        </div>
      </nav>
      <div className="tab-content" id="nav-tabContent">
        {dateArray.map((date, index) => {
          const outStockListFiltered = filterAlgorithm(date, queryResult, userArray);

          return (
            <SearchContainer
              key={date}
              index={index}
              active={date === currentDate}
              date={date}
              outStockListFiltered={outStockListFiltered}
              toBeSubmit={toBeSubmit[date]}
              allSelectMethod={allSelectMethod}
              handleToBeSubmitChange={handleToBeSubmitChange}
              handleToBeSubmitWHChange={handleToBeSubmitWHChange}
              handleDeleteClick={handleDeleteClick}
              downloadFile={downloadFile}
              handleModalShow={handleModalShow}
              initialize={initialize}
            />
          );
        })}
      </div>
    </React.Fragment>
  );
};

export default SearchBoard;
