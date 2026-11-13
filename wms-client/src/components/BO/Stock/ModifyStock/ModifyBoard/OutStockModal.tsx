import React, { useState, useEffect, useCallback, ChangeEvent, KeyboardEvent } from "react";
import { Modal, Button, Form, Row, Col, InputGroup } from "react-bootstrap";
import Switch from "@mui/material/Switch";
import { StockIdentifierType } from "../../../../../enums/Enums";
import { copy } from "../../../../../utilities/DeepCopy";
import { updateStockInfoCopy } from "../../Utilities/StockInfoHelperMethods";

// ============================================
// Type Definitions
// ============================================
interface OutStockRequestErrors {
  quantity1: string;
  quantity2: string;
}

interface OutStockRequestState {
  productNo: string;
  type: string;
  quantity: string;
  quantity1: string;
  quantity2: string;
  unit: string;
  reason: string;
  errors: OutStockRequestErrors;
}

interface InitialState {
  assignMode: boolean;
  isSubmitting: boolean;
  outStockRequest: OutStockRequestState;
}

interface OutStockRequestSubmit {
  productNo: string;
  type: string;
  quantity: string;
  unit: string;
  reason: string;
}

interface OutStockModalProps {
  productNo: string;
  show: boolean;
  handleModalClose: () => void;
  handleOutStockRequestSubmit: (request: OutStockRequestSubmit) => void;
}

