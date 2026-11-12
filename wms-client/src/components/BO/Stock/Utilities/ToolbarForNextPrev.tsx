import React, { Component } from "react";
import { Button } from "react-bootstrap";

interface Props {
  prevProduct?: string | null;
  nextProduct?: string | null;
  handleFutureProductQuery: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

class ToolbarForNextPrev extends Component<Props> {
  render() {
    return (
      <React.Fragment>
        <Button
          className="mr-2"
          variant="secondary"
          value={this.props.prevProduct ?? undefined}
          onClick={this.props.handleFutureProductQuery}
          disabled={
            this.props.prevProduct === null || this.props.prevProduct === ""
          }
        >
          上一筆
        </Button>
        <Button
          variant="secondary"
          value={this.props.nextProduct ?? undefined}
          onClick={this.props.handleFutureProductQuery}
          disabled={
            this.props.nextProduct === null || this.props.nextProduct === ""
          }
        >
          下一筆
        </Button>
      </React.Fragment>
    );
  }
}

export default ToolbarForNextPrev;
