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

`java-patches/` 裡的修補依檔名順序套用。檔名的編號是遷移時整理的 Java 缺陷清單的項目編號（那份清單沒有納入版本控制）；每個修補修了什麼，以下表為準：

| 修補 | 修正 | 改變的測試 |
|---|---|---|
| `history-routes.patch` | 第 1 項：history 兩個 mapping 以 `params` 區分，不再一律 500 | history 相關測試、`test_auth_matrix` 的 history 路由 |
| `02-history-children-blob.patch` | 第 2 項：`history.childrenIdentifierId` 對應成 `BLOB`（只影響新建的 schema；既有資料庫要靠 migration，見下方「部署注意：history 子項欄位」） | `test_shrink_stock_child_limit`（測試自己設定欄位型別，見其 docstring） |
| `03-instock-rollback-atomic.patch` | 第 3 項：入庫回滾任何一個 id 失敗就整筆回滾、回 400 | `test_in_stock_rollback`、`test_in_stock_rollback_partial_failure` |
| `04-shrink-rollback-atomic.patch` | 第 4 項：減肥回滾任何一步失敗（重複減肥、沒減肥過、範本遺失）就整筆回滾、回 400；重建報表前先確認兩份範本都能解析 | `test_shrink_stock_rollback`、`test_shrink_rollback_after_double_shrink`、`test_shrink_rollback_template_missing_keeps_reports`、`test_shrink_rollback_adjustment_template_missing` |
| `05-pull-list-append-same-second.patch` | 第 5 項：同一秒已有拉貨單時附加在後面，不再用範本覆寫（檔名格式不變） | `test_out_stock_update_twice_in_one_second` |
| `06-stock-compare-write-after-compare.patch` | 第 6 項：每日比對先算完才重設當天報表；比對失敗保留舊報表，寫入失敗回 400 | `test_daily_stock_compare_failure_resets_todays_report`（用不是數字的數量讓比對失敗；NULL 數量在第 7 項之後不再失敗） |
| `07-stock-compare-null-quantity.patch` | 第 7 項：WMS 數量為 NULL 而 ERP 有對應時寫一列 Fail（WMS 數量、差異留空），不再讓整次比對失敗 | `test_daily_stock_compare_null_quantity_with_erp_match` |
| `08-shrink-report-failure-keeps-shrink.patch` | 第 8 項：減肥寫報表失敗（任何例外，包括 POI 對空檔或壞檔丟的 RuntimeException）時減肥照樣成立、回 200，報表失敗只記 log；兩份報表各自寫入 | `test_shrink_stock_report_template_missing`、`test_shrink_stock_template_missing_with_todays_report`、`test_shrink_stock_allocation_template_missing`、`test_shrink_stock_allocation_template_empty` |
| `09-import-skip-blank-rows.patch` | 第 9 項：進貨匯入略過沒有任何文字的列，不再整個檔案被略過 | `test_import_cell_existence`、`test_import_trailing_rows_without_cells`、`test_import_blank_rows_between_data` |
| `10-category-detail-missing-erp-product.patch` | 第 10 項：類別明細裡 ERP 查不到的商品，商品資訊欄留空，不再讓整份報表失敗（原本還會留下 0 byte 的報表檔） | `test_category_detail_report_product_missing_in_erp` |
| `11-history-tree-stockinfo-all-nodes.patch` | 第 11 項：history 樹的每個節點都帶出 stockInfo，不再只有查詢起日之後建立的卷才有（區間仍只用來挑選要回傳的樹） | `test_history_tree_start_boundary` |
| `12-missing-field-message.patch` | 第 12 項：`shrinkStock` 缺 `inStockRequests`、`outStock/update` 缺 `outStockUpdate` 時，400 附上 `{欄位: 訊息}`；拉貨單在檢查之後才建立 | `test_shrink_stock_without_pieces_field`、`test_out_stock_update_without_map` |

Python 版跟著修補版 Java 走：上表的測試在 Python 上比對 `.fixed.json`。

注意第 4 項：回滾時，當天的報表在資料庫 commit 之前就重建。兩份範本會先解析，任何一份遺失或損壞時，兩份報表都不會被動到（`test_shrink_rollback_adjustment_template_missing`）。但如果寫入報表本身中途失敗（例如檔案被 Excel 開著），或資料庫 commit 失敗，資料庫會整筆回滾，已經改寫的報表卻不會還原。Java 修補版也是這樣。

重錄步驟：

