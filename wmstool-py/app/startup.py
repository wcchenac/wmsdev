"""Checks create_app() runs before the service accepts traffic.

They live here rather than in app.config because they need the report folders
(app.files.reports), which itself reads the settings.
"""

import os
import tempfile
from pathlib import Path

from app.config import Settings
from app.files.reports import REPORTS, WRITE_PROBE_PREFIX


def _probe(directory: Path) -> None:
    """Create a file there, close it, delete it.

    os.access only reads the permission bits, which a CIFS/SMB mount makes up on the
    client side. TemporaryFile is avoided too: without O_TMPFILE it deletes the file
    while it is still open, which a share may refuse even though the folder is fine.
    Deleting is part of the check because only it removes the probe again; of the
    reports, only CategoryDetail deletes files (a category's report is replaced).
    """
    uid = os.getuid()
    try:
        fd, name = tempfile.mkstemp(dir=directory, prefix=WRITE_PROBE_PREFIX)
    except OSError as exc:
        raise RuntimeError(f"EXCEL_DIR {directory} is not writable by uid {uid} ({exc.strerror})") from exc
    os.close(fd)
    try:
        os.unlink(name)
    except OSError as exc:
        raise RuntimeError(
            f"EXCEL_DIR {directory}: uid {uid} could create files but could not delete {name} "
            f"({exc.strerror}). Allow deleting there, then delete it by hand.") from exc


def _report_folders(excel: Path) -> list[Path]:
    """EXCEL_DIR itself, the five report folders and every folder already under them
    (<folder>/<year>/<month>). Nothing else under EXCEL_DIR is written, so a mount's
    lost+found or a read-only archive kept beside the reports is not checked.

    Every name a folder lists is probed, not only the folders the walk enters: the
    walk skips a folder it cannot list (copied with its old owner, mode 0700) and
    does not follow a linked folder, but reports are still written into both.

    A missing CategoryDetail folder is created when its first report is written. The
    other four folders hold the templates (python -m app.template_check checks them),
    so a missing one already means its reports fail.
    """
    folders = [excel]
    for name in sorted({kind.folder for kind in REPORTS.values()}):
        root = excel / name
        if not root.is_dir():
            continue
        folders.append(root)
        for current, dirs, _ in os.walk(root):
            dirs.sort()
            folders.extend(Path(current) / sub for sub in dirs)
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
        _probe(folder)
    pictures = Path(settings.picture_dir)
    if pictures.is_dir() and not os.access(pictures, os.R_OK | os.X_OK):
        raise RuntimeError(f"PICTURE_DIR {pictures} is not readable by uid {os.getuid()}")
