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
import { AppDispatch, SelectOption } from "../../../../types";
import { isSelectOption } from "../../../../utilities/selectOption";
import { Card, Button } from "../../../UI";

const animatedComponents = makeAnimated();

const StockCategory: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<SelectOption | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const categoryList = useSelector((state: RootState) => state.stockInfo);

  useEffect(() => {
    dispatch(getAllCategory()).catch(notifyRequestFailed);
  }, [dispatch]);

  const handleCategorySelect = useCallback((selected: SingleValue<SelectOption>): void => {
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

  const rawCategories: unknown = categoryList.categories;
  const options = Array.isArray(rawCategories) ? rawCategories.filter(isSelectOption) : [];

  return (
    <div className="container">
      <LoadingOverlay active={isLoading} spinner={<Spinner />}>
        <div style={{ height: "80vh" }}>
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <Card title="庫存分類本匯出">
                <label htmlFor="react-select-stock-category" className="form-label">
                  請選擇想要輸出的分類...
                </label>
                <Select<SelectOption, false>
                  inputId="react-select-stock-category"
                  closeMenuOnSelect
                  components={animatedComponents}
                  isSearchable
                  isClearable
                  options={options}
                  onChange={handleCategorySelect}
                />
                <div className="mt-3">
                  <Button
                    type="button"
                    variant="success"
                    block
                    onClick={handleSubmit}
                  >
                    送出
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </LoadingOverlay>
    </div>
  );
};

export default StockCategory;
