"""Helper scripts used at cutover. These run on the host; no backend is involved."""

import pathlib
import subprocess

SCRIPT = pathlib.Path(__file__).resolve().parents[1] / "scripts" / "convert_templates.sh"


def test_convert_templates_only_selects_templates(tmp_path):
    """Pointed at the production report folder, the script must convert the templates
    only. Converting a generated report would put a .xlsx next to it, and downloads
    prefer the .xlsx over the .xls of the same name."""
    files = [
        "OutStockList/OutStockListTemplate.xls",
        "OutStockList/2026/11/OutStockList-20261113101500.xls",
        "STKALLT/StockAllocateRecordTemplate.xls",
        "STKALLT/StockAllocateRecord-20261113.xls",
        "STKADST/StockAdjustRecordTemplate.xls",
        "StockComparisonResult/StockComparisonResultTemplate.xls",
        "StockComparisonResult/StockComparisonResult-20261113.xls",
        "StockComparisonResult/StockComparisonResultTemplate.xlsx",
    ]
    for rel in files:
        (tmp_path / rel).parent.mkdir(parents=True, exist_ok=True)
        (tmp_path / rel).write_bytes(b"")

    result = subprocess.run(["sh", str(SCRIPT), "--list", str(tmp_path)],
                            capture_output=True, text=True, check=True)

    assert result.stdout.splitlines() == [
        "OutStockList/OutStockListTemplate.xls",
        "STKADST/StockAdjustRecordTemplate.xls",
        "STKALLT/StockAllocateRecordTemplate.xls",
        "StockComparisonResult/StockComparisonResultTemplate.xls",
    ]
