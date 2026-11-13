-- Fake ERP (SQL Server) for contract tests. Only the objects wmstool reads.
-- Real ERP objects are views; here they are tables with the same column ORDER,
-- because wmstool reads `SELECT *` results by position.
--
-- Code tables used by wmstool (StockServiceUtilities):
--   GWN  : AB=板卷, AC/AD/AE=整支, AP=雜項, anything else ignored
--   UNIT : index into {台,支,碼,尺,公斤,公尺,個,打,...}; 2=碼, 3=尺, 4=公斤, 6=個, 7=打

IF DB_ID('PILOT0010') IS NOT NULL
BEGIN
  ALTER DATABASE PILOT0010 SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
  DROP DATABASE PILOT0010;
END
GO
CREATE DATABASE PILOT0010 COLLATE Chinese_Taiwan_Stroke_CI_AS;
GO
USE PILOT0010;
GO

-- QueryStockFunction (basic mode): [CODE, CNAME, SPEC, DESCRIP, PACKDESC, ADDTYPE, PICTURE, CCCCODE, ENAME, ESPEC]
CREATE TABLE dbo.BasicProductInfo (
  CODE NVARCHAR(25), CNAME NVARCHAR(100), SPEC NVARCHAR(100), DESCRIP NVARCHAR(200),
  PACKDESC NVARCHAR(100), ADDTYPE INT, PICTURE NVARCHAR(100), CCCCODE NVARCHAR(30),
  ENAME NVARCHAR(100), ESPEC NVARCHAR(100)
);

-- QueryStockFunction (detail mode): index 12 (CLAS) is skipped by the reader.
-- [CODE, CNAME, SPEC, DESCRIP, SUPP, SUPPNAME, PRODDESC, USERFIELD1, PACKDESC, ADDTYPE, PICTURE, CCOST, CLAS, CCCCODE, ENAME, ESPEC]
CREATE TABLE dbo.ProductInfo (
  CODE NVARCHAR(25), CNAME NVARCHAR(100), SPEC NVARCHAR(100), DESCRIP NVARCHAR(200),
  SUPP NVARCHAR(20), SUPPNAME NVARCHAR(100), PRODDESC NVARCHAR(200), USERFIELD1 NVARCHAR(100),
  PACKDESC NVARCHAR(100), ADDTYPE INT, PICTURE NVARCHAR(100), CCOST NVARCHAR(20),
  CLAS NVARCHAR(50), CCCCODE NVARCHAR(30), ENAME NVARCHAR(100), ESPEC NVARCHAR(100)
);

-- CompareStockFunction.syncProductCategory: SELECT CODE, CLAS
-- ModifyStockFunction: SELECT UNIT WHERE CODE = ?
CREATE TABLE dbo.PRODUCT (CODE NVARCHAR(25), CLAS NVARCHAR(50), UNIT INT);

-- CompareStockFunction.stockFullyComparison: [PROD, GWN, CQTY, UNIT]
CREATE TABLE dbo.ProductCQTYUNIT (PROD NVARCHAR(25), GWN NVARCHAR(5), CQTY DECIMAL(12, 2), UNIT INT);

-- QueryOrderFunction: [PROD, QTY, UNIT, GWN, BANQTY] + filter column CODE
CREATE TABLE dbo.InstockOrder (
  PROD NVARCHAR(25), QTY DECIMAL(12, 2), UNIT INT, GWN NVARCHAR(5), BANQTY DECIMAL(12, 2), CODE NVARCHAR(30)
);
-- [PROD, GWN, QTY, UNIT] + CODE
CREATE TABLE dbo.AssembleOrder (PROD NVARCHAR(25), GWN NVARCHAR(5), QTY DECIMAL(12, 2), UNIT INT, CODE NVARCHAR(30));
-- [PROD, QTY, UNIT, GWN] + CODE
CREATE TABLE dbo.CustomerReturnOrder (PROD NVARCHAR(25), QTY DECIMAL(12, 2), UNIT INT, GWN NVARCHAR(5), CODE NVARCHAR(30));
CREATE TABLE dbo.StoreReturnOrder (PROD NVARCHAR(25), QTY DECIMAL(12, 2), UNIT INT, GWN NVARCHAR(5), CODE NVARCHAR(30));
-- [PROD, CNAME, CCCCODE, SPEC, PACKDESC] + OrderNo, SERIAL
CREATE TABLE dbo.OutStockToStoreOrder (
  PROD NVARCHAR(25), CNAME NVARCHAR(100), CCCCODE NVARCHAR(30), SPEC NVARCHAR(100), PACKDESC NVARCHAR(100),
  OrderNo NVARCHAR(30), SERIAL INT
);
GO

