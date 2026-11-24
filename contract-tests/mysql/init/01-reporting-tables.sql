-- Tables the backend reads with native SQL but that are not JPA entities, so
-- Hibernate's hbm2ddl=update never creates them. In production they live in
-- the `wms` schema; their real definitions (table or view) are not in the repo.
-- Column order matters: the Java code reads them positionally.

USE wms;

-- QueryStockFunction.findCategoryDetails: SELECT * FROM wms.categorydetail WHERE category = ?
-- Row: [productNo, lotNo, type, quantity, unit, color, defect, remark, record, inStockType, firstStockAt, category]
CREATE TABLE IF NOT EXISTS categorydetail (
  productNo    VARCHAR(25)  NOT NULL,
  lotNo        VARCHAR(50)  NOT NULL,
  type         VARCHAR(10)  NOT NULL,
  quantity     VARCHAR(10)  NOT NULL,
  unit         VARCHAR(10)  NOT NULL,
  color        INT          NOT NULL,
  defect       VARCHAR(10)  NOT NULL,
  remark       VARCHAR(255) NOT NULL,
  record       VARCHAR(255) NOT NULL,
  inStockType  VARCHAR(20)  NOT NULL,
  firstStockAt VARCHAR(30)  NOT NULL,
  category     VARCHAR(50)  NOT NULL
) DEFAULT CHARSET = utf8mb4;

-- QueryStockFunction.summarySaleRecords: SELECT * FROM wms.salerecords WHERE category = ?
-- Row: [productNo, reason, quantity, unit, ...]
CREATE TABLE IF NOT EXISTS salerecords (
  productNo VARCHAR(25) NOT NULL,
  reason    VARCHAR(50) NOT NULL,
  quantity  VARCHAR(10) NOT NULL,
  unit      VARCHAR(10) NOT NULL,
  category  VARCHAR(50) NOT NULL
) DEFAULT CHARSET = utf8mb4;
