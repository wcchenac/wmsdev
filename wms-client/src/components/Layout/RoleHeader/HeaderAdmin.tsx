import React from "react";
import { NavLink } from "react-router";
import { Dropdown } from "react-bootstrap";

const HeaderAdmin: React.FC = () => (
  <React.Fragment>
    <ul className="navbar-nav me-auto">
      <Dropdown as="li" className="nav-item">
        <Dropdown.Toggle as="button" type="button" className="nav-link" id="stockInDropdown">
          入庫作業
        </Dropdown.Toggle>
        <Dropdown.Menu renderOnMount>
          <Dropdown.Item as={NavLink} to="/stock/1/1">
            進貨單入庫
          </Dropdown.Item>
          <Dropdown.Item as={NavLink} to="/stock/1/2">
            組裝單入庫
          </Dropdown.Item>
          <Dropdown.Item as={NavLink} to="/stock/1/3">
            退貨單入庫
          </Dropdown.Item>
          <Dropdown.Item as={NavLink} to="/stock/1/4">
            調撥單入庫
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <li className="nav-item">
        <NavLink className="nav-link" to="/stock/2/2">
          庫存查詢
        </NavLink>
      </li>
      <li className="nav-item">
        <NavLink className="nav-link" to="/stock/2/3">
          出庫單查詢
        </NavLink>
      </li>
      <Dropdown as="li" className="nav-item">
        <Dropdown.Toggle as="button" type="button" className="nav-link" id="stockModifyDropdown">
          庫存異動作業
        </Dropdown.Toggle>
        <Dropdown.Menu renderOnMount>
          <Dropdown.Item as={NavLink} to="/stock/3/1">
            庫存異動
          </Dropdown.Item>
          <Dropdown.Item as={NavLink} to="/stock/3/2">
            減肥清單
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <li className="nav-item">
        <NavLink className="nav-link" to="/stock/4">
          拉貨明細
        </NavLink>
      </li>
      <li className="nav-item">
        <NavLink className="nav-link" to="/stock/5">
          歷史記錄查詢
        </NavLink>
      </li>
      <li className="nav-item">
        <NavLink className="nav-link" to="/files">
          檔案總管
        </NavLink>
      </li>
      <li className="nav-item">
        <NavLink className="nav-link" to="/admin">
          管理員區域
        </NavLink>
      </li>
    </ul>
  </React.Fragment>
);

export default HeaderAdmin;
