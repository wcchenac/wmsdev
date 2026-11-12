import React, { Component } from 'react';
import ModifyRequest from './ModifyRequest';

import type { ValueType } from "react-select";
import type { DefectOption } from "../../../../../types/domain";

export interface ShrinkFormRow {
  type?: string;
  quantity: string;
  unit: string;
  color?: string | number;
  defect?:
    | DefectOption[]
    | ReadonlyArray<DefectOption | undefined>
    | string
    | null;
  record?: string;
  remark?: string;
  outStockReason: string;
  errors?: { quantity?: string };
  directShip?: boolean;
  productNo?: string;
  lotNo?: string;
  parentId?: number;
  inStockType?: string;
  orderNo?: string;
}

interface Props {
  typeValidation: boolean;
  newStockInfoes: ShrinkFormRow[];
  onRequestChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number
  ) => void;
  handleDefectChange: (
    selected: ValueType<DefectOption, true>,
    index: number
  ) => void;
  handleShipCheck: (checked: boolean, index: number) => void;
  handleReasonButton: (value: string, index: number) => void;
}


class ModifyRequestContainer extends Component<Props> {
    render() {
        const { typeValidation, newStockInfoes } = this.props;

        return (
            <div>
                <table className="table">
                    <thead className="thead-dark">
                        <tr>
                            {typeValidation ? (
                                <React.Fragment>
                                    <th style={{ width: '24%' }}>型態</th>
                                    <th style={{ width: '23%' }}>數量</th>
                                    <th style={{ width: '23%' }}>單位</th>
                                    <th style={{ width: '24%' }}>註解</th>
                                    <th style={{ width: '6%' }}>直出</th>
                                </React.Fragment>
                            ) : (
                                <React.Fragment>
                                    <th style={{ width: '20%' }}>型態</th>
                                    <th style={{ width: '14%' }}>數量</th>
                                    <th style={{ width: '14%' }}>單位</th>
                                    <th style={{ width: '23%' }}>瑕疵</th>
                                    <th style={{ width: '23%' }}>註解</th>
                                    <th style={{ width: '6%' }}>直出</th>
                                </React.Fragment>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {newStockInfoes.map((stockInfo, index) => (
                            <ModifyRequest
                                key={index}
                                index={index}
                                typeValidation={typeValidation}
                                stockInfo={stockInfo}
                                onRequestChange={this.props.onRequestChange}
                                handleDefectChange={
                                    this.props.handleDefectChange
                                }
                                handleShipCheck={this.props.handleShipCheck}
                                handleReasonButton={
                                    this.props.handleReasonButton
                                }
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default ModifyRequestContainer;
