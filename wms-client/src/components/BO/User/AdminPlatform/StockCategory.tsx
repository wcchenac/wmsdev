import React, { useState, useCallback, useEffect, FormEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { notifyRequestFailed } from "../../../../utilities/notifyRequestFailed";
import Select, { SingleValue } from "react-select";
import makeAnimated from "react-select/animated";
import {
  getAllCategory,
  findCategoryDetails
} from "../../../../actions/StockActions";
import LoadingOverlay from "react-loading-overlay-ts";
import { Spinner } from "../../../Others/Spinner";
import { ToastContainer, toast } from "react-toastify";
import { RootState } from "../../../../store";

interface CategoryOption {
  value: string;
  label: string;
}

const StockCategory: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dispatch = useDispatch<any>();
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
      .catch(() => {
        toast.error(category + "分類本建立失敗");
        setIsLoading(false);
      });
  }, [dispatch, selectedCategory]);

  const animatedComponents = makeAnimated();

  // Type assertion for stockInfoes which can be array or have options property
  const options = (categoryList.stockInfoes as unknown as CategoryOption[]) || [];

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
          <ToastContainer />
        </div>
      </LoadingOverlay>
    </div>
  );
};

export default StockCategory;
