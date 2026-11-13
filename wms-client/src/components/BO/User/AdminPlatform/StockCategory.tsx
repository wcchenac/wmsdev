import React, { Component } from "react";
import { connect } from "react-redux";
import Select, { ValueType } from "react-select";
import { animatedSelectComponents } from "../../../../types/select";
import {
  getAllCategory,
  findCategoryDetails,
} from "../../../../actions/StockAcions";
import LoadingOverlay from "react-loading-overlay";
import { Spinner } from "../../../Others/Spinner";
import { ToastContainer, toast } from "react-toastify";
import type { RootState } from "../../../../types/state";
import type { ApiStatus } from "../../../../types/domain";

export interface CategoryChoice {
  label: string;
  value: string;
}

interface StateProps {
  categoryList: {
    stockInfoes: CategoryChoice[];
  };
}

interface DispatchProps {
  getAllCategory: () => void;
  findCategoryDetails: (category: string | undefined) => Promise<ApiStatus | undefined>;
}

type Props = StateProps & DispatchProps;

interface State {
  isLoading: boolean;
  selectedCategory: ValueType<CategoryChoice, false> | CategoryChoice[];
}

class StockCategory extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      selectedCategory: [],
    };
    this.handleCategorySelect = this.handleCategorySelect.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.props.getAllCategory();
  }

  handleCategorySelect(selectedCategory: ValueType<CategoryChoice, false>) {
    this.setState({ selectedCategory });
  }

  handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const selected = this.state.selectedCategory as CategoryChoice;
    const category = selected.value;

    this.setState({ isLoading: true }, () => {
      this.props
        .findCategoryDetails(selected.value)
        .then(() => {
          toast.success(category + "分類本建立成功");
          this.setState({ isLoading: false });
        })
        .catch(() => {
          toast.error(category + "分類本建立失敗");
          this.setState({ isLoading: false });
        });
    });
  }

  render() {
    const animatedComponents = animatedSelectComponents<CategoryChoice, false>();

    return (
      <div className="container">
        <LoadingOverlay active={this.state.isLoading} spinner={<Spinner />}>
          <div style={{ height: "80vh" }}>
            <div className="row justify-content-center">
              <div className="col-6">
                <label>請選擇想要輸出的分類...</label>
                <Select
                  closeMenuOnSelect
                  components={animatedComponents}
                  isSearchable
                  isClearable
                  options={this.props.categoryList.stockInfoes}
                  onChange={this.handleCategorySelect}
                />
                <br />
                <button
                  type="button"
                  className="btn btn-success btn-block"
                  onClick={this.handleSubmit}
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
  }
}

const mapStateToProps = (state: RootState): StateProps => ({
  categoryList: state.stockInfo as unknown as StateProps["categoryList"],
});

export default connect(mapStateToProps, {
  getAllCategory,
  findCategoryDetails,
})(StockCategory);