```bash
./java-patches/build-patched-jar.sh          # 在暫存目錄套修補並建 runtime/wmstool-fixed.jar，不動 repo 的 wmstool/
docker compose -f docker-compose.yml -f docker-compose.java-fixed.yml up -d --wait
.venv/bin/pytest -q -k "<上表改到的測試>" --update-golden --golden-variant fixed
docker compose up -d --wait                  # 換回原版 Java
```

不要用 `-m java_bug` 全部重錄：日後新增、但還沒修補的缺陷會多出一份跟 `.json` 相同的 `.fixed.json`，看起來像已修好。

確認修補版 Java 沒有改到其他行為：對修補版跑整套並比對原版的 golden（`--golden-variant java`），失敗的應該只有上表的測試。

## 切換方式（2026-11-13 決定：不並行，直接切換）

- 切換後 Python 版只寫 `.xlsx`；正式機既有的 `.xls` 報表**不轉換**，Python 版的查詢（today／interval／categoryList）與下載同時認得 `.xls` 與 `.xlsx`，兩者並存時以 `.xlsx` 為準（`test_legacy_xls_reports_remain_usable`）。
- `shrinkStock` 的調撥／調整報表在資料庫 commit 之後才寫，兩份各自寫入。寫入失敗（例如範本遺失、當天報表被 Excel 開著）時減肥照樣成立、回 200（Java 原本回 400，見第 8 項修補）；log 會記下需要人工補寫的報表（`test_shrink_stock_report_template_missing`）。**切換後請監看這類 log**，因為使用者不會在畫面上看到報表沒寫成。

## 部署注意：history 子項欄位

`history.childrenIdentifierId` 存的是 Java 序列化的 `Long[]`：有 n 個子項（n ≥ 1）時是 106 + 14n bytes，空陣列是 42 bytes。Hibernate 預設建成 `TINYBLOB`（255 bytes），一卷最多只能切 10 塊（246 bytes）；Python 版的 Alembic migration `0002` 把它改成 `BLOB`（約 4,600 個子項）。序列化格式不變，既有資料不用轉換，切回 Java 也能直接讀寫。

### 切換順序

Python 容器每次啟動都會先執行 `alembic upgrade head`（見 `wmstool-py/Dockerfile`），所以**第一次啟動 Python 容器時就會套用 `0002`**。照這個順序做：

1. **停掉 Java 服務。** `0002` 是 `ALTER TABLE history MODIFY childrenIdentifierId BLOB`。MySQL 只能用複製整張表的方式改這個欄位型別（`ALGORITHM=COPY`），執行期間 `history` 可以讀、**不能寫**，表越大花的時間越長。Java 停機後再改，就不會有寫入被卡住。
2. **檢查有沒有被截斷的資料**（只讀，見下一節），有的話先記下修復語句。
3. **標記既有資料庫的版本**：在啟動 Python 容器**之前**，對正式資料庫執行 `alembic stamp 0001`，讓 Alembic 知道 baseline 已經存在（baseline 用的是 `CREATE TABLE IF NOT EXISTS`，不 stamp 也不會毀掉資料，但版本紀錄應該從 0001 開始）。
4. **啟動 Python 容器**：它會自動執行 `alembic upgrade head`，套用 `0002`。
5. **執行第 2 步記下的修復語句**（必須在 `0002` 之後：修好的值會超過 255 bytes），再跑一次檢查，確認全部讀得回來。

`0002` 的 downgrade 在有超過 255 bytes 的資料時會拒絕執行，避免截斷資料。

### 檢查與修復被截斷的資料

正式機若不是 strict mode，切出第 11 塊時，MySQL 不會報錯，而是把整串子項清單截成剛好 255 bytes（已在 MySQL 8.0 實測）。這種值 Java 和 Python 都無法反序列化，之後對那一卷的回滾、history 查詢都會失敗。

用 wmstool-py 的檢查工具掃整張表（只讀，不會修改資料）：

```bash
python -m app.history_check "mysql+pymysql://<user>:<password>@<host>/wms?charset=utf8mb4"
```

全部正常時印出 `every history row reads back`、結束代碼 0。有問題的列會印出：

- 宣告的子項數量，以及還讀得出來的子項 id。截成 255 bytes 的值仍完整保留子項總數和前 10 個子項，只少了第 11 個以後的。
- 缺少子項的候選：同貨號、同批號、而且 `stockIdentifierId` 大於最後一個已知子項的 SKI（減肥入庫）交易紀錄，依 id 排序取缺少的數量。
- 候選數量剛好等於缺少的數量時，印出修復用的 `UPDATE history SET childrenIdentifierId = 0x… WHERE id = …;`。

