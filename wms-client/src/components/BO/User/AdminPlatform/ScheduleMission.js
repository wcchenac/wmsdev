import React, { Component } from "react";
import { stockComparison } from "../../../../actions/StockAcions";

class ScheduleMission extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false
    };
    this.handleStockCompareButton = this.handleStockCompareButton.bind(this);
  }

  handleStockCompareButton(e) {
    const period = e.target.name;

    this.setState({ isLoading: true }, () => {
      stockComparison(period).then(res => {
        if (res.status === 200) {
          this.setState({ isLoading: false });
        }
      });
    });
  }

  render() {
    return (
      <div>
        <button
          className="btn btn-primary mr-2"
          name="daily"
          onClick={this.handleStockCompareButton}
        >
          每日比對
        </button>
        <button
          className="btn btn-primary"
          name="weekly"
          onClick={this.handleStockCompareButton}
        >
          每週比對
        </button>
      </div>
    );
  }
}

export default ScheduleMission;
