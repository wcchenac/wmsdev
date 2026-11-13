const express = require("express");
const multer = require("multer");
const { createStore, clientDates, isoDate } = require("./store");
const { signToken, readToken, invalidLogin } = require("./auth");

const PORT = Number(process.env.PORT || 8080);
const store = createStore();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

const OPS = ["ROLE_Operator", "ROLE_Admin"];
const ADMIN = ["ROLE_Admin"];
const STOCK_READ = ["ROLE_Normal", "ROLE_Sales", "ROLE_Operator", "ROLE_Admin"];
const STOCK_DETAIL = ["ROLE_Sales", "ROLE_Operator", "ROLE_Admin"];
const IN_STOCK = ["ROLE_Normal", "ROLE_Operator", "ROLE_Admin"];

function sendError(res, error) {
  const status = error.status || 500;
  if (error.body) {
    res.status(status).json(error.body);
    return;
  }
  res.status(status).end();
}

function guard(roles) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json(invalidLogin());
      return;
    }
    if (roles && !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: "Access is denied" });
      return;
    }
    next();
  };
}

function datesBetween(start, end) {
  const range = clientDates(start, end);
  const dates = [];
  const cursor = new Date(`${range.start}T00:00:00Z`);
  const last = new Date(`${range.end}T00:00:00Z`);
  while (cursor <= last) {
    dates.push(isoDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "wms-mock" });
  });

  app.use("/api", (req, res, next) => {
    if (req.method === "POST" && req.path === "/user/login") {
      next();
      return;
    }
    const payload = readToken(req.headers.authorization);
    req.user = payload ? store.findUser(payload.employeeId) : null;
    if (req.user && String(req.user.id) !== String(payload.id)) {
      req.user = null;
    }
    next();
  });

  app.post("/api/user/login", (req, res) => {
    const body = req.body || {};
    const user = store.findUser(body.employeeId);
    if (!user || user.password !== body.password) {
      res.status(401).json(invalidLogin());
      return;
    }
    const token = signToken(user);
    res.json({ accessToken: `Bearer ${token}`, tokenType: "Bearer " });
  });

  app.post("/api/user/adminManagement/user/register", guard(ADMIN), (req, res) => {
    try {
      store.registerUser(req.body || {});
      res.status(201).type("text/plain").send("Success");
    } catch (error) {
      sendError(res, error);
    }
  });

  app.get("/api/user/adminManagement/user/userList", guard(ADMIN), (req, res) => {
    res.json(store.publicUsers());
  });

  app.patch("/api/user/adminManagement/user/update", guard(ADMIN), (req, res) => {
    try {
      store.updateUser(req.body || {});
      res.status(200).end();
    } catch (error) {
      sendError(res, error);
    }
  });

  app.delete("/api/user/adminManagement/user/delete", guard(ADMIN), (req, res) => {
    try {
      store.deleteUser(req.query.employeeId);
      res.status(200).end();
    } catch (error) {
      sendError(res, error);
    }
  });

  app.get("/api/stock/queryOrder/:orderType/:orderNo", guard(IN_STOCK), (req, res) => {
    const { orderType, orderNo } = req.params;
    if (orderType === "outStockToStore") {
      res.json(store.outStockToStore[orderNo] || []);
      return;
    }
    if (!["inStock", "assemble", "customerReturn", "storeReturn"].includes(orderType)) {
      res.status(400).end();
      return;
    }
    res.json(store.queryOrder(orderType, orderNo));
  });

  app.post("/api/stock/inStocks", guard(OPS), (req, res) => {
    try {
      store.createStockInfoes(req.body || [], req.user.fullName);
      res.status(200).end();
    } catch (error) {
      sendError(res, error);
    }
  });

  app.get("/api/stock/queryStock/inStockRollback", guard(ADMIN), (req, res) => {
    res.json(store.inStockRollbackList(req.query.orderType, req.query.orderNo));
  });

  app.patch("/api/stock/inStocks/rollback", guard(ADMIN), (req, res) => {
    try {
      store.rollbackInStock(req.body || []);
      res.status(200).end();
    } catch (error) {
      sendError(res, error);
    }
  });

  app.patch("/api/stock/updateStock", guard(OPS), (req, res) => {
    try {
      res.type("text/plain").send(store.updateStock(req.body || {}, req.user.fullName));
    } catch (error) {
      sendError(res, error);
    }
  });

  app.get("/api/stock/queryStock/query/2/:productNo", guard(STOCK_READ), (req, res) => {
    res.json(store.queryProduct(req.params.productNo));
  });

  app.get("/api/stock/queryStock/query/1/:productNo", guard(STOCK_DETAIL), (req, res) => {
    res.json(store.queryProduct(req.params.productNo));
  });

  app.post("/api/stock/shrinkStock", guard(OPS), (req, res) => {
    try {
      store.shrink(req.body || {}, req.user.fullName);
      res.status(200).end();
    } catch (error) {
      sendError(res, error);
    }
  });

  app.patch("/api/stock/shrinkStock/rollback/:stockIdentifierId", guard(ADMIN), (req, res) => {
    try {
      store.shrinkRollback(req.params.stockIdentifierId);
      res.status(200).end();
    } catch (error) {
      sendError(res, error);
    }
  });

  app.get("/api/stock/queryStock/shrinkRollback/:productNo", guard(OPS), (req, res) => {
    res.json(store.shrinkRollbackList(req.params.productNo));
  });

  app.patch("/api/stock/shipStock", guard(OPS), (req, res) => {
    try {
      const body = req.body || {};
      store.shipOne(body.stockIdentifierId, body.reason, req.user.fullName);
      res.status(200).end();
    } catch (error) {
      sendError(res, error);
    }
  });

  app.patch("/api/stock/shipStocks", guard(OPS), (req, res) => {
    try {
      (req.body || []).forEach((request) => store.shipOne(request.stockIdentifierId, request.reason, req.user.fullName));
      res.status(200).end();
    } catch (error) {
      sendError(res, error);
    }
  });

  app.patch("/api/stock/shipStock/rollback/:stockIdentifierId", guard(OPS), (req, res) => {
    try {
      store.unship(req.params.stockIdentifierId);
      res.status(200).end();
    } catch (error) {
      sendError(res, error);
    }
  });

  app.get("/api/stock/queryStock/shrinkList", guard(OPS), (req, res) => {
    res.json(store.shrinkList());
  });

  app.patch("/api/stock/waitToShrink/:stockIdentifierId", guard(OPS), (req, res) => {
    try {
      res.type("text/plain").send(store.markWaitToShrink(req.params.stockIdentifierId, req.user.fullName));
    } catch (error) {
      sendError(res, error);
    }
  });

  app.patch("/api/stock/waitToShrink/rollback/:stockIdentifierId", guard(OPS), (req, res) => {
    try {
      store.cancelWaitToShrink(req.params.stockIdentifierId, req.user.fullName);
      res.status(200).end();
    } catch (error) {
      sendError(res, error);
    }
  });

  app.get("/api/stock/outStock/waitHandleList/basic", guard(OPS), (req, res) => {
    res.json(store.handleList([store.today()]));
  });

  app.get("/api/stock/outStock/waitHandleList/interval", guard(OPS), (req, res) => {
    res.json(store.handleList(datesBetween(req.query.startDate, req.query.endDate)));
  });

  app.post("/api/stock/outStock", guard(OPS), (req, res) => {
    res.json(store.createOutStock(req.body || {}, req.user.fullName));
  });

  app.patch("/api/stock/outStock/rollback/:outStockRequestId", guard(OPS), (req, res) => {
    try {
      store.deleteOutStock(req.params.outStockRequestId, req.user.fullName);
      res.status(200).end();
    } catch (error) {
      sendError(res, error);
    }
  });

  app.patch("/api/stock/outStock/update", guard(OPS), (req, res) => {
    try {
      store.updateOutStock(req.body || {}, req.user.fullName);
      res.status(200).end();
    } catch (error) {
      sendError(res, error);
    }
  });

  app.get("/api/stock/queryStock/history/:productNo", guard(STOCK_DETAIL), (req, res) => {
    if (req.query.startDate && req.query.endDate) {
      res.json(store.history(req.params.productNo, req.query.startDate, req.query.endDate));
      return;
    }
    if (req.query.id) {
      res.type("text/plain").send(`mock-history-root:${req.query.id}`);
      return;
    }
    res.status(400).end();
  });

  app.patch("/api/stock/queryStock/updateHistory", guard(ADMIN), (req, res) => {
    res.json({
      id: Number(req.query.id),
      childs: req.query.childs || "",
      note: "mock only; the current React client does not call this endpoint",
    });
  });

  app.get("/api/stock/stockManagement/:periodType/:fn", guard(ADMIN), (req, res) => {
    const known = {
      "daily/stockCompare": true,
      "weekly/syncProductCategory": true,
    };
    if (!known[`${req.params.periodType}/${req.params.fn}`]) {
      res.status(400).end();
      return;
    }
    res.status(200).end();
  });

  app.get("/api/stock/queryStock/categoryList", guard(ADMIN), (req, res) => {
    res.json(store.categories());
  });

  app.get("/api/stock/queryStock/category/:category", guard(ADMIN), (req, res) => {
    const fileName = `CategoryDetail-${req.params.category}.xls`;
    store.rememberFile("categoryDetail", fileName);
    res.status(200).end();
  });

  app.get("/api/file/download/:fileCategory/:fileName", guard(OPS), (req, res) => {
    const allowed = ["allocation", "adjustment", "outStockList", "dailyComparison", "categoryDetail"];
    if (!allowed.includes(req.params.fileCategory)) {
      res.status(400).end();
      return;
    }
    const fileName = req.params.fileName.endsWith(".xls") ? req.params.fileName : `${req.params.fileName}.xls`;
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.type("application/vnd.ms-excel").send(store.fileBody(req.params.fileCategory, fileName));
  });

  app.get("/api/file/query/:fileCategory/today", guard(OPS), (req, res) => {
    const allowed = ["allocation", "adjustment", "dailyComparison"];
    if (!allowed.includes(req.params.fileCategory)) {
      res.status(400).end();
      return;
    }
    res.type("text/plain").send(store.fileNames(req.params.fileCategory) || "File Not Found");
  });

  app.get("/api/file/query/:fileCategory/interval", guard(OPS), (req, res) => {
    const allowed = ["allocation", "adjustment", "dailyComparison"];
    if (!allowed.includes(req.params.fileCategory)) {
      res.status(400).end();
      return;
    }
    const names = store.fileNames(req.params.fileCategory, req.query.startDate, req.query.endDate);
    res.json(names.length ? names : ["File Not Found"]);
  });

  app.get("/api/file/query/categoryList", guard(OPS), (req, res) => {
    res.json(store.categoryFiles());
  });

  app.post("/api/file/import/inStockFile", guard(OPS), upload.array("files"), (req, res) => {
    if (!req.files || !req.files.length) {
      res.status(400).end();
      return;
    }
    res.status(200).end();
  });

  app.post("/api/file/import/setWHFile", guard(OPS), upload.array("files"), (req, res) => {
    if (!req.files || !req.files.length) {
      res.status(400).end();
      return;
    }
    res.status(200).end();
  });

  app.use("/api", (req, res) => {
    res.status(404).json({ success: false, message: `mock has no ${req.method} ${req.originalUrl}` });
  });

  return app;
}

if (require.main === module) {
  createApp().listen(PORT, "0.0.0.0", () => {
    console.log(`wms-mock listening on ${PORT}`);
  });
}

module.exports = { createApp };
