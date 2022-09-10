import React, { PureComponent } from 'react';
import ShrinkInfoContainer from './ShrinkInfoContainer';
import LoadingOverlay from 'react-loading-overlay';
import { Spinner } from '../../../../Others/Spinner';

const refreshTime = 1000 * 60 * 10;

class ShrinkList extends PureComponent {
    componentDidMount() {
        this.props.queryShrinkList();
        this.apiCall = setInterval(() => {
            this.props.queryShrinkList();
        }, refreshTime);
    }

    componentWillUnmount() {
        clearInterval(this.apiCall);
    }

    render() {
        return (
            <div className="shrink_list">
                <div className="container">
                    <p className="h3 text-center">待處理清單</p>
                    <hr />
                    <LoadingOverlay
                        active={this.props.isLoading}
                        spinner={<Spinner />}
                    >
                        <div style={{ height: '80vh' }}>
                            <ShrinkInfoContainer
                                shrinkList={this.props.shrinkList}
                                onModifyClick={this.props.onModifyClick}
                                onCancelShrinkClick={
                                    this.props.onCancelShrinkClick
                                }
                            />
                        </div>
                    </LoadingOverlay>
                </div>
            </div>
        );
    }
}

export default ShrinkList;
