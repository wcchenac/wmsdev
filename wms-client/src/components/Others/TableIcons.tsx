import React, { forwardRef } from "react";
import { SvgIconProps } from "@mui/material/SvgIcon";
import AddBox from "@mui/icons-material/AddBox";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import Check from "@mui/icons-material/Check";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Clear from "@mui/icons-material/Clear";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Edit from "@mui/icons-material/Edit";
import FilterList from "@mui/icons-material/FilterList";
import FirstPage from "@mui/icons-material/FirstPage";
import LastPage from "@mui/icons-material/LastPage";
import Remove from "@mui/icons-material/Remove";
import SaveAlt from "@mui/icons-material/SaveAlt";
import Search from "@mui/icons-material/Search";
import ViewColumn from "@mui/icons-material/ViewColumn";
import SaveIcon from "@mui/icons-material/Save";

type IconComponent = React.ForwardRefExoticComponent<
  SvgIconProps & React.RefAttributes<SVGSVGElement>
>;

interface TableIconsType {
  Add: IconComponent;
  Check: IconComponent;
  Clear: IconComponent;
  Delete: IconComponent;
  DetailPanel: IconComponent;
  Edit: IconComponent;
  Export: IconComponent;
  Filter: IconComponent;
  FirstPage: IconComponent;
  LastPage: IconComponent;
  NextPage: IconComponent;
  PreviousPage: IconComponent;
  ResetSearch: IconComponent;
  Search: IconComponent;
  SortArrow: IconComponent;
  ThirdStateCheck: IconComponent;
  ViewColumn: IconComponent;
  Save: IconComponent;
}

export const tableIcons: TableIconsType = {
  Add: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => <ViewColumn {...props} ref={ref} />),
  Save: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => <SaveIcon {...props} ref={ref} />)
};
