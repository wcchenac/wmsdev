"""Checks create_app() runs before the service accepts traffic.

They live here rather than in app.config because they need the report folders
(app.files.reports), which itself reads the settings.
"""

import os
import tempfile
from pathlib import Path

from app.config import Settings
from app.files.reports import REPORTS


def _writable(directory: Path) -> bool:
    """Create a file there, close it, delete it: the steps a report write takes.

    os.access only reads the permission bits, which a CIFS/SMB mount makes up on the
    client side. TemporaryFile is avoided too: without O_TMPFILE it deletes the file
    while it is still open, which a share may refuse even though the folder is fine.
    """
    try:
        fd, name = tempfile.mkstemp(dir=directory, prefix=".wms-write-check-")
    except OSError:
        return False
    os.close(fd)
    try:
        os.unlink(name)
    except OSError:
        return False  # reports replace their files, so the service must delete too
    return True


def _report_folders(excel: Path) -> list[Path]:
    """EXCEL_DIR itself and every folder already under the five report folders
    (<folder>/<year>/<month>). Nothing else under EXCEL_DIR is written, so a mount's
    lost+found or a read-only archive kept beside the reports is not checked. A
    report folder that does not exist yet is created under EXCEL_DIR when needed."""
    folders = [excel]
    for name in sorted({kind.folder for kind in REPORTS.values()}):
        root = excel / name
        if not root.is_dir():
            continue
        for current, dirs, _ in os.walk(root):
            dirs.sort()
            folders.append(Path(current))
    return folders


def check_directories(settings: Settings) -> None:
    """Fail at startup when the service user cannot use the report or photo folder.

    EXCEL_DIR holds the templates and every generated report, in folders that may
    have been copied from the Java host with their old owner: EXCEL_DIR and every
    report folder already under it must take a new file (the image runs as uid 1000).
    PICTURE_DIR is only read; it may be missing, as in Java, which checks each photo
    file and leaves the cell empty without one.
    """
    excel = Path(settings.excel_dir)
    if not excel.is_dir():
        raise RuntimeError(f"EXCEL_DIR {excel} does not exist or is not a directory")
    for folder in _report_folders(excel):
        if not _writable(folder):
            raise RuntimeError(f"EXCEL_DIR {folder} is not writable by uid {os.getuid()}")
    pictures = Path(settings.picture_dir)
    if pictures.is_dir() and not os.access(pictures, os.R_OK | os.X_OK):
        raise RuntimeError(f"PICTURE_DIR {pictures} is not readable by uid {os.getuid()}")
