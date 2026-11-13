import React from "react";

import equal from "fast-deep-equal";

interface ProductInfo {
  productNo: string;
  picture: string;
  cName: string;
  spec: string;
  packDesc: string;
  addType: string;
  descrip: string;
  supp: string;
  suppName: string;
  userField1: string;
  prodDesc: string;
  cCost: string | number;
  cCCCODE: string;
  eNAME?: string;
  eSPEC?: string;
}

interface ShowProductInformationProps {
  isBasic: boolean;
  isQuery: boolean;
  productNo: string;
  productInfo: ProductInfo;
}

const ShowProductInformation: React.FC<ShowProductInformationProps> = ({
  isBasic,
  isQuery,
  productNo,
  productInfo,
}) => {
  const isDisabled = !isQuery || productNo.toUpperCase() !== productInfo.productNo;

  const InfoRow: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
    <div
      className="info-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: 'var(--spacing-2) 0',
        borderBottom: '1px solid var(--color-gray-100)',
      }}
    >
      <span
        style={{
          width: '40%',
          color: 'var(--color-gray-600)',
          fontWeight: 'var(--font-weight-medium)',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          width: '60%',
          color: 'var(--color-gray-800)',
          fontWeight: 'var(--font-weight-normal)',
        }}
      >
        {value || '-'}
      </span>
    </div>
  );

  return (
    <React.Fragment>
      <button
        className="btn btn-primary"
        disabled={isDisabled}
        data-toggle="modal"
        data-target="#picture"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--spacing-2)',
          padding: 'var(--btn-padding-y) var(--btn-padding-x)',
          fontWeight: 'var(--font-weight-medium)',
          boxShadow: isDisabled ? 'none' : 'var(--shadow-sm)',
        }}
      >
        <i className="fa fa-info-circle" aria-hidden="true" />
        貨號資料
      </button>
      <div
        className="modal fade"
        id="picture"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="content"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div className="modal-content">
            <div
              className="modal-header"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                color: 'var(--color-white)',
                borderBottom: 'none',
              }}
            >
              <h5 className="modal-title" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                <i className="fa fa-cube mr-2" aria-hidden="true" />
                產品詳細資料
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                style={{ color: 'var(--color-white)', opacity: 0.8 }}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body" style={{ padding: 'var(--spacing-6)' }}>
              <div className="row">
                <div className="col-md-5 d-flex align-items-center justify-content-center mb-4 mb-md-0">
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      backgroundColor: 'var(--color-gray-100)',
                      borderRadius: 'var(--border-radius-lg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {equal(productInfo.picture, "無資料") ||
                    !productInfo.picture ? (
                      <div style={{ textAlign: 'center', color: 'var(--color-gray-400)' }}>
                        <i className="fa fa-image fa-3x mb-2" aria-hidden="true" />
                        <p style={{ marginBottom: 0, fontSize: 'var(--font-size-sm)' }}>無圖片</p>
                      </div>
                    ) : (
                      <img
                        src={productInfo.picture.substring(1)}
                        className="img-fluid"
                        alt={productInfo.cName || '產品圖片'}
                        style={{ borderRadius: 'var(--border-radius-lg)' }}
                      />
                    )}
                  </div>
                </div>
                <div className="col-md-7">
                  <div
                    style={{
                      backgroundColor: 'var(--color-gray-50)',
                      borderRadius: 'var(--border-radius-md)',
                      padding: 'var(--spacing-4)',
                    }}
                  >
                    <h6
                      style={{
                        color: 'var(--color-primary)',
                        fontWeight: 'var(--font-weight-semibold)',
                        marginBottom: 'var(--spacing-3)',
                        paddingBottom: 'var(--spacing-2)',
                        borderBottom: '2px solid var(--color-primary-light)',
                      }}
                    >
                      基本資訊
                    </h6>
                    <InfoRow label="品名" value={productInfo.cName} />
                    <InfoRow label="規格" value={productInfo.spec} />
                    <InfoRow label="基重" value={productInfo.packDesc} />
                    <InfoRow label="追加狀態" value={productInfo.addType} />
                    <InfoRow label="價格異動" value={productInfo.descrip} />
                    <InfoRow label="大牌品名" value={productInfo.cCCCODE} />
                  </div>

                  {!isBasic && (
                    <div
                      style={{
                        backgroundColor: 'var(--color-gray-50)',
                        borderRadius: 'var(--border-radius-md)',
                        padding: 'var(--spacing-4)',
                        marginTop: 'var(--spacing-4)',
                      }}
                    >
                      <h6
                        style={{
                          color: 'var(--color-info)',
                          fontWeight: 'var(--font-weight-semibold)',
                          marginBottom: 'var(--spacing-3)',
                          paddingBottom: 'var(--spacing-2)',
                          borderBottom: '2px solid var(--color-info-light)',
                        }}
                      >
                        進階資訊
                      </h6>
                      <InfoRow label="廠商代碼/名稱" value={`${productInfo.supp || ''}/${productInfo.suppName || ''}`} />
                      <InfoRow label="自設欄1" value={productInfo.userField1} />
                      <InfoRow label="產品描述" value={productInfo.prodDesc} />
                      <InfoRow label="成本" value={productInfo.cCost} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ShowProductInformation;
