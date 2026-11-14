import React, { useState, useCallback, useEffect, FormEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { notifyRequestFailed, isSessionExpired } from "../../../../utilities/notifyRequestFailed";
import Select, { SingleValue } from "react-select";
import makeAnimated from "react-select/animated";
import {
  getAllCategory,
  findCategoryDetails
} from "../../../../actions/StockActions";
import LoadingOverlay from "@achmadk/react-loading-overlay";
import { Spinner } from "../../../Others/Spinner";
import { toast } from "react-toastify";
import { RootState } from "../../../../store";
import { AppDispatch } from "../../../../types";

interface CategoryOption {
  value: string;
  label: string;
}

// GET /api/stock/queryStock/categoryList returns [{ label, value }]; it shares the stockInfo
// slice with other pages, so keep only entries of that shape.
const isCategoryOption = (value: unknown): value is CategoryOption =>
  typeof value === "object" && value !== null &&
  "value" in value && typeof value.value === "string" &&
  "label" in value && typeof value.label === "string";

const StockCategory: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const categoryList = useSelector((state: RootState) => state.stockInfo);

  useEffect(() => {
    dispatch(getAllCategory()).catch(notifyRequestFailed);
  }, [dispatch]);

  const handleCategorySelect = useCallback((selected: SingleValue<CategoryOption>): void => {
    setSelectedCategory(selected);
  }, []);

  const handleSubmit = useCallback((e: FormEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    if (!selectedCategory) return;

    const category = selectedCategory.value;

    setIsLoading(true);
    dispatch(findCategoryDetails(selectedCategory.value))
      .then(() => {
        toast.success(category + "分類本建立成功");
        setIsLoading(false);
      })
      .catch((error) => {
        if (!isSessionExpired(error)) {
          toast.error(category + "分類本建立失敗");
        }
        setIsLoading(false);
      });
  }, [dispatch, selectedCategory]);

  const animatedComponents = makeAnimated();

  const stockInfoes: unknown = categoryList.stockInfoes;
  const options = Array.isArray(stockInfoes) ? stockInfoes.filter(isCategoryOption) : [];

  return (
    <div className="container">
      <LoadingOverlay active={isLoading} spinner={<Spinner />}>
        <div style={{ height: "80vh" }}>
          <div className="row justify-content-center">
            <div className="col-6">
              <label>請選擇想要輸出的分類...</label>
              <Select<CategoryOption, false>
                closeMenuOnSelect
                components={animatedComponents}
                isSearchable
                isClearable
                options={options}
                onChange={handleCategorySelect}
              />
              <br />
              <button
                type="button"
                className="btn btn-success w-100"
                onClick={handleSubmit}
              >
                送出
              </button>
            </div>
          </div>
        </div>
      </LoadingOverlay>
    </div>
  );
};

export default StockCategory;