INSERT INTO dbo.BasicProductInfo VALUES
  (N'CF1001', N'精梳棉布', N'58吋', N'40支精梳', N'整支約50碼', 1, N'CF1001.jpg', N'5208.11', N'Combed Cotton', N'58in'),
  (N'CF1002', N'亞麻胚布', N'56吋', N'胚布未染', N'整支約40碼', 2, N'', N'5309.11', N'Linen Greige', N'56in'),
  (N'CF1003', N'彈性針織', N'60吋', N'四面彈', N'每卷約25公斤', 4, N'', N'6004.10', N'Stretch Knit', N'60in');

INSERT INTO dbo.ProductInfo VALUES
  (N'CF1001', N'精梳棉布', N'58吋', N'40支精梳', N'S001', N'大華紡織', N'棉布系列', N'夏季', N'整支約50碼', 1, N'CF1001.jpg', N'85', N'棉布', N'5208.11', N'Combed Cotton', N'58in'),
  (N'CF1002', N'亞麻胚布', N'56吋', N'胚布未染', N'S002', N'永信織造', N'麻布系列', N'', N'整支約40碼', 2, N'', N'120', N'麻布', N'5309.11', N'Linen Greige', N'56in'),
  (N'CF1003', N'彈性針織', N'60吋', N'四面彈', N'S001', N'大華紡織', N'針織系列', N'運動', N'每卷約25公斤', 4, N'', N'210', N'針織', N'6004.10', N'Stretch Knit', N'60in');

INSERT INTO dbo.PRODUCT VALUES
  (N'CF1001', N'棉布', 2),
  (N'CF1002', N'麻布', 2),
  (N'CF1003', N'針織', 4);

-- ERP-side on-hand quantities, compared against WMS Product table.
INSERT INTO dbo.ProductCQTYUNIT VALUES
  (N'CF1001', N'AB', 30.00, 2),
  (N'CF1001', N'AC', 100.00, 2),
  (N'CF1002', N'AC', 120.00, 3),   -- 尺 -> converted to 碼 (/3)
  (N'CF1003', N'AB', 25.50, 4),
  (N'CF1003', N'AP', 5.00, 4),     -- 雜項: ignored when leftover
  (N'CF9999', N'AB', 7.00, 2);     -- exists only in ERP

INSERT INTO dbo.InstockOrder VALUES
  (N'CF1001', 50.00, 2, N'AC', 0.00, N'IN2026110001'),
  (N'CF1001', 48.50, 2, N'AC', 1.50, N'IN2026110001'),
  (N'CF1001', 12.00, 2, N'AB', 0.00, N'IN2026110001'),
  (N'CF1002', 40.00, 2, N'AC', 0.00, N'IN2026110001'),
  (N'CF1003', 25.00, 4, N'AB', 0.00, N'IN2026110002');

INSERT INTO dbo.AssembleOrder VALUES
  (N'CF1002', N'AC', 38.00, 2, N'AS2026110001'),
  (N'CF1002', N'AB', 6.00, 2, N'AS2026110001');

INSERT INTO dbo.CustomerReturnOrder VALUES
  (N'CF1001', 8.00, 2, N'AB', N'CR2026110001');

INSERT INTO dbo.StoreReturnOrder VALUES
  (N'CF1003', 3.25, 4, N'AB', N'SR2026110001');

INSERT INTO dbo.OutStockToStoreOrder VALUES
  (N'CF1003', N'彈性針織', N'6004.10', N'60吋', N'每卷約25公斤', N'OS2026110001', 2),
  (N'CF1001', N'精梳棉布', N'5208.11', N'58吋', N'整支約50碼', N'OS2026110001', 1);
GO
