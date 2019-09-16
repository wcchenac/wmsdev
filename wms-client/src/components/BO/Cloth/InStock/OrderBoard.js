import React, { Component } from "react";
import ClothInfoContainer from "./ClothInfoContainer";

class OrderBoard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clothInfoList: {},
      productNoList: props.productNoList
    };
  }

  render() {
    const { productNoList } = this.state;
    return (
      <div>
        <h3>此進貨單含有以下貨號</h3>
        <div className="accordion" id="accordionExample">
          {productNoList.map(productNo => (
            <ClothInfoContainer key={productNo} productNo={productNo} />
          ))}
        </div>
      </div>
    );
  }
}

export default OrderBoard;
