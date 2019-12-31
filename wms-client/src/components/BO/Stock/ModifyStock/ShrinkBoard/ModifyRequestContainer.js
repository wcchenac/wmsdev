import React, { Component } from "react";
import ModifyRequest from "./ModifyRequest";

class ModifyRequestContainer extends Component {
  render() {
    const { typeValidation, newStockInfoes } = this.props;

    return (
      <div>
        <table className="table">
          <thead className="thead-dark">
            <tr>
              {typeValidation ? (
                <React.Fragment>
                  <th style={{ width: "25%" }}>型態</th>
                  <th style={{ width: "25%" }}>數量</th>
                  <th style={{ width: "25%" }}>單位</th>
                  <th style={{ width: "25%" }}>註解</th>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <th style={{ width: "20%" }}>型態</th>
                  <th style={{ width: "15%" }}>數量</th>
                  <th style={{ width: "15%" }}>單位</th>
                  <th style={{ width: "25%" }}>瑕疵</th>
                  <th style={{ width: "25%" }}>註解</th>
                </React.Fragment>
              )}
            </tr>
          </thead>
          <tbody>
            {newStockInfoes.map((stockInfo, index) => (
              <ModifyRequest
                key={index}
                index={index}
                typeValidation={typeValidation}
                stockInfo={stockInfo}
                onRequestChange={this.props.onRequestChange}
                handleDefectChange={this.props.handleDefectChange}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default ModifyRequestContainer;