候選只是推測，執行 `UPDATE` 之前要逐筆確認它們真的是那一次減肥切出來的：例如它們的 SKI 紀錄時間，要跟該卷的 SKO（減肥出庫）紀錄時間幾乎相同；而且同貨號同批號在那段時間沒有別的減肥。找不到候選或數量不符時，工具不會印出 `UPDATE`，要依交易紀錄人工判斷。

## 部署注意：報表範本

Python 版讀 `.xlsx` 範本。正式機 `D:/OutputFiles` 下的 4 個範本（`OutStockList/OutStockListTemplate`、`STKADST/StockAdjustRecordTemplate`、`STKALLT/StockAllocateRecordTemplate`、`StockComparisonResult/StockComparisonResultTemplate`）需轉成 `.xlsx` 並放在原位置：

```bash
soffice --headless --convert-to xlsx --outdir <同一個資料夾> <範本>.xls
```

第一筆資料寫在哪一列、序號從幾開始，取決於範本的「最後一列」。Java（POI `getLastRowNum`）會把表頭下方只有格式的列也算進去，包括框線空格和只調過列高的列。Python 的 `app.xlsx.poi_last_row` 直接讀工作表 XML，每個 `<row>` 都算，跟 POI 一樣；報表寫入和進貨匯入共用這一套規則。`test_reports_from_formatted_templates` 用 `fixtures/formatted-templates/` 驗證這一點：`.xls` 由 `scripts/make_formatted_templates.py` 產生，`.xlsx` 由 `scripts/convert_templates.sh`（在容器內跑 LibreOffice）轉出。

fixture 轉檔時用的是 LibreOffice 25.2.3.2，環境是 Debian 13（trixie）的 `libreoffice-calc-nogui 4:25.2.3-2+deb13u9`（arm64），base image 是 `python:3.12-slim@sha256:cb7e7f6d…`。腳本固定使用這個 image；Debian 的安全更新會換掉套件，所以套件版本無法鎖死，但腳本會檢查裝到的 LibreOffice 必須是 25.2.3，不是就停下。正式範本最好也用同一版轉檔；版本不同時，轉完務必跑下面的 `app.template_check`。

轉換正式範本之後，在部署機上執行檢查（需要 `pip install "wmstool-py[tools]"`）：

```bash
python -m app.template_check D:/OutputFiles
```

它會逐一比對每個 `*Template.xls` 和旁邊轉出的 `.xlsx`：`.xls` 那一邊用 xlrd 模擬 HSSF 的最後一列，`.xlsx` 那一邊用服務本身的 `poi_last_row`。全部 `OK` 才回 0；如果出現 `MISMATCH` 或 `MISSING .xlsx`，代表第一筆資料列和序號會跟 Java 錯開，要先修正 `.xlsx` 範本再切換。如果範本下方有預先格式化的空列，資料會寫在那些列之後；Java 也是這樣。

`.xls` 那一邊是用 xlrd 模擬 HSSF，已經對 POI 4.1.0 驗證過一般列、只有格式的列和合併儲存格這幾種情況，但終究不是 POI 本身。所以檢查通過後，第一次切換時仍請把 Java 和 Python 各產生的一份報表打開比對，確認第一筆資料列和序號相同。

## 標記 `java_bug` 的測試

golden file 忠實記錄了 Java 版的缺陷。重寫版可以修正，但要**刻意**重錄該 golden file：

- `GET /api/stock/queryStock/history/{productNo}` 與 `GET /api/stock/queryStock/history/{id}` 是同一條路由，Spring 對所有請求回 500（`Ambiguous handler methods`）。前端「歷史記錄查詢」因此無法使用。
- `history.childrenIdentifierId` 是存在 `tinyblob` 的 Java 序列化 `Long[]`（106 + 14n bytes）：一卷最多 10 個子項，第 11 個讓整個減肥請求失敗（400，交易回滾）。正式機若非 strict mode，則可能是靜默截斷。Python 版以 migration `0002` 改成 `BLOB`（見「部署注意：history 子項欄位」）。

## 已知限制

- `categorydetail`、`salerecords` 在正式環境的真實定義（表或 view）不在 repo，這裡用表模擬。
- 正式 Excel 範本不在 repo。`scripts/make_templates.py` 只產生有表頭的最小版本；`fixtures/formatted-templates/` 模擬表頭下方有格式列的手工範本。報表內容比對的是 Java 寫入的資料列。
- 對照測試只比對 `CategoryDetail` 報表的格子，不比對插入的圖片本身；圖片會原樣嵌入，由 wmstool-py 的單元測試確認。
