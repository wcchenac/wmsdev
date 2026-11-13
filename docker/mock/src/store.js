const { ROLE_LABEL } = require("./auth");

const IN_STOCK_LABEL = {
  normal: "進貨單",
  assemble: "組裝單",
  customerReturn: "退貨單",
  storeReturn: "調撥單",
  fileImport: "檔案匯入",
  shrink: "減肥",
};

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function today() {
  return isoDate(new Date());
}

function daysAgo(count) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - count);
  return isoDate(date);
}

function yyyymmdd(iso) {
  return iso.replace(/-/g, "");
}

function stamp() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds())
  );
}

function createStore() {
  let nextId = 1;
  const id = () => nextId++;

  const users = [
    { id: id(), employeeId: "admin", password: "admin123", fullName: "陳管理", role: "ROLE_Admin" },
    { id: id(), employeeId: "operator", password: "operator123", fullName: "林倉管", role: "ROLE_Operator" },
    { id: id(), employeeId: "sales", password: "sales123", fullName: "李業務", role: "ROLE_Sales" },
    { id: id(), employeeId: "store", password: "store123", fullName: "張門市", role: "ROLE_Normal" },
  ];

  const catalog = {
    CF1001: productInfo("CF1001", {
      cName: "精梳棉布",
      spec: "幅寬 150cm",
      supp: "S001",
      suppName: "南紡",
      prodDesc: "襯衫用平紋棉",
      userField1: "春夏",
      descrip: "平紋",
      packDesc: "捲裝",
      addType: "可追加",
      cCost: "85.00",
      cCCCODE: "5101",
      eNAME: "Combed Cotton",
      eSPEC: "150cm",
      category: "棉布",
    }),
    CF1002: productInfo("CF1002", {
      cName: "亞麻胚布",
      spec: "幅寬 140cm",
      supp: "S014",
      suppName: "台麻",
      prodDesc: "服裝胚布",
      userField1: "全年",
      descrip: "亞麻",
      packDesc: "捲裝",
      addType: "暫缺貨",
      cCost: "120.00",
      cCCCODE: "5108",
      eNAME: "Linen Greige",
      eSPEC: "140cm",
      category: "麻布",
    }),
    HW9001: productInfo("HW9001", {
      cName: "包裝紙箱",
      spec: "60x40x40",
      supp: "S090",
      suppName: "盒廠",
      prodDesc: "出貨紙箱",
      userField1: "耗材",
      descrip: "五層瓦楞",
      packDesc: "疊裝",
      addType: "可追加",
      cCost: "18.00",
      cCCCODE: "8901",
      eNAME: "Carton",
      eSPEC: "60x40x40",
      category: "五金",
    }),
    CF1003: productInfo("CF1003", {
      cName: "庫存已清空樣布",
      spec: "幅寬 110cm",
      supp: "S003",
      suppName: "樣品室",
      prodDesc: "只供查無庫存狀態",
      userField1: "樣品",
      descrip: "無庫存",
      packDesc: "無",
      addType: "無貨",
      cCost: "0.00",
      cCCCODE: "5199",
      eNAME: "Sample Cloth",
      eSPEC: "110cm",
      category: "棉布",
    }),
  };

  const stockInfos = [];
  const childrenOf = {};
  const inStockRecords = [];
  const outStockRequests = [];
  const orders = {
    inStock: {},
    assemble: {},
    customerReturn: {},
    storeReturn: {},
  };
  const outStockToStore = {};
  const files = {
    allocation: [],
    adjustment: [],
    dailyComparison: [],
    outStockList: [],
    categoryDetail: ["CategoryDetail-棉布.xls", "CategoryDetail-麻布.xls", "CategoryDetail-五金.xls"],
  };

  function addOrder(kind, orderNo, currentStatus) {
    orders[kind][orderNo] = { currentStatus, received: {} };
  }

  addOrder("inStock", "IN2026001", {
    CF1001: { 板卷: { quantity: "120.00", unit: "碼" }, 整支: { quantity: "30.00", unit: "碼" } },
    CF1002: { 板卷: { quantity: "80.00", unit: "碼" } },
  });
  addOrder("assemble", "AS2026001", {
    CF1001: { 板卷: { quantity: "40.00", unit: "碼" } },
  });
  addOrder("customerReturn", "CR2026001", {
    CF1002: { 整支: { quantity: "15.00", unit: "碼" } },
  });
  addOrder("storeReturn", "SR2026001", {
    HW9001: { 雜項: { quantity: "24.00", unit: "個" } },
  });

  outStockToStore.OS2026001 = ["CF1001", "CF1002", "HW9001"].map((code) => ({
    productNo: catalog[code].productNo,
    cName: catalog[code].cName,
    cCCCODE: catalog[code].cCCCODE,
    spec: catalog[code].spec,
    packDesc: catalog[code].packDesc,
  }));

  const root = makeInfo({
    productNo: "CF1001",
    lotNo: "L2409",
    type: "整支",
    quantity: "60.00",
    unit: "碼",
    color: 2,
    defect: "",
    record: "原始整支",
    remark: "已減肥",
    inStockType: "進貨單",
    firstInStockAt: daysAgo(20),
    exist: false,
    eliminateType: "1",
    eliminateDate: daysAgo(10),
    eliminateReason: "減肥",
    adjustment: "0.50",
  });
  makeInfo({
    productNo: "CF1001",
    lotNo: "L2409",
    type: "板卷",
    quantity: "36.00",
    unit: "碼",
    color: 2,
    defect: "",
    record: "減肥子捲 A",
    remark: "A區",
    inStockType: "減肥",
    firstInStockAt: daysAgo(20),
    parentId: root.stockIdentifier.id,
  });
  makeInfo({
    productNo: "CF1001",
    lotNo: "L2409",
    type: "板卷",
    quantity: "23.50",
    unit: "碼",
    color: 3,
    defect: "GA",
    record: "減肥子捲 B",
    remark: "待出",
    inStockType: "減肥",
    firstInStockAt: daysAgo(20),
    parentId: root.stockIdentifier.id,
  });
  makeInfo({
    productNo: "CF1001",
    lotNo: "L2511",
    type: "整支",
    quantity: "45.00",
    unit: "碼",
    color: 1,
    defect: "",
    record: "在庫整支",
    remark: "可出貨",
    inStockType: "進貨單",
    firstInStockAt: daysAgo(12),
  });
  makeInfo({
    productNo: "CF1001",
    lotNo: "L2511",
    type: "板卷",
    quantity: "20.00",
    unit: "碼",
    color: 1,
    defect: "",
    record: "已入庫可回朔",
    remark: "入庫回朔示範",
    inStockType: "進貨單",
    firstInStockAt: daysAgo(2),
    orderType: "normal",
    orderNo: "IN2026001",
  });
  makeInfo({
    productNo: "CF1002",
    lotNo: "M2510",
    type: "板卷",
    quantity: "28.00",
    unit: "碼",
    color: 4,
    defect: "B",
    record: "待減肥",
    remark: "邊疵",
    inStockType: "進貨單",
    firstInStockAt: daysAgo(8),
    waitToShrink: true,
  });
  makeInfo({
    productNo: "CF1002",
    lotNo: "M2508",
    type: "板卷",
    quantity: "18.00",
    unit: "碼",
    color: 1,
    defect: "",
    record: "在庫",
    remark: "",
    inStockType: "進貨單",
    firstInStockAt: daysAgo(15),
  });
  makeInfo({
    productNo: "HW9001",
    lotNo: "",
    type: "雜項",
    quantity: "40.00",
    unit: "個",
    color: 0,
    defect: "",
    record: "",
    remark: "內倉",
    inStockType: "進貨單",
    firstInStockAt: daysAgo(6),
  });

  receive("normal", "IN2026001", "CF1001", "板卷", 20);

  addOutStock({
    productNo: "CF1002",
    lotNo: "M2510",
    type: "板卷",
    quantity: "28.00",
    unit: "碼",
    color: 4,
    defect: "B",
    reason: "減肥",
    outStockType: 1,
    stockIdentifierId: stockInfos.find((info) => info.stockIdentifier.waitToShrink).stockIdentifier.id,
    createdBy: "林倉管",
    handled: false,
  });

  addOutStock({
    productNo: "CF1001",
    lotNo: "",
    type: "板卷",
    quantity: "隨意",
    unit: "碼",
    color: 0,
    defect: "",
    reason: "中壢",
    outStockType: 2,
    stockIdentifierId: 0,
    createdBy: "陳管理",
    handled: false,
  });
  addOutStock({
    productNo: "HW9001",
    lotNo: "",
    type: "雜項",
    quantity: "10.00",
    unit: "個",
    color: 0,
    defect: "",
    reason: "上貨櫃",
    outStockType: 2,
    stockIdentifierId: 0,
    createdBy: "林倉管",
    handled: true,
    fileName: `OutStockList-${yyyymmdd(today())}090000.xls`,
    requestFrom: "內倉",
  });

  for (const offset of [0, 1, 2]) {
    const date = yyyymmdd(daysAgo(offset));
    files.allocation.push(`StockAllocateRecord-${date}.xls`);
    files.adjustment.push(`StockAdjustRecord-${date}.xls`);
    files.dailyComparison.push(`StockComparisonResult-${date}.xls`);
  }
  files.outStockList.push(`OutStockList-${yyyymmdd(today())}090000.xls`);

  function productInfo(productNo, fields) {
    return {
      productNo,
      cName: fields.cName,
      spec: fields.spec,
      supp: fields.supp,
      suppName: fields.suppName,
      prodDesc: fields.prodDesc,
      userField1: fields.userField1,
      descrip: fields.descrip,
      packDesc: fields.packDesc,
      addType: fields.addType,
      picture: "無資料",
      cCost: fields.cCost,
      cCCCODE: fields.cCCCODE,
      eNAME: fields.eNAME,
      eSPEC: fields.eSPEC,
      category: fields.category,
    };
  }

  function makeInfo(input) {
    const identifier = {
      id: id(),
      productNo: input.productNo,
      lotNo: input.lotNo || "",
      type: input.type,
      quantity: input.quantity,
      unit: input.unit,
      serialNo: input.serialNo || nextSerial(input.productNo),
      exist: input.exist !== false,
      waitToShrink: Boolean(input.waitToShrink),
      inStockType: input.inStockType || "",
      eliminateType: input.eliminateType || null,
      eliminateDate: input.eliminateDate || null,
      eliminateReason: input.eliminateReason || null,
      adjustment: input.adjustment || null,
      outStock: Boolean(input.outStock),
      firstInStockAt: input.firstInStockAt || today(),
      createdAt: input.firstInStockAt || today(),
    };
    const info = {
      id: id(),
      stockIdentifier: identifier,
      color: Number(input.color || 0),
      defect: input.defect || "",
      record: input.record || "",
      remark: input.remark || "",
      shrinkAt: null,
      storedAt: null,
    };
    stockInfos.push(info);
    if (input.parentId) {
      childrenOf[input.parentId] = childrenOf[input.parentId] || [];
      childrenOf[input.parentId].push(identifier.id);
    }
    if (input.orderNo) {
      inStockRecords.push({
        orderType: input.orderType,
        orderNo: input.orderNo,
        productNo: input.productNo,
        type: input.type,
        quantity: input.quantity,
        unit: input.unit,
        stockIdentifierId: identifier.id,
      });
    }
    return info;
  }

  function nextSerial(productNo) {
    return stockInfos.filter((info) => info.stockIdentifier.productNo === productNo).length + 1;
  }

  function presentIdentifier(identifier) {
    return {
      id: identifier.id,
      productNo: identifier.productNo,
      lotNo: identifier.lotNo,
      type: identifier.type,
      quantity: identifier.quantity,
      unit: identifier.unit,
      serialNo: identifier.serialNo,
      exist: identifier.exist,
      waitToShrink: identifier.waitToShrink,
      inStockType: identifier.inStockType,
      eliminateType: identifier.eliminateType,
      eliminateDate: identifier.eliminateDate,
      eliminateReason: identifier.eliminateReason,
      adjustment: identifier.adjustment,
      outStock: identifier.outStock,
      firstInStockAt: identifier.firstInStockAt,
    };
  }

  function presentInfo(info) {
    return {
      id: info.id,
      stockIdentifier: presentIdentifier(info.stockIdentifier),
      color: info.color,
      defect: info.defect,
      record: info.record,
      remark: info.remark,
      shrinkAt: info.shrinkAt,
      storedAt: info.storedAt,
    };
  }

  function presentOutStock(request) {
    return {
      id: request.id,
      productNo: request.productNo,
      lotNo: request.lotNo,
      type: request.type,
      quantity: request.quantity,
      unit: request.unit,
      color: request.color,
      defect: request.defect,
      reason: request.reason,
      outStockType: request.outStockType,
      stockIdentifierId: request.stockIdentifierId,
      fileName: request.fileName,
      handled: request.handled,
      deleted: request.deleted,
      requestFrom: request.requestFrom,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      createdBy: request.createdBy,
      updatedBy: request.updatedBy,
    };
  }

  function findInfoByIdentifier(identifierId) {
    return stockInfos.find((info) => info.stockIdentifier.id === Number(identifierId));
  }

  function findInfo(infoId) {
    return stockInfos.find((info) => info.id === Number(infoId));
  }

  function orderKind(orderType) {
    return orderType === "normal" ? "inStock" : orderType;
  }

  function receive(orderType, orderNo, productNo, type, quantity) {
    const kind = orderKind(orderType);
    const order = orders[kind] && orders[kind][orderNo];
    if (!order) {
      return;
    }
    order.received[productNo] = order.received[productNo] || {};
    order.received[productNo][type] = (order.received[productNo][type] || 0) + Number(quantity);
  }

  function waitHandle(order) {
    const result = {};
    Object.keys(order.currentStatus).forEach((productNo) => {
      result[productNo] = {};
      Object.keys(order.currentStatus[productNo]).forEach((type) => {
        const props = order.currentStatus[productNo][type];
        const received = (order.received[productNo] && order.received[productNo][type]) || 0;
        const remaining = Math.max(0, Number(props.quantity) - received);
        result[productNo][type] = {
          quantity: remaining.toFixed(2),
          unit: props.unit,
        };
      });
    });
    return result;
  }

  function productCodes() {
    return Object.keys(catalog).sort();
  }

  function queryProduct(rawProductNo) {
    const productNo = String(rawProductNo || "").toUpperCase();
    const info = catalog[productNo];
    const codes = productCodes();
    const index = codes.indexOf(productNo);
    const result = stockInfos
      .filter((item) => item.stockIdentifier.productNo === productNo && item.stockIdentifier.exist)
      .map(presentInfo);
    const totals = {};
    result.forEach((item) => {
      const type = item.stockIdentifier.type;
      if (!totals[type]) {
        totals[type] = {
          productNo,
          type,
          quantity: 0,
          unit: item.stockIdentifier.unit,
          category: info ? info.category : "",
          cName: info ? info.cName : "",
          whType: "內倉",
          safeQuantity: "10.00",
        };
      }
      totals[type].quantity += Number(item.stockIdentifier.quantity);
    });
    const productList = Object.keys(totals).map((type) => ({
      ...totals[type],
      quantity: totals[type].quantity.toFixed(2),
    }));
    const information = info
      ? {
          productNo: info.productNo,
          cName: info.cName,
          spec: info.spec,
          supp: info.supp,
          suppName: info.suppName,
          prodDesc: info.prodDesc,
          userField1: info.userField1,
          descrip: info.descrip,
          packDesc: info.packDesc,
          addType: info.addType,
          picture: info.picture,
          cCost: info.cCost,
          cCCCODE: info.cCCCODE,
          eNAME: info.eNAME,
          eSPEC: info.eSPEC,
        }
      : emptyInformation();
    return {
      nextProduct: index >= 0 && index < codes.length - 1 ? codes[index + 1] : null,
      prevProduct: index > 0 ? codes[index - 1] : null,
      result,
      information,
      productList,
    };
  }

  function emptyInformation() {
    return {
      productNo: null,
      cName: null,
      spec: null,
      supp: null,
      suppName: null,
      prodDesc: null,
      userField1: null,
      descrip: null,
      packDesc: null,
      addType: null,
      picture: null,
      cCost: null,
      cCCCODE: null,
      eNAME: null,
      eSPEC: null,
    };
  }

  function queryOrder(kind, orderNo) {
    const order = orders[kind] && orders[kind][orderNo];
    if (!order) {
      return { currentStatus: {}, waitHandleStatus: {} };
    }
    return {
      currentStatus: order.currentStatus,
      waitHandleStatus: waitHandle(order),
    };
  }

  function defectText(defect) {
    if (Array.isArray(defect)) {
      return defect
        .map((item) => (item && item.value) || "")
        .filter(Boolean)
        .join(",");
    }
    return defect || "";
  }

  function createStockInfoes(requests, editor) {
    const errors = {};
    (requests || []).forEach((request) => {
      if (!request.productNo) errors.productNo = "貨號不可空白";
      if (!request.type) errors.type = "型態不可空白";
      if (!request.quantity) errors.quantity = "長度不可空白";
    });
    if (Object.keys(errors).length) {
      const error = new Error("validation");
      error.status = 400;
      error.body = errors;
      throw error;
    }

    requests.forEach((request) => {
      const productNo = String(request.productNo).toUpperCase();
      const parent = request.parentId ? findInfoByIdentifier(request.parentId) : null;
      const created = makeInfo({
        productNo,
        lotNo: request.lotNo || "",
        type: request.type,
        quantity: String(request.quantity),
        unit: request.unit || "",
        color: request.color,
        defect: defectText(request.defect),
        record: request.record || "",
        remark: request.remark || "",
        inStockType: IN_STOCK_LABEL[request.inStockType] || request.inStockType || "",
        firstInStockAt: parent ? parent.stockIdentifier.firstInStockAt : today(),
        exist: !request.directShip,
        eliminateType: request.directShip ? "0" : null,
        eliminateDate: request.directShip ? today() : null,
        eliminateReason: request.directShip ? request.outStockReason || "" : null,
        orderType: request.inStockType,
        orderNo: request.orderNo,
        parentId: request.parentId,
      });
      if (request.orderNo && request.inStockType && request.inStockType !== "shrink") {
        receive(request.inStockType, request.orderNo, productNo, request.type, request.quantity);
      }
      if (!catalog[productNo]) {
        catalog[productNo] = productInfo(productNo, {
          cName: productNo,
          spec: "無資料",
          supp: "",
          suppName: "無資料",
          prodDesc: "無資料",
          userField1: "無資料",
          descrip: "無資料",
          packDesc: "無資料",
          addType: "無",
          cCost: "無資料",
          cCCCODE: "無資料",
          eNAME: productNo,
          eSPEC: "無資料",
          category: "未分類",
        });
      }
      created.stockIdentifier.createdBy = editor;
    });
  }

  function rollbackInStock(idList) {
    (idList || []).forEach((identifierId) => {
      const info = findInfoByIdentifier(identifierId);
      if (!info) {
        return;
      }
      const record = inStockRecords.find((item) => item.stockIdentifierId === info.stockIdentifier.id);
      if (record && info.stockIdentifier.exist) {
        receive(record.orderType, record.orderNo, record.productNo, record.type, -Number(info.stockIdentifier.quantity));
      }
      info.stockIdentifier.exist = false;
      info.stockIdentifier.eliminateType = "0";
      info.stockIdentifier.eliminateReason = "入庫回朔";
      info.stockIdentifier.eliminateDate = today();
    });
  }

  function inStockRollbackList(orderType, orderNo) {
    const result = {};
    inStockRecords
      .filter((record) => record.orderType === orderType && record.orderNo === orderNo)
      .forEach((record) => {
        const info = findInfoByIdentifier(record.stockIdentifierId);
        if (!info) {
          return;
        }
        result[record.productNo] = result[record.productNo] || [];
        result[record.productNo].push(presentInfo(info));
      });
    return result;
  }

  function updateStock(request, editor) {
    const info = findInfo(request.id);
    if (!info) {
      const error = new Error("missing");
      error.status = 400;
      throw error;
    }
    info.color = Number(request.color);
    info.defect = request.defect || "";
    info.record = request.record || "";
    info.remark = request.remark || "";
    info.stockIdentifier.updatedBy = editor;
    return info.stockIdentifier.productNo;
  }

  function shipOne(identifierId, reason, editor) {
    const info = findInfoByIdentifier(identifierId);
    if (!info) {
      const error = new Error("missing");
      error.status = 400;
      throw error;
    }
    if (!reason) {
      const error = new Error("validation");
      error.status = 400;
      error.body = { reason: "原因不可空白" };
      throw error;
    }
    info.stockIdentifier.exist = false;
    info.stockIdentifier.eliminateType = "0";
    info.stockIdentifier.eliminateReason = reason;
    info.stockIdentifier.eliminateDate = today();
    info.stockIdentifier.outStock = true;
    info.stockIdentifier.updatedBy = editor;
  }

  function unship(identifierId) {
    const info = findInfoByIdentifier(identifierId);
    if (!info) {
      const error = new Error("missing");
      error.status = 400;
      throw error;
    }
    info.stockIdentifier.exist = true;
    info.stockIdentifier.eliminateType = null;
    info.stockIdentifier.eliminateReason = null;
    info.stockIdentifier.eliminateDate = null;
    info.stockIdentifier.outStock = false;
  }

  function markWaitToShrink(identifierId, editor) {
    const info = findInfoByIdentifier(identifierId);
    if (!info || !info.stockIdentifier.exist) {
      const error = new Error("missing");
      error.status = 400;
      throw error;
    }
    info.stockIdentifier.waitToShrink = true;
    addOutStock({
      productNo: info.stockIdentifier.productNo,
      lotNo: info.stockIdentifier.lotNo,
      type: info.stockIdentifier.type,
      quantity: info.stockIdentifier.quantity,
      unit: info.stockIdentifier.unit,
      color: info.color,
      defect: info.defect,
      reason: info.stockIdentifier.type === "雜項" ? "分裝" : "減肥",
      outStockType: 1,
      stockIdentifierId: info.stockIdentifier.id,
      createdBy: editor,
      handled: false,
    });
    return info.stockIdentifier.productNo;
  }

  function cancelWaitToShrink(identifierId, editor) {
    const info = findInfoByIdentifier(identifierId);
    if (!info) {
      const error = new Error("missing");
      error.status = 400;
      throw error;
    }
    info.stockIdentifier.waitToShrink = false;
    const request = outStockRequests.find(
      (item) => item.stockIdentifierId === info.stockIdentifier.id && !item.deleted && item.outStockType === 1
    );
    if (request) {
      request.deleted = true;
      request.updatedBy = editor;
      request.updatedAt = new Date().toISOString();
    }
  }

  function shrink(request, editor) {
    const info = findInfoByIdentifier(request.oldStockIdentifierId);
    if (!info) {
      const error = new Error("missing");
      error.status = 400;
      throw error;
    }
    info.stockIdentifier.exist = false;
    info.stockIdentifier.waitToShrink = false;
    info.stockIdentifier.eliminateType = "1";
    info.stockIdentifier.eliminateReason = "減肥";
    info.stockIdentifier.eliminateDate = today();
    info.stockIdentifier.adjustment =
      request.adjustment === undefined || request.adjustment === null
        ? null
        : Number(request.adjustment).toFixed(2);
    info.stockIdentifier.updatedBy = editor;
    const linked = outStockRequests.find(
      (item) => item.stockIdentifierId === info.stockIdentifier.id && !item.deleted
    );
    if (linked) {
      linked.deleted = true;
      linked.updatedBy = editor;
    }
    createStockInfoes(request.inStockRequests || [], editor);
  }

  function shrinkRollbackList(productNo) {
    return stockInfos
      .filter(
        (info) =>
          info.stockIdentifier.productNo === String(productNo || "").toUpperCase() &&
          info.stockIdentifier.eliminateType === "1"
      )
      .map((info) => ({ stockInfo: presentInfo(info), nodes: [] }));
  }

  function shrinkRollback(identifierId) {
    const info = findInfoByIdentifier(identifierId);
    if (!info) {
      const error = new Error("missing");
      error.status = 400;
      throw error;
    }
    info.stockIdentifier.exist = true;
    info.stockIdentifier.eliminateType = null;
    info.stockIdentifier.eliminateReason = null;
    info.stockIdentifier.eliminateDate = null;
    info.stockIdentifier.adjustment = null;
    const childIds = childrenOf[info.stockIdentifier.id] || [];
    childIds.forEach((childId) => {
      const child = findInfoByIdentifier(childId);
      if (child) {
        child.stockIdentifier.exist = false;
        child.stockIdentifier.eliminateReason = "減肥回朔";
      }
    });
  }

  function buildTree(identifierId) {
    const info = findInfoByIdentifier(identifierId);
    if (!info) {
      return null;
    }
    const children = (childrenOf[identifierId] || [])
      .map((childId) => buildTree(childId))
      .filter(Boolean);
    return { stockInfo: presentInfo(info), nodes: children };
  }

  function history(productNo, start, end) {
    const code = String(productNo || "").toUpperCase();
    const range = clientDates(start, end);
    return stockInfos
      .filter((info) => {
        const identifier = info.stockIdentifier;
        if (identifier.productNo !== code) return false;
        if (identifier.inStockType === "減肥") return false;
        if (!range) return true;
        return identifier.createdAt >= range.start && identifier.createdAt <= range.end;
      })
      .map((info) => buildTree(info.stockIdentifier.id))
      .filter(Boolean);
  }

  function addOutStock(input) {
    const request = {
      id: id(),
      productNo: input.productNo,
      lotNo: input.lotNo || "",
      type: input.type || "",
      quantity: input.quantity || "",
      unit: input.unit || "",
      color: Number(input.color || 0),
      defect: input.defect || "",
      reason: input.reason || "",
      outStockType: input.outStockType,
      stockIdentifierId: Number(input.stockIdentifierId || 0),
      fileName: input.fileName || null,
      handled: Boolean(input.handled),
      deleted: false,
      requestFrom: input.requestFrom || null,
      createdAt: input.createdAt || new Date().toISOString(),
      updatedAt: null,
      createdBy: input.createdBy || "",
      updatedBy: null,
    };
    outStockRequests.push(request);
    return request;
  }

  function createOutStock(body, editor) {
    return presentOutStock(
      addOutStock({
        ...body,
        outStockType: 2,
        createdBy: editor,
        handled: false,
      })
    );
  }

  function deleteOutStock(requestId, editor) {
    const request = outStockRequests.find((item) => item.id === Number(requestId));
    if (!request) {
      const error = new Error("missing");
      error.status = 400;
      throw error;
    }
    request.deleted = true;
    request.updatedBy = editor;
    request.updatedAt = new Date().toISOString();
  }

  function activeOutStock() {
    return outStockRequests.filter((item) => !item.deleted);
  }

  function handleList(dates) {
    const queryResult = {};
    const usersInList = new Set();
    dates.forEach((date) => {
      const rows = activeOutStock().filter((item) => item.createdAt.slice(0, 10) === date);
      rows.forEach((item) => usersInList.add(item.createdBy));
      queryResult[date] = rows.map(presentOutStock);
    });
    return { userList: Array.from(usersInList), queryResult };
  }

  function updateOutStock(body, editor) {
    const updates = (body && body.outStockUpdate) || {};
    const fileName = `OutStockList-${stamp()}.xls`;
    const touched = [];
    Object.keys(updates).forEach((key) => {
      const request = outStockRequests.find((item) => item.id === Number(key) && !item.deleted);
      if (!request) {
        const error = new Error("missing");
        error.status = 400;
        throw error;
      }
      request.requestFrom = updates[key];
      request.handled = true;
      request.fileName = fileName;
      request.updatedBy = editor;
      request.updatedAt = new Date().toISOString();
      touched.push(request);
    });
    if (!files.outStockList.includes(fileName)) {
      files.outStockList.push(fileName);
    }
    return touched;
  }

  function categories() {
    const values = Array.from(new Set(Object.values(catalog).map((item) => item.category)));
    return values.map((category) => ({ label: category, value: category }));
  }

  function fileNames(category, start, end) {
    const names = files[category] || [];
    if (!start) {
      const prefixDate = yyyymmdd(today());
      const todayName = names.find((name) => name.includes(prefixDate));
      return todayName || null;
    }
    const range = clientDates(start, end);
    const matched = names.filter((name) => {
      const digits = name.match(/(\d{8})/);
      if (!digits) return true;
      const iso = `${digits[1].slice(0, 4)}-${digits[1].slice(4, 6)}-${digits[1].slice(6, 8)}`;
      return iso >= range.start && iso <= range.end;
    });
    return matched;
  }

  function fileBody(category, fileName) {
    const lines = ["貨號,型態,數量,單位,備註", `MOCK,${category},${fileName},UI review,此檔由 mock backend 產生`];
    return Buffer.from(lines.join("\n"), "utf8");
  }

  function rememberFile(category, fileName) {
    files[category] = files[category] || [];
    if (!files[category].includes(fileName)) {
      files[category].push(fileName);
    }
  }

  function categoryFiles() {
    return files.categoryDetail.map((name) => {
      const category = name.replace(/^CategoryDetail-/, "").replace(/\.xls$/, "");
      return { label: category, value: category };
    });
  }

  function publicUsers() {
    return users.map((user) => ({
      employeeId: user.employeeId,
      fullName: user.fullName,
      role: ROLE_LABEL[user.role] || "ERROR",
    }));
  }

  function findUser(employeeId) {
    return users.find((user) => user.employeeId === employeeId);
  }

  function registerUser(body) {
    if (users.some((user) => user.employeeId === body.employeeId)) {
      const error = new Error("exists");
      error.status = 400;
      error.body = { success: false, message: "EmployeeId is already exists!" };
      throw error;
    }
    if (!ROLE_LABEL[body.role]) {
      const error = new Error("role");
      error.status = 400;
      error.body = { success: false, message: "Role setting error" };
      throw error;
    }
    users.push({
      id: id(),
      employeeId: body.employeeId,
      password: body.password,
      fullName: body.fullName,
      role: body.role,
    });
  }

  function updateUser(body) {
    const user = findUser(body.employeeId);
    if (!user || (body.role && !ROLE_LABEL[body.role])) {
      const error = new Error("bad user");
      error.status = 400;
      throw error;
    }
    if (body.newPassword) user.password = body.newPassword;
    if (body.fullName) user.fullName = body.fullName;
    if (body.role) user.role = body.role;
  }

  function deleteUser(employeeId) {
    const index = users.findIndex((user) => user.employeeId === employeeId);
    if (index < 0) {
      const error = new Error("missing user");
      error.status = 400;
      throw error;
    }
    users.splice(index, 1);
  }

  return {
    users,
    findUser,
    publicUsers,
    registerUser,
    updateUser,
    deleteUser,
    queryProduct,
    queryOrder,
    outStockToStore,
    createStockInfoes,
    rollbackInStock,
    inStockRollbackList,
    updateStock,
    shipOne,
    unship,
    markWaitToShrink,
    cancelWaitToShrink,
    shrinkList: () =>
      stockInfos.filter((info) => info.stockIdentifier.waitToShrink && info.stockIdentifier.exist).map(presentInfo),
    shrink,
    shrinkRollbackList,
    shrinkRollback,
    history,
    createOutStock,
    deleteOutStock,
    handleList,
    updateOutStock,
    categories,
    fileNames,
    fileBody,
    rememberFile,
    categoryFiles,
    today,
  };
}

function clientDates(start, end) {
  if (!start || !end) return null;
  const startDate = new Date(`${start}Z`);
  const endDate = new Date(`${end}Z`);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return { start: String(start).slice(0, 10), end: String(end).slice(0, 10) };
  }
  startDate.setTime(startDate.getTime() + 8 * 60 * 60 * 1000);
  endDate.setTime(endDate.getTime() + 8 * 60 * 60 * 1000);
  return { start: isoDate(startDate), end: isoDate(endDate) };
}

module.exports = { createStore, clientDates, isoDate };
