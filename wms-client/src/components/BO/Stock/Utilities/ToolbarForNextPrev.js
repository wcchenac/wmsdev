import React, { Component } from "react";
import { Button } from "react-bootstrap";

class ToolbarForNextPrev extends Component {
  render() {
    return (
      <React.Fragment>
        <Button
          className="mr-2"
          variant="secondary"
          value={this.props.prevProduct}
          onClick={this.props.handleFutureProductQuery}
          disabled={this.props.prevProduct === null}
        >
          上一筆
        </Button>
        <Button
          variant="secondary"
          value={this.props.nextProduct}
          onClick={this.props.handleFutureProductQuery}
          disabled={this.props.nextProduct === null}
        >
          下一筆
        </Button>
      </React.Fragment>
    );
  }
}

export default ToolbarForNextPrev;
