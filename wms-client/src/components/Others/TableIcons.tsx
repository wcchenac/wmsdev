import React, { forwardRef } from "react";
import type { SvgIconProps } from "@material-ui/core/SvgIcon";
import AddBox from "@material-ui/icons/AddBox";
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Remove from "@material-ui/icons/Remove";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";
import SaveIcon from "@material-ui/icons/Save";

type IconType = React.ComponentType<SvgIconProps>;

function tableIcon(Icon: IconType) {
  return forwardRef<SVGSVGElement, SvgIconProps>(function TableIcon(props, ref) {
    return <Icon {...props} ref={ref} />;
  });
}

export const tableIcons = {
  Add: tableIcon(AddBox),
  Check: tableIcon(Check),
  Clear: tableIcon(Clear),
  Delete: tableIcon(DeleteOutline),
  DetailPanel: tableIcon(ChevronRight),
  Edit: tableIcon(Edit),
  Export: tableIcon(SaveAlt),
  Filter: tableIcon(FilterList),
  FirstPage: tableIcon(FirstPage),
  LastPage: tableIcon(LastPage),
  NextPage: tableIcon(ChevronRight),
  PreviousPage: tableIcon(ChevronLeft),
  ResetSearch: tableIcon(Clear),
  Search: tableIcon(Search),
  SortArrow: tableIcon(ArrowDownward),
  ThirdStateCheck: tableIcon(Remove),
  ViewColumn: tableIcon(ViewColumn),
  Save: tableIcon(SaveIcon),
};