// ============================================
// Component
// ============================================
const OutStockModal: React.FC<OutStockModalProps> = ({
  productNo,
  show,
  handleModalClose,
  handleOutStockRequestSubmit
}) => {
  const createInitialState = useCallback((): InitialState => {
    return {
      assignMode: false,
      isSubmitting: false,
      outStockRequest: {
        productNo: productNo,
        type: StockIdentifierType.roll,
        quantity: "\u96a8\u610f",
        quantity1: "",
        quantity2: "",
        unit: "\u78bc",
        reason: "",
        errors: {
          quantity1: "",
          quantity2: ""
        }
      }
    };
  }, [productNo]);

  const [assignMode, setAssignMode] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [outStockRequest, setOutStockRequest] = useState<OutStockRequestState>(() => createInitialState().outStockRequest);

  useEffect(() => {
    const initialState = createInitialState();
    setAssignMode(initialState.assignMode);
    setIsSubmitting(initialState.isSubmitting);
    setOutStockRequest(initialState.outStockRequest);
  }, [productNo, createInitialState]);

  const handleAssignMode = useCallback(() => {
    setAssignMode(prev => !prev);
  }, []);

  const handleRequestChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setOutStockRequest(prevRequest => {
      const outStockRequestsCopy = copy(prevRequest) as OutStockRequestState;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateStockInfoCopy(outStockRequestsCopy as any, name, value);

      if (assignMode) {
        outStockRequestsCopy.quantity = "\u96a8\u610f";
      }

      return outStockRequestsCopy;
    });
  }, [assignMode]);

  const checkFormAlgorithm = useCallback((request: OutStockRequestState): boolean => {
    let isFormValid = false;

    if (assignMode) {
      if (
        request.errors.quantity1 === "" &&
        Number(request.quantity1) > 0 &&
        request.errors.quantity2 === "" &&
        Number(request.quantity2) > 0 &&
        request.reason !== ""
      ) {
        isFormValid = true;
      } else {
        isFormValid = false;
      }
    } else {
      if (request.reason !== "") {
        isFormValid = true;
      }
    }

    return isFormValid;
  }, [assignMode]);

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);

    const newOutStockRequest: OutStockRequestSubmit = {
      productNo: outStockRequest.productNo,
      type: outStockRequest.type,
      unit: outStockRequest.unit,
      reason: outStockRequest.reason,
      quantity: assignMode
        ? "\u7d04" + outStockRequest.quantity1 + "~" + outStockRequest.quantity2
        : outStockRequest.quantity
    };

    handleOutStockRequestSubmit(newOutStockRequest);
    setIsSubmitting(false);
  }, [assignMode, outStockRequest, handleOutStockRequestSubmit]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && checkFormAlgorithm(outStockRequest)) {
      e.preventDefault();
      handleSubmit();
    }
  }, [checkFormAlgorithm, outStockRequest, handleSubmit]);

  const { errors } = outStockRequest;
  const isFormValid = checkFormAlgorithm(outStockRequest);

  return (
    <Modal
      centered
      show={show}
      onHide={handleModalClose}
      aria-labelledby="outstock-modal-title"
      aria-describedby="outstock-modal-description"
      backdrop="static"
      keyboard={true}
    >
      <Modal.Header
        closeButton
        style={{
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
          color: "var(--color-white)",
          borderBottom: "none",
          padding: "var(--spacing-4)",
        }}
        closeVariant="white"
      >
        <Modal.Title
          id="outstock-modal-title"
          style={{
            fontWeight: "var(--font-weight-semibold)",
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-2)",
          }}
        >
          <i className="fa fa-shopping-cart" aria-hidden="true" />
          拉貨要求
        </Modal.Title>
      </Modal.Header>
      <Modal.Body id="outstock-modal-description">
        <div className="container">
          <Form onKeyDown={handleKeyDown}>
            <Form.Group as={Row} className="mb-3">
              <Form.Label
                column
                md={4}
                htmlFor="productNo"
                style={{
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--color-gray-700)"
                }}
              >
                {"\u8ca8\u865f"}
              </Form.Label>
              <Col md={8}>
                <Form.Control
                  type="text"
                  id="productNo"
                  name="productNo"
                  value={outStockRequest.productNo}
                  disabled
                  aria-readonly="true"
                  style={{
                    backgroundColor: "var(--color-gray-100)",
                    fontWeight: "var(--font-weight-medium)"
                  }}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
              <Form.Label
                column
                md={4}
                htmlFor="type"
                style={{
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--color-gray-700)"
                }}
              >
                {"\u578b\u614b"}
              </Form.Label>
              <Col md={8}>
                <Form.Control
                  as="select"
                  id="type"
                  name="type"
                  defaultValue={StockIdentifierType.roll}
                  onChange={handleRequestChange}
                  aria-label="\u9078\u64c7\u5eab\u5b58\u578b\u614b"
                >
                  {Object.keys(StockIdentifierType).map((type, index) => (
                    <option key={index} value={StockIdentifierType[type]}>
                      {StockIdentifierType[type]}
                    </option>
                  ))}
                </Form.Control>
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
              <Form.Label
                column
                md={2}
                style={{
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--color-gray-700)"
                }}
              >
                {"\u6578\u91cf"}
              </Form.Label>
              <Col md={2} className="d-flex align-items-center">
                <Switch
                  color="primary"
                  name="assignMode"
                  checked={assignMode}
                  onChange={handleAssignMode}
                  slotProps={{
                    input: {
                      "aria-label": assignMode ? "\u5207\u63db\u70ba\u96a8\u610f\u6578\u91cf" : "\u5207\u63db\u70ba\u6307\u5b9a\u6578\u91cf\u7bc4\u570d"
                    }
                  }}
                />
              </Col>
              {assignMode ? (
                <React.Fragment>
                  <Col md={4}>
                    <InputGroup>
                      <InputGroup.Text
                        style={{
                          backgroundColor: "var(--color-primary-light)",
                          color: "var(--color-primary-dark)",
                          fontWeight: "var(--font-weight-medium)"
                        }}
                      >
                        {"\u7d04"}
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        name="quantity1"
                        placeholder="\u6700\u5c0f\u6578\u91cf"
                        onChange={handleRequestChange}
                        isInvalid={!!errors.quantity1}
                        aria-label="\u6700\u5c0f\u6578\u91cf"
                        aria-describedby={errors.quantity1 ? "quantity1-error" : undefined}
                        min="0"
                      />
                      {errors.quantity1 && (
                        <Form.Control.Feedback
                          type="invalid"
                          id="quantity1-error"
                          role="alert"
                        >
                          {errors.quantity1}
                        </Form.Control.Feedback>
                      )}
                    </InputGroup>
                  </Col>
                  <Form.Label
                    column
                    md={1}
                    className="text-center"
                    style={{ color: "var(--color-gray-500)" }}
                  >
                    ~
                  </Form.Label>
                  <Col md={3}>
                    <Form.Control
                      type="number"
                      name="quantity2"
                      placeholder="\u6700\u5927\u6578\u91cf"
                      onChange={handleRequestChange}
                      isInvalid={!!errors.quantity2}
                      aria-label="\u6700\u5927\u6578\u91cf"
                      aria-describedby={errors.quantity2 ? "quantity2-error" : undefined}
                      min="0"
                    />
                    {errors.quantity2 && (
                      <Form.Control.Feedback
                        type="invalid"
                        id="quantity2-error"
                        role="alert"
                      >
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
                    aria-readonly="true"
                    style={{
                      backgroundColor: "var(--color-gray-100)"
                    }}
                  />
                </Col>
              )}
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
              <Form.Label
                column
                md={4}
                htmlFor="unit"
                style={{
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--color-gray-700)"
                }}
              >
                {"\u55ae\u4f4d"}
              </Form.Label>
              <Col md={8}>
                <Form.Control
                  as="select"
                  id="unit"
                  name="unit"
                  defaultValue="\u78bc"
                  onChange={handleRequestChange}
                  aria-label="\u9078\u64c7\u55ae\u4f4d"
                >
                  <option value="\u78bc">{"\u78bc"}</option>
                  <option value="\u5c3a">{"\u5c3a"}</option>
                </Form.Control>
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
              <Form.Label
                column
                md={4}
                htmlFor="outStockReason"
                style={{
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--color-gray-700)"
                }}
              >
                {"\u51fa\u5eab\u539f\u56e0"}
                <span
                  style={{
                    color: "var(--color-danger)",
                    marginLeft: "var(--spacing-1)"
                  }}
                  aria-hidden="true"
                >
                  *
                </span>
              </Form.Label>
              <Col md={8}>
                <Form.Control
                  type="text"
                  id="outStockReason"
                  name="outStockReason"
                  placeholder="\u8acb\u8f38\u5165\u51fa\u5eab\u539f\u56e0"
                  onChange={handleRequestChange}
                  aria-required="true"
                  autoComplete="off"
                />
                <Form.Text
                  className="text-muted"
                  style={{ fontSize: "var(--font-size-sm)" }}
                >
                  {"\u8acb\u586b\u5beb\u6b64\u6b21\u51fa\u5eab\u7684\u539f\u56e0\u8aaa\u660e"}
                </Form.Text>
              </Col>
            </Form.Group>
          </Form>
        </div>
      </Modal.Body>
      <Modal.Footer
        style={{
          backgroundColor: "var(--color-gray-50)",
          borderTop: "1px solid var(--color-gray-200)",
          gap: "var(--spacing-2)"
        }}
      >
        <Button
          variant="secondary"
          onClick={handleModalClose}
          style={{
            fontWeight: "var(--font-weight-medium)"
          }}
        >
          {"\u53d6\u6d88"}
        </Button>
        <Button
          variant="primary"
          disabled={!isFormValid || isSubmitting}
          onClick={handleSubmit}
          aria-busy={isSubmitting}
          style={{
            fontWeight: "var(--font-weight-medium)"
          }}
        >
          {isSubmitting ? "\u8655\u7406\u4e2d..." : "\u5132\u5b58\u81f3\u660e\u7d30"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OutStockModal;
