import React, { Component } from "react";
import { Modal, Button, Form, Row, Col, InputGroup } from "react-bootstrap";
import Switch from "@material-ui/core/Switch";
import { StockIdentifierType } from "../../../../../enums/Enums";
import { copy } from "../../../../../utilities/DeepCopy";
import { updateStockInfoCopy } from "../../Utilities/StockInfoHelperMethods";

class OutStockModal extends Component {
  constructor(props) {
    super(props);
    this.state = this.initialState();
    this.handleAssignMode = this.handleAssignMode.bind(this);
    this.handleRequestChange = this.handleRequestChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  initialState() {
    return {
      assignMode: false,
      outStockRequest: {
        productNo: this.props.productNo,
        type: StockIdentifierType.roll,
        quantity: "隨意",
        quantity1: "",
        quantity2: "",
        unit: "碼",
        reason: "",
        errors: {
          quantity1: "",
          quantity2: ""
        }
      }
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.productNo !== prevProps.productNo) {
      let initialState = this.initialState();
      this.setState(initialState);
    }
  }

  handleAssignMode() {
    this.setState({ assignMode: !this.state.assignMode });
  }

  handleRequestChange(e) {
    let outStockRequestsCopy = copy(this.state.outStockRequest);
    const { name, value } = e.target;

    updateStockInfoCopy(outStockRequestsCopy, name, value);

    if (this.state.assignMode) {
      outStockRequestsCopy.quantity = "隨意";
    }

    this.setState({ outStockRequest: outStockRequestsCopy });
  }

  handleSubmit() {
    const { assignMode, outStockRequest } = this.state;
    const newOutStockRequest = {
      productNo: outStockRequest.productNo,
      type: outStockRequest.type,
      unit: outStockRequest.unit,
      reason: outStockRequest.reason
    };

    newOutStockRequest["quantity"] = assignMode
      ? "約" + outStockRequest.quantity1 + "~" + outStockRequest.quantity2
      : outStockRequest.quantity;

    this.props.handleOutStockRequestSubmit(newOutStockRequest);
  }

  checkFormAlgorithm(outStockRequest) {
    var isFormValid = false;

    if (this.state.assignMode) {
      if (
        outStockRequest.errors.quantity1 === "" &&
        outStockRequest.quantity1 > 0 &&
        outStockRequest.errors.quantity2 === "" &&
        outStockRequest.quantity2 > 0 &&
        outStockRequest.reason !== ""
      ) {
        isFormValid = true;
      } else {
        isFormValid = false;
      }
    } else {
      if (outStockRequest.reason !== "") {
        isFormValid = true;
      }
    }

    return isFormValid;
  }

  render() {
    const { assignMode, outStockRequest } = this.state;
    const { errors } = this.state.outStockRequest;
    let isFormValid = this.checkFormAlgorithm(outStockRequest);

    return (
      <Modal
        centered
        show={this.props.show}
        onHide={this.props.handleModalClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>拉貨要求</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="container">
            <Form>
              <Form.Group as={Row}>
                <Form.Label column md={4}>
                  貨號
                </Form.Label>
                <Col md={8}>
                  <Form.Control
                    type="text"
                    name="productNo"
                    value={outStockRequest.productNo}
                    disabled
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column md={4}>
                  型態
                </Form.Label>
                <Col md={8}>
                  <Form.Control
                    as="select"
                    name="type"
                    defaultValue={StockIdentifierType.roll}
                    onChange={this.handleRequestChange}
                  >
                    {Object.keys(StockIdentifierType).map((type, index) => (
                      <option key={index} value={StockIdentifierType[type]}>
                        {StockIdentifierType[type]}
                      </option>
                    ))}
                  </Form.Control>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column md={2}>
                  數量
                </Form.Label>
                <Col md={2}>
                  <Switch
                    color="primary"
                    name="assignMode"
                    checked={assignMode}
                    onChange={this.handleAssignMode}
                  />
                </Col>
                {assignMode ? (
                  <React.Fragment>
                    <Col md={4}>
                      <InputGroup>
                        <InputGroup.Prepend>
                          <InputGroup.Text>約</InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                          type="text"
                          name="quantity1"
                          placeholder="數量"
                          onChange={this.handleRequestChange}
                          isInvalid={errors.quantity1}
                        />
                        {errors.quantity1 && (
                          <Form.Control.Feedback type="invalid">
                            {errors.quantity1}
                          </Form.Control.Feedback>
                        )}
                      </InputGroup>
                    </Col>
                    <Form.Label column md={1}>
                      ~
                    </Form.Label>
                    <Col md={3}>
                      <Form.Control
                        type="text"
                        name="quantity2"
                        placeholder="數量"
                        onChange={this.handleRequestChange}
                        isInvalid={errors.quantity2}
                      />
                      {errors.quantity2 && (
                        <Form.Control.Feedback type="invalid">
                          {errors.quantity2}
                        </Form.Control.Feedback>
                      )}
                    </Col>
                  </React.Fragment>
                ) : (
                  <Col md={8}>
                    <Form.Control
                      type="text"
                      name="quantity"
                      value={outStockRequest.quantity}
                      disabled
                    />
                  </Col>
                )}
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column md={4}>
                  單位
                </Form.Label>
                <Col md={8}>
                  <Form.Control
                    as="select"
                    name="unit"
                    defaultValue="碼"
                    onChange={this.handleRequestChange}
                  >
                    <option value="碼">碼</option>
                    <option value="尺">尺</option>
                  </Form.Control>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column md={4}>
                  出庫原因
                </Form.Label>
                <Col md={8}>
                  <Form.Control
                    type="text"
                    name="outStockReason"
                    placeholder="請輸入出庫原因"
                    onChange={this.handleRequestChange}
                  />
                </Col>
              </Form.Group>
            </Form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.props.handleModalClose}>
            取消
          </Button>
          <Button
            variant="primary"
            disabled={!isFormValid}
            onClick={this.handleSubmit}
          >
            儲存至明細
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default OutStockModal;
