import React, { Component } from "react";

class ShowProductQuantity extends Component {
  render() {
    return (
      <React.Fragment>
        <div className="row">
          {this.props.stockQuantity.map((product, index) => (
            <React.Fragment key={index}>
              <div className="col-6">
                <div className="row">
                  <div className="col-6 text-center">
                    <p className="h5 mb-0">{product.type}倉總和</p>
                  </div>
                  <div className="col-4">
                    <p className="h5 mb-0">{product.quantity}</p>
                  </div>
                  <div className="col-2">
                    <p className="h5 mb-0">{product.unit}</p>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </React.Fragment>
    );
  }
}

export default ShowProductQuantity;
