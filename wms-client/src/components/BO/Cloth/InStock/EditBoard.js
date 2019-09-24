import React, { Component } from "react";
import ClothInfoContainer from "./ClothInfoContainer";

class EditBoard extends Component {
  render() {
    const { selectedProductNoList } = this.props;

    const filtered = selectedProductNoList.filter(
      object => object.selected === true
    );

    return (
      <div>
        <div className="accordion" id="accordion">
          {filtered.map(object => (
            <ClothInfoContainer
              key={object.index}
              index={object.index}
              productNo={object.productNo}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default EditBoard;
