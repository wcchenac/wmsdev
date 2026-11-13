import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    getShrinkList,
    stockIdentifierWaitToShrinkIsFalse,
    batchCreateStockInfoesForShrink,
} from '../../../../../actions/StockAcions';
import ShrinkList from './ShrinkList';
import ModifyRequestBoard from './ModifyRequestBoard';

import type { RootState } from "../../../../../types/state";
import type { ApiStatus, StoredStockInfo } from "../../../../../types/domain";

interface ShrinkSlice {
  stockInfoes: StoredStockInfo[];
}

interface StateProps {
  shrinkList: ShrinkSlice;
}

interface DispatchProps {
  getShrinkList: () => Promise<ApiStatus | undefined>;
  stockIdentifierWaitToShrinkIsFalse: (stockIdentifierId: number) => Promise<ApiStatus | undefined>;
  batchCreateStockInfoesForShrink: (request: unknown) => Promise<ApiStatus | undefined>;
}

type Props = StateProps & DispatchProps;

interface State {
  isLoading: boolean;
  waitCreateResp: boolean;
  shrinkList: StoredStockInfo[];
  stockInfo: StoredStockInfo;
  typeExchange: boolean;
  sameTypeModify: boolean;
  hardwareModify: boolean;
}


class ShrinkBoard extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isLoading: false,
            waitCreateResp: false,
            shrinkList: [],
            stockInfo: {} as StoredStockInfo,
            typeExchange: false,
            sameTypeModify: false,
            hardwareModify: false,
        };
        this.queryShrinkList = this.queryShrinkList.bind(this);
        this.onModifyClick = this.onModifyClick.bind(this);
        this.handleModifyRequestSubmit =
            this.handleModifyRequestSubmit.bind(this);
        this.onCancelShrinkClick = this.onCancelShrinkClick.bind(this);
        this.handleGoBack = this.handleGoBack.bind(this);
        this.initialComponent = this.initialComponent.bind(this);
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.shrinkList !== prevProps.shrinkList) {
            this.setState({ shrinkList: this.props.shrinkList.stockInfoes as StoredStockInfo[] });
        }
    }

    initialComponent() {
        this.setState({
            isLoading: false,
            waitCreateResp: false,
            shrinkList: [],
            stockInfo: {} as StoredStockInfo,
            typeExchange: false,
            sameTypeModify: false,
            hardwareModify: false,
        });
    }

    handleGoBack() {
        this.setState({
            typeExchange: false,
            sameTypeModify: false,
            hardwareModify: false,
            stockInfo: {} as StoredStockInfo,
        });
    }

    onModifyClick(type: string, stockInfo: StoredStockInfo) {
        if (type === "typeExchange") {
            this.setState({ typeExchange: true, stockInfo });
        } else if (type === "sameTypeModify") {
            this.setState({ sameTypeModify: true, stockInfo });
        } else {
            this.setState({ hardwareModify: true, stockInfo });
        }
    }

    queryShrinkList() {
        this.setState({ isLoading: true }, () => {
            this.props.getShrinkList().then((response) => {
                if (response?.status === 200) {
                    this.setState({ isLoading: false });
                }
            });
        });
    }

    handleModifyRequestSubmit(shrinkStockRequest: unknown) {
        if (!this.state.waitCreateResp) {
            this.setState({ isLoading: true, waitCreateResp: true }, () => {
                this.props
                    .batchCreateStockInfoesForShrink(shrinkStockRequest)
                    .then((res) => {
                        if (res?.status === 200) {
                            this.initialComponent();
                        }
                    })
                    .catch((err) => console.log(err));
            });
        }
    }

    onCancelShrinkClick(stockIdentifierId: number) {
        this.setState({ isLoading: true }, () => {
            this.props
                .stockIdentifierWaitToShrinkIsFalse(stockIdentifierId)
                .then((response) => {
                    if (response?.status === 200) {
                        this.setState({ isLoading: false });
                    }
                });
        });
    }

    render() {
        const {
            isLoading,
            shrinkList,
            stockInfo,
            typeExchange,
            sameTypeModify,
            hardwareModify,
        } = this.state;

        return typeExchange || sameTypeModify || hardwareModify ? (
            <ModifyRequestBoard
                isLoading={isLoading}
                stockInfo={stockInfo}
                typeExchange={typeExchange}
                sameTypeModify={sameTypeModify}
                hardwareModify={hardwareModify}
                handleGoBack={this.handleGoBack}
                handleModifyRequestSubmit={this.handleModifyRequestSubmit}
                initialComponent={this.initialComponent}
            />
        ) : (
            <ShrinkList
                isLoading={isLoading}
                shrinkList={shrinkList}
                queryShrinkList={this.queryShrinkList}
                onModifyClick={this.onModifyClick}
                onCancelShrinkClick={this.onCancelShrinkClick}
            />
        );
    }
}


const mapStateToProps = (state: RootState): StateProps => ({
    shrinkList: state.stockInfo as unknown as ShrinkSlice,
});

export default connect(mapStateToProps, {
    getShrinkList,
    stockIdentifierWaitToShrinkIsFalse,
    batchCreateStockInfoesForShrink,
})(ShrinkBoard);
