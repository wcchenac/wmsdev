import React, { PureComponent } from "react";
import ClothInfoContainer from "./ClothInfoContainer";

class EditBoard extends PureComponent {
  contentAlgorithm(
    filterSelectedListLength,
    filterSubmittedListLength,
    filterSelectedList
  ) {
    if (filterSelectedListLength === 0 && filterSubmittedListLength === 0) {
      return;
    } else if (
      filterSelectedListLength === 0 &&
      filterSubmittedListLength !== 0
    ) {
      this.timer = setTimeout(this.props.getInitialize.bind(this), 3000);

      return (
        <div className="row justify-content-md-center">
          <div className="col-md-6">
            <div className="alert alert-success" role="alert">
              <h5 className="text-center">此次入庫作業已完成</h5>
              <h5 className="text-center">3秒後將跳回第一步...</h5>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <nav>
            <div
              className="nav nav-tabs nav-justified"
              id="nav-tab"
              role="tablist"
            >
              {filterSelectedList.map((object, index) => {
                return (
                  <a
                    className={
                      index === 0
                        ? "nav-item nav-link active"
                        : "nav-item nav-link"
                    }
                    id={"nav-tab" + object.index}
                    key={index}
                    data-toggle="tab"
                    href={"#nav-" + object.index}
                    role="tab"
                    aria-controls={"nav-" + object.index}
                    aria-selected={index === 0}
                  >
                    {object.productNo}
                  </a>
                );
              })}
            </div>
          </nav>
          <div className="tab-content" id="nav-tabContent">
            <br />
            {filterSelectedList.map((object, index) => (
              <ClothInfoContainer
                key={object.index}
                sequence={index}
                index={object.index}
                productNo={object.productNo}
                handleInStockRequestSubmit={
                  this.props.handleInStockRequestSubmit
                }
              />
            ))}
          </div>
        </div>
      );
    }
  }

  render() {
    const { selectedProductNoList } = this.props;
    const filterSelectedList = selectedProductNoList.filter(
      object => object.selected === true && object.isSubmitted === false
    );
    const filterSubmittedList = selectedProductNoList.filter(
      object => object.isSubmitted === true
    );
    let content = this.contentAlgorithm(
      filterSelectedList.length,
      filterSubmittedList.length,
      filterSelectedList
    );

    return (
      <div>
        <div className="row justify-content-between">
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.props.handlePrevStep}
            disabled={filterSubmittedList.length !== 0}
          >
            上一步
          </button>
        </div>
        <br />
        {content}
      </div>
    );
  }
}

export default EditBoard;
