import React, { Component } from "react";
import { Link } from "react-router-dom";

class PreviewClothInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clothInfo: props.location.state.clothInfo
    };
    this.handleBackClick = this.handleBackClick.bind(this);
  }

  handleBackClick() {
    this.props.history.goBack();
  }

  render() {
    const { clothInfo } = this.state;
    let btnDropContent;

    const btnAlgorithm = type => {
      if (type === "整支") {
        return (
          <div className="dropdown-menu" aria-labelledby="btnGroupDrop1">
            <Link
              className="dropdown-item"
              to={{
                pathname: `/cloth/3/1/${clothInfo.id}`,
                state: { clothInfo: clothInfo }
              }}
            >
              板卷異動
            </Link>
            <Link
              className="dropdown-item"
              to={{
                pathname: `/cloth/3/2/${clothInfo.id}`,
                state: { clothInfo: clothInfo }
              }}
            >
              整支異動
            </Link>
            <Link className="dropdown-item" to="#">
              更改註解
            </Link>
          </div>
        );
      } else if (type === "板卷") {
        return (
          <div className="dropdown-menu" aria-labelledby="btnGroupDrop1">
            <Link
              className="dropdown-item"
              to={{
                pathname: `/cloth/3/1/${clothInfo.id}`,
                state: { clothInfo: clothInfo }
              }}
            >
              板卷異動
            </Link>
            <Link className="dropdown-item" to="#">
              更改註解
            </Link>
          </div>
        );
      } else {
        return (
          <div className="dropdown-menu" aria-labelledby="btnGroupDrop1">
            <Link className="dropdown-item" to="#">
              更改註解
            </Link>
          </div>
        );
      }
    };

    btnDropContent = btnAlgorithm(clothInfo.clothIdentifier.type);

    return (
      <div className="cloth_info">
        <div className="container">
          <div className="row">
            <div className="col-md-6 m-auto">
              <p className="h3 text-center">庫存資料</p>
              <hr />
              <form>
                <div className="form-group row">
                  <label className="col-2 col-form-label-lg text-center">
                    貨號
                  </label>
                  <label className="col-10 col-form-label-lg text-center">
                    {clothInfo.clothIdentifier.productNo}
                  </label>
                </div>
                <div className="form-group row">
                  <label className="col-2 col-form-label-lg text-center">
                    批號
                  </label>
                  <label className="col-10 col-form-label-lg text-center">
                    {clothInfo.clothIdentifier.lotNo}
                  </label>
                </div>
                <div className="form-group row">
                  <label className="col-2 col-form-label-lg text-center">
                    型態
                  </label>
                  <label className="col-10 col-form-label-lg text-center">
                    {clothInfo.clothIdentifier.type}
                  </label>
                </div>
                <div className="form-group row">
                  <label className="col-2 col-form-label-lg text-center">
                    長度
                  </label>
                  <label className="col-10 col-form-label-lg text-center">
                    {clothInfo.clothIdentifier.length}
                  </label>
                </div>
                <div className="form-group row">
                  <label className="col-2 col-form-label-lg text-center">
                    單位
                  </label>
                  <label className="col-10 col-form-label-lg text-center">
                    {clothInfo.clothIdentifier.unit}
                  </label>
                </div>
                <div className="form-group row">
                  <label className="col-2 col-form-label-lg text-center">
                    流水號
                  </label>
                  <label className="col-10 col-form-label-lg text-center">
                    {clothInfo.clothIdentifier.serialNo}
                  </label>
                </div>
                <div className="form-group row">
                  <label className="col-2 col-form-label-lg text-center">
                    色號
                  </label>
                  <label className="col-10 col-form-label-lg text-center">
                    {clothInfo.color}
                  </label>
                </div>
                <div className="form-group row">
                  <label className="col-2 col-form-label-lg text-center">
                    缺陷
                  </label>
                  <label className="col-10 col-form-label-lg text-center">
                    {clothInfo.defect}
                  </label>
                </div>
                <div className="form-group row">
                  <label className="col-2 col-form-label-lg text-center">
                    記錄
                  </label>
                  <label className="col-10 col-form-label-lg text-center">
                    {clothInfo.record}
                  </label>
                </div>
                <div className="form-group row">
                  <label className="col-2 col-form-label-lg text-center">
                    註解
                  </label>
                  <label className="col-10 col-form-label-lg text-center">
                    {clothInfo.remark}
                  </label>
                </div>
                <hr />
                <div className="row justify-content-between">
                  <button
                    type="button"
                    onClick={this.handleBackClick}
                    className="btn btn-secondary col-4"
                  >
                    返回
                  </button>
                  <div className="btn-group col-4" role="group">
                    <button
                      type="botton"
                      id="btnGroupDrop1"
                      className="btn btn-primary dropdown-toggle"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      選擇異動方式
                    </button>
                    {btnDropContent}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PreviewClothInfo;
