import React, { ChangeEvent, FormEvent } from "react";
import classnames from "classnames";

interface QueryOrderProps {
  type: string;
  handleQueryOrderSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isOrderValid: boolean | undefined;
  handleOrderNo: (e: ChangeEvent<HTMLInputElement>) => void;
}

const QueryOrder: React.FC<QueryOrderProps> = ({
  type,
  handleQueryOrderSubmit,
  isOrderValid,
  handleOrderNo,
}) => {
  return (
    <div className="col-md-12">
      <form onSubmit={handleQueryOrderSubmit}>
        <div className="row mb-0">
          <label className="col-md-auto col-form-label text-center">
            {type + "單號查詢"}
          </label>
          <div className="col-md-4">
            <input
              type="text"
              name="orderNo"
              placeholder={"請輸入" + type + "單號"}
              className={classnames("form-control", {
                "is-invalid": isOrderValid === false,
              })}
              onChange={handleOrderNo}
            />
            {isOrderValid === false && (
              <div className="invalid-feedback">
                {"查無" + type + " 或 " + type + "內沒有需要入庫的貨號"}
              </div>
            )}
          </div>
          <div className="col-md-auto">
            <button type="submit" className="btn btn-primary">
              查詢
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default QueryOrder;
