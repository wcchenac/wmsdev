# wmstool API 對照測試（contract tests）

這套測試只透過 HTTP、MySQL 與報表資料夾檢查後端，不依賴任何 Java 程式碼。
`snapshots/` 裡的 golden file 是從**現有 Java 版**錄下來的；Python 重寫版必須重現它們。

## 涵蓋範圍

38 個 endpoint 全部涵蓋（`/api/user` 5、`/api/stock` 28、`/api/file` 5），共 88 個測試：

| 檔案 | 內容 |
| --- | --- |
| `test_user.py` | 登入、JWT claim、註冊/列表/更新/刪除使用者 |
| `test_stock_query.py` | 單據查詢、貨號查詢、待減肥清單、待處理拉貨清單、歷史樹 |
| `test_stock_write.py` | 入庫（各種單別、單位換算、直出）、減肥與回滾、出貨與回滾、拉貨單 |
| `test_stock_admin.py` | ERP 庫存比對、類別同步、類別明細報表、history 結構 |
| `test_file.py` | 報表查詢/下載、Excel 匯入入庫 |
| `test_auth_matrix.py` | 37 個需授權 endpoint × 無 token / 每個無權角色 |

每個測試記錄：HTTP status 與 body、相關資料表的**完整列**（依 id 排序）、產生的 Excel 報表內容（逐格）。

## 環境

`docker-compose.yml` 啟動四個服務，**不連正式 ERP**：

| 服務 | 說明 | Host port |
| --- | --- | --- |
| `mysql` | MySQL 8，`lower_case_table_names=1`（模擬正式機 Windows 的大小寫不敏感） | 13306 |
| `erp` | SQL Server 2022，假 ERP（`PILOT0010`），種子資料在 `mssql/erp-seed.sql` | 11433 |
| `erp-seed` | 一次性，灌 ERP 種子資料 | – |
| `backend` | 受測後端；目前是 `wmstool/target/wmstool-0.1.9.jar`，設定在 `config/` | 18080 |

ERP 假資料表的**欄位順序**必須與正式 ERP view 相同：Java 用 `SELECT *` 再依位置讀欄位。

## 執行

```bash
cd contract-tests
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt

# 1. 建 jar（在 wmstool/）
(cd ../wmstool && mvn -q -DskipTests package)

# 2. Excel 範本（正式範本不在 repo，這裡產生最小可用版本）
.venv/bin/python scripts/make_templates.py runtime/files/excels

# 3. 起環境
docker compose up -d --wait

# 4. 比對
.venv/bin/pytest -q
```

重新錄製 golden file（只有在**刻意**改變行為時才做，並在 commit 說明原因）：

```bash
.venv/bin/pytest -q --update-golden
```

測試換到別的後端時，設定 `BASE_URL`、`DB_HOST`、`DB_PORT`、`CONTRACT_FILES_DIR` 即可。

## 正規化規則（哪些不算契約）

`tests/conftest.py` 的 `normalize()`：

- `createdAt` / `updatedAt` / `outStockAt`：值遮蔽，但**保留型態**。Java 把 `LocalDateTime` 輸出成陣列 `[y,M,d,h,m,s,nanos]`，golden 記為 `<datetime:array>`；Python 版若輸出字串會被抓到。
- 今天前後 15 天的日期字串 → `<TODAY…>` 等 token；`OutStockList-yyyyMMddHHmmss` 的時間部分 → `<HHmmss>`。
- JWT：解出 claim 比對，`iat`/`exp` 只比有效期長度（43200 秒）。
- Spring 預設錯誤 body：比 `status`/`error`/`path`；4xx 保留 `message`；5xx 的 `message` 是 Java 例外字串，遮蔽。
- `HandleListResponse.userList` 來自 HashSet，順序不算契約。
- MySQL `bit(1)` 轉成 bool；`history.childrenIdentifierId` 是 Java 序列化的 `Long[]`，解碼成數字陣列比對。
- **報表格式不算契約**（2026-11-13 決定 Python 版改寫 `.xlsx`）：`read_workbook()` 以相同方式讀 `.xls`（xlrd）與 `.xlsx`（openpyxl）——空格讀成 `""`、整數讀成 float、去掉每列尾端空格與尾端空列、merged 區域一律為 0-based 半開區間 `[rlo, rhi, clo, chi]`。字串中的 `.xls`／`.xlsx` 正規化為 `.<excel>`，Excel 的 MIME 正規化為 `<excel>`。
- `write_report()` 依受測後端寫 `.xls`（Java）或 `.xlsx`（Python）。`scripts/make_templates.py` 兩種範本都產生。

## Golden 變體（`.fixed.json`）

標了 `java_bug` 的測試，`<name>.json` 記錄 Java 原本（有缺陷）的行為。若同目錄有 `<name>.fixed.json`，它是從**套上最小修補的 Java**（`java-patches/`）錄的修正版行為：

- `--golden-variant auto`（預設）：後端是 Python 時比對 `.fixed.json`（存在的話），否則比對 `.json`。
- `--golden-variant fixed --update-golden`：對修補版 Java 錄製 `.fixed.json`。
- 防呆：`--update-golden` 對 Python 後端一律拒絕執行，golden 永遠來自 Java。

目前唯一的修補是 history 路由衝突（`java-patches/history-routes.patch`：兩個 mapping 以 `params` 區分）。重錄步驟：

```bash
./java-patches/build-patched-jar.sh          # 在暫存目錄套修補並建 jar，不動 repo 的 wmstool/
docker compose -f docker-compose.yml -f docker-compose.java-fixed.yml up -d --wait
.venv/bin/pytest -q -k "history and not update_history" --update-golden --golden-variant fixed
docker compose up -d --wait                  # 換回原版 Java
```

## 部署注意：報表範本

Python 版讀 `.xlsx` 範本。正式機 `D:/OutputFiles` 下的 4 個範本（`OutStockList/OutStockListTemplate`、`STKADST/StockAdjustRecordTemplate`、`STKALLT/StockAllocateRecordTemplate`、`StockComparisonResult/StockComparisonResultTemplate`）需轉成 `.xlsx` 並放在原位置：

```bash
soffice --headless --convert-to xlsx --outdir <同一個資料夾> <範本>.xls
```

## 標記 `java_bug` 的測試

golden file 忠實記錄了 Java 版的缺陷。重寫版可以修正，但要**刻意**重錄該 golden file：

- `GET /api/stock/queryStock/history/{productNo}` 與 `GET /api/stock/queryStock/history/{id}` 是同一條路由，Spring 對所有請求回 500（`Ambiguous handler methods`）。前端「歷史記錄查詢」因此無法使用。
- `history.childrenIdentifierId` 是存在 `tinyblob` 的 Java 序列化 `Long[]`（106 + 14n bytes）：一卷最多 10 個子項，第 11 個讓整個減肥請求失敗（400，交易回滾）。正式機若非 strict mode，則可能是靜默截斷。

## 已知限制

- `categorydetail`、`salerecords` 在正式環境的真實定義（表或 view）不在 repo，這裡用表模擬。
- 正式 Excel 範本不在 repo；`scripts/make_templates.py` 只產生有表頭的最小版本，報表內容比對的是 Java 寫入的資料列。
- `CategoryDetail` 報表的商品圖片路徑（`file.filePathForPictures`）在測試中為空，未涵蓋插圖。
