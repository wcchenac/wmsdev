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
                  <th style={{ width: "24%" }}>型態</th>
                  <th style={{ width: "23%" }}>數量</th>
                  <th style={{ width: "23%" }}>單位</th>
                  <th style={{ width: "24%" }}>註解</th>
                  <th style={{ width: "6%" }}>直出</th>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <th style={{ width: "20%" }}>型態</th>
                  <th style={{ width: "14%" }}>數量</th>
                  <th style={{ width: "14%" }}>單位</th>
                  <th style={{ width: "23%" }}>瑕疵</th>
                  <th style={{ width: "23%" }}>註解</th>
                  <th style={{ width: "6%" }}>直出</th>
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
                handleShipCheck={this.props.handleShipCheck}
                handleReasonButton={this.props.handleReasonButton}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default ModifyRequestContainer;
