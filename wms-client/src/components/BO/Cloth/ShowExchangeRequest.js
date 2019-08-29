import React, { Component } from "react";
import TypeExchangeRequest from "./TypeExchangeRequest";

class ShowExchangeRequest extends Component {
  constructor(props) {
    super(props);
    this.handleRequestChange = this.handleRequestChange.bind(this);
  }

  handleRequestChange(request, i) {
    this.props.onRequestChange(request, i);
  }

  render() {
    const { newClothInfoes } = this.props;

    let BoardContent;

    const boardAlgorithm = newClothInfoes => {
      if (newClothInfoes.length < 1) {
        return (
          <div className="alert alert-warning text-center" role="alert">
            請新增資料
          </div>
        );
      } else {
        return (
          <div>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">型態</th>
                  <th scope="col">長度</th>
                  <th scope="col">色號</th>
                  <th scope="col">缺陷</th>
                  <th scope="col">記錄</th>
                  <th scope="col">註解</th>
                </tr>
              </thead>
              <tbody>
                {newClothInfoes.map((_clothInfo, index) => (
                  <TypeExchangeRequest
                    key={index}
                    index={index}
                    onRequestChange={this.handleRequestChange}
                  />
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    };
    BoardContent = boardAlgorithm(newClothInfoes);
    return <div>{BoardContent}</div>;
  }
}
export default ShowExchangeRequest;
