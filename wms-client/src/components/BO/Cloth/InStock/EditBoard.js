import React, { Component } from "react";
import ClothInfoContainer from "./ClothInfoContainer";

class EditBoard extends Component {
  render() {
    const { selectedProductNoList } = this.props;
    const filterSelectedList = selectedProductNoList.filter(
      object => object.selected === true && object.isSubmitted === false
    );
    const filterSubmittedList = selectedProductNoList.filter(
      object => object.isSubmitted === true
    );

    const contentAlgorithm = (
      filterSelectedListLength,
      filterSubmittedListLength
    ) => {
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
          <div className="accordion" id="accordion">
            {filterSelectedList.map(object => (
              <ClothInfoContainer
                key={object.index}
                index={object.index}
                productNo={object.productNo}
                handleInStockRequestSubmit={
                  this.props.handleInStockRequestSubmit
                }
              />
            ))}
          </div>
        );
      }
    };

    let content;
    content = contentAlgorithm(
      filterSelectedList.length,
      filterSubmittedList.length
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
