import React, { useMemo, useCallback } from "react";
import SearchInfo, { OutStockInfo } from "./SearchInfo";
import HeaderCheckBox from "./HeaderCheckBox";

interface ToBeSubmitItem {
  selected: boolean;
  whName: string;
}

interface ToBeSubmitMap {
  [id: string]: ToBeSubmitItem;
}

interface SearchContainerProps {
  index: number;
  /** Whether this date's tab pane is shown. Defaults to showing the first pane (index 0). */
  active?: boolean;
  date: string;
  outStockListFiltered: OutStockInfo[];
  toBeSubmit: ToBeSubmitMap;
  allSelectMethod: (date: string, selected: boolean) => void;
  handleToBeSubmitChange: (date: string, checked: boolean, id: number) => void;
  handleToBeSubmitWHChange: (date: string, value: string, id: number) => void;
  handleDeleteClick: (info: OutStockInfo) => void;
  downloadFile: (e: { target: { name: string; value: string } }) => void;
  handleModalShow: () => void;
  initialize: () => void;
}

function selectionForVisibleRows(
  waitSelectList: OutStockInfo[],
  source: ToBeSubmitMap | undefined
): ToBeSubmitMap {
  const selectList: ToBeSubmitMap = {};

  waitSelectList.forEach((object) => {
    const existing = source?.[object.id];
    selectList[object.id] = existing
      ? { selected: existing.selected, whName: existing.whName }
      : { selected: true, whName: "" };
  });

  return selectList;
}

function defaultCheckedAlgorithm(selectList: ToBeSubmitMap): boolean {
  const keyArray = Object.keys(selectList);
  if (keyArray.length === 0) {
    return false;
  }
  return keyArray.every((key) => selectList[key].selected);
}

const SearchContainer: React.FC<SearchContainerProps> = React.memo(function SearchContainer({
  index,
  active,
  date,
  outStockListFiltered,
  toBeSubmit: propToBeSubmit,
  allSelectMethod,
  handleToBeSubmitChange,
  handleToBeSubmitWHChange,
  handleDeleteClick,
  downloadFile,
  handleModalShow,
  initialize,
}) {
  const toBeSubmit = useMemo(() => {
    if (!outStockListFiltered) {
      return {};
    }
    const waitSelectList = outStockListFiltered.filter(
      (outStockRequest) => outStockRequest.handled === false
    );
    return selectionForVisibleRows(waitSelectList, propToBeSubmit);
  }, [outStockListFiltered, propToBeSubmit]);

  const headerCheckBoxChecked = useMemo(
    () => defaultCheckedAlgorithm(toBeSubmit),
    [toBeSubmit]
  );

  const onHeaderCheckBoxChange = useCallback(
    (checked: boolean) => {
      allSelectMethod(date, !checked);
    },
    [allSelectMethod, date]
  );

  const onInfoCheckBoxChange = useCallback(
    (checked: boolean, id: number) => {
      handleToBeSubmitChange(date, checked, id);
    },
    [handleToBeSubmitChange, date]
  );

  const onInfoWHChange = useCallback(
    (value: string, id: number) => {
      handleToBeSubmitWHChange(date, value, id);
    },
    [handleToBeSubmitWHChange, date]
  );

  return (
    <React.Fragment>
      <div
        className={
          (active ?? index === 0) ? "tab-pane fade show active" : "tab-pane fade"
        }
        id={"nav-" + date}
        role="tabpanel"
        aria-labelledby={"nav-tab-" + date}
      >
        <div className="table-responsive table-wrapper-scroll-y my-custom-scrollbar">
          <table className="table table-hover table-actions-center text-nowrap">
            <thead className="table-dark">
              <tr>
                <th>
                  <HeaderCheckBox
                    checked={headerCheckBoxChecked}
                    onHeaderCheckBoxChange={onHeaderCheckBoxChange}
                  />
                </th>
                <th>
                  <div className="ps-2">貨號</div>
                </th>
                <th>
                  <div className="ps-2">型態</div>
                </th>
                <th>
                  <div className="ps-2">數量</div>
                </th>
                <th>
                  <div className="ps-2">單位</div>
                </th>
                <th>
                  <div className="ps-1">出庫原因</div>
                </th>
                <th>開單人員</th>
                <th>倉別</th>
                <th>
                  <span className="visually-hidden">操作</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {(outStockListFiltered ?? []).map((object) => (
                <SearchInfo
                  key={object.id}
                  searchInfo={object}
                  whName={object.handled ? "" : toBeSubmit[object.id]?.whName ?? ""}
                  checked={
                    object.handled ? false : toBeSubmit[object.id]?.selected ?? false
                  }
                  onInfoCheckBoxChange={onInfoCheckBoxChange}
                  onInfoWHChange={onInfoWHChange}
                  handleDeleteClick={handleDeleteClick}
                  handleModalShow={handleModalShow}
                  downloadFile={downloadFile}
                  initialize={initialize}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </React.Fragment>
  );
});

export default SearchContainer;
