"""EXCEL_DIR and PICTURE_DIR have no default and are read at startup."""

import pytest

from app.config import get_settings


def _base(monkeypatch) -> None:  # noqa: ANN001
    monkeypatch.setenv("WMS_DATABASE_URL", "mysql+pymysql://unused/unused")
    monkeypatch.setenv("JWT_SECRET", "QUJD")
    monkeypatch.setenv("ERP_DATABASE_URL", "mssql+pymssql://unused/unused")
    get_settings.cache_clear()


def test_unset_directories_fail_with_the_env_names(monkeypatch):
    _base(monkeypatch)
    monkeypatch.delenv("EXCEL_DIR", raising=False)
    monkeypatch.delenv("PICTURE_DIR", raising=False)
    with pytest.raises(RuntimeError, match="EXCEL_DIR") as exc:
        get_settings()
    assert "PICTURE_DIR" in str(exc.value)
    assert "empty string" in str(exc.value)


def test_a_blank_directory_is_rejected(monkeypatch):
    _base(monkeypatch)
    monkeypatch.setenv("EXCEL_DIR", "  ")
    monkeypatch.setenv("PICTURE_DIR", "/tmp/pictures")
    with pytest.raises(RuntimeError, match="EXCEL_DIR must be set"):
        get_settings()


def test_create_app_fails_when_picture_dir_is_unset(monkeypatch, tmp_path):
    _base(monkeypatch)
    monkeypatch.setenv("EXCEL_DIR", str(tmp_path))
    monkeypatch.setenv("PICTURE_DIR", str(tmp_path))
    from app.main import create_app

    create_app()
    monkeypatch.delenv("PICTURE_DIR")
    get_settings.cache_clear()
    with pytest.raises(RuntimeError, match="PICTURE_DIR"):
        create_app()


# The directories themselves: the service writes every report under EXCEL_DIR and only
# reads product photos from PICTURE_DIR. A directory the service user (uid 1000 in the
# image) cannot use should stop the start, not the first report hours later.


def _dirs(monkeypatch, excel, pictures) -> None:  # noqa: ANN001
    _base(monkeypatch)
    monkeypatch.setenv("EXCEL_DIR", str(excel))
    monkeypatch.setenv("PICTURE_DIR", str(pictures))


def test_create_app_fails_when_excel_dir_does_not_exist(monkeypatch, tmp_path):
    from app.main import create_app

    _dirs(monkeypatch, tmp_path / "missing", tmp_path)
    with pytest.raises(RuntimeError, match=r"EXCEL_DIR .*missing.* does not exist"):
        create_app()


@pytest.mark.skipif(hasattr(__import__("os"), "geteuid") and __import__("os").geteuid() == 0,
                    reason="root can write anywhere")
def test_create_app_fails_when_excel_dir_is_not_writable(monkeypatch, tmp_path):
    from app.main import create_app

    excel = tmp_path / "excels"
    excel.mkdir()
    excel.chmod(0o555)
    try:
        _dirs(monkeypatch, excel, tmp_path)
        with pytest.raises(RuntimeError, match="EXCEL_DIR .* is not writable"):
            create_app()
    finally:
        excel.chmod(0o755)


def test_create_app_accepts_a_missing_picture_dir(monkeypatch, tmp_path):
    """Java only checks each photo file: without the folder, reports have no photos."""
    from app.main import create_app

    _dirs(monkeypatch, tmp_path, tmp_path / "no-pictures-yet")
    create_app()


@pytest.mark.skipif(hasattr(__import__("os"), "geteuid") and __import__("os").geteuid() == 0,
                    reason="root can read anywhere")
def test_create_app_fails_when_picture_dir_is_not_readable(monkeypatch, tmp_path):
    from app.main import create_app

    pictures = tmp_path / "pictures"
    pictures.mkdir()
    pictures.chmod(0o000)
    try:
        _dirs(monkeypatch, tmp_path, pictures)
        with pytest.raises(RuntimeError, match="PICTURE_DIR .* is not readable"):
            create_app()
    finally:
        pictures.chmod(0o755)


def test_create_app_accepts_a_read_only_picture_dir(monkeypatch, tmp_path):
    """Photos are only read: a read-only mount is fine."""
    from app.main import create_app

    pictures = tmp_path / "pictures"
    pictures.mkdir()
    pictures.chmod(0o555)
    try:
        _dirs(monkeypatch, tmp_path, pictures)
        create_app()
    finally:
        pictures.chmod(0o755)


@pytest.mark.skipif(hasattr(__import__("os"), "geteuid") and __import__("os").geteuid() == 0,
                    reason="root can write anywhere")
def test_create_app_fails_when_an_existing_report_subfolder_is_not_writable(monkeypatch, tmp_path):
    """Reports go to EXCEL_DIR/<folder>/<year>/<month>. Folders copied from the Java
    host keep their owner; one the service cannot write must stop the start."""
    from app.main import create_app

    month = tmp_path / "STKALLT" / "2026" / "11"
    month.mkdir(parents=True)
    month.chmod(0o555)
    try:
        _dirs(monkeypatch, tmp_path, tmp_path)
        with pytest.raises(RuntimeError, match=r"EXCEL_DIR .*STKALLT/2026/11 is not writable"):
            create_app()
    finally:
        month.chmod(0o755)


@pytest.mark.skipif(hasattr(__import__("os"), "geteuid") and __import__("os").geteuid() == 0,
                    reason="root can write anywhere")
def test_the_directory_check_writes_instead_of_trusting_access(monkeypatch, tmp_path):
    """On CIFS/SMB mounts the permission bits are made up on the client: os.access can
    say yes while the server refuses the write. The check writes a file instead."""
    import os

    from app.main import create_app

    excel = tmp_path / "excels"
    excel.mkdir()
    excel.chmod(0o555)
    monkeypatch.setattr(os, "access", lambda *args, **kwargs: True)
    try:
        _dirs(monkeypatch, excel, tmp_path)
        with pytest.raises(RuntimeError, match="EXCEL_DIR .* is not writable"):
            create_app()
    finally:
        excel.chmod(0o755)


def test_the_directory_check_leaves_no_file_behind(monkeypatch, tmp_path):
    from app.main import create_app

    (tmp_path / "STKALLT" / "2026" / "11").mkdir(parents=True)
    _dirs(monkeypatch, tmp_path, tmp_path)
    create_app()
    assert [p for p in tmp_path.rglob("*") if p.is_file()] == []


@pytest.mark.skipif(hasattr(__import__("os"), "geteuid") and __import__("os").geteuid() == 0,
                    reason="root can write anywhere")
def test_folders_the_service_never_writes_are_not_checked(monkeypatch, tmp_path):
    """A mount point's lost+found (root, 0700) or an archive someone keeps read-only
    next to the report folders must not stop the start: only EXCEL_DIR itself and the
    five report folders are written."""
    from app.main import create_app

    lost = tmp_path / "lost+found"
    archive = tmp_path / "archive" / "2019"
    lost.mkdir()
    archive.mkdir(parents=True)
    lost.chmod(0o000)
    archive.chmod(0o555)
    try:
        _dirs(monkeypatch, tmp_path, tmp_path / "pictures")
        create_app()
    finally:
        lost.chmod(0o755)
        archive.chmod(0o755)


def test_the_write_probe_does_not_rely_on_temporary_file(monkeypatch, tmp_path):
    """Without O_TMPFILE, TemporaryFile deletes the file while it is still open; a
    share that refuses that would make a writable folder look read-only and leave
    the file behind. The probe creates, closes and deletes the file. (Only CategoryDetail
    deletes files when writing reports; the delete is there to remove the probe.)

    Limit: this only bans TemporaryFile. It does not simulate a share that refuses to
    delete an open file, so another API that deletes while the file is open (for
    example NamedTemporaryFile(delete=True)) would pass it too."""
    import errno
    import tempfile

    from app.main import create_app

    def no_temporary_file(*args, **kwargs):  # noqa: ANN002, ANN003, ANN202
        raise OSError(errno.EOPNOTSUPP, "unlink of an open file refused")

    (tmp_path / "STKALLT" / "2026" / "11").mkdir(parents=True)
    monkeypatch.setattr(tempfile, "TemporaryFile", no_temporary_file)
    _dirs(monkeypatch, tmp_path, tmp_path / "pictures")
    create_app()
    assert [p for p in tmp_path.rglob("*") if p.is_file()] == []


@pytest.mark.skipif(hasattr(__import__("os"), "geteuid") and __import__("os").geteuid() == 0,
                    reason="root can write anywhere")
def test_create_app_fails_when_a_report_subfolder_cannot_be_listed(monkeypatch, tmp_path):
    """A folder copied with its old owner and mode 0700 can be neither listed nor
    written by the service. Walking cannot enter it; it must still be probed."""
    from app.main import create_app

    year = tmp_path / "STKALLT" / "2026"
    (year / "11").mkdir(parents=True)
    year.chmod(0o000)
    try:
        _dirs(monkeypatch, tmp_path, tmp_path / "pictures")
        with pytest.raises(RuntimeError, match=r"EXCEL_DIR .*STKALLT/2026 is not writable"):
            create_app()
    finally:
        year.chmod(0o755)


@pytest.mark.skipif(hasattr(__import__("os"), "geteuid") and __import__("os").geteuid() == 0,
                    reason="root can write anywhere")
def test_create_app_fails_when_a_report_subfolder_links_to_a_read_only_folder(monkeypatch, tmp_path):
    """The walk does not follow links, but a linked month folder is still written to."""
    from app.main import create_app

    target = tmp_path / "elsewhere"
    target.mkdir()
    target.chmod(0o555)
    (tmp_path / "STKALLT").mkdir()
    (tmp_path / "STKALLT" / "2026").symlink_to(target, target_is_directory=True)
    try:
        _dirs(monkeypatch, tmp_path, tmp_path / "pictures")
        with pytest.raises(RuntimeError, match=r"EXCEL_DIR .*STKALLT/2026 is not writable"):
            create_app()
    finally:
        target.chmod(0o755)


def test_a_probe_file_that_cannot_be_deleted_is_named(monkeypatch, tmp_path):
    """Create works, delete is refused: say so, and name the file left behind, instead
    of calling the folder "not writable"."""
    import os

    from app.main import create_app

    real_unlink = os.unlink

    def refuse_probe(path, *args, **kwargs):  # noqa: ANN001, ANN002, ANN003, ANN202
        if os.path.basename(path).startswith(".wms-write-check-"):
            raise PermissionError(13, "Permission denied", path)
        return real_unlink(path, *args, **kwargs)

    monkeypatch.setattr(os, "unlink", refuse_probe)
    _dirs(monkeypatch, tmp_path, tmp_path / "pictures")
    with pytest.raises(RuntimeError, match=r"could not delete \S*\.wms-write-check-\w+ \(Permission denied\)\. Allow deleting there, then delete it by hand"):
        create_app()


def test_startup_does_not_need_getuid_when_the_folders_are_fine(monkeypatch, tmp_path):
    """os.getuid does not exist on Windows. A developer running the service there
    outside Docker must not crash at startup; the uid only goes into error messages."""
    import os

    from app.main import create_app

    (tmp_path / "STKALLT" / "2026" / "11").mkdir(parents=True)
    _dirs(monkeypatch, tmp_path, tmp_path / "pictures")
    monkeypatch.delattr(os, "getuid")
    create_app()


def _failing_close(monkeypatch, unlink_too: bool = False) -> None:  # noqa: ANN001
    """Make closing a probe file fail with EIO (the fd is still released, as on Linux),
    and optionally deleting it too. Other files are left alone."""
    import errno
    import os
    import tempfile

    probe_fds: set[int] = set()
    real_mkstemp, real_close, real_unlink = tempfile.mkstemp, os.close, os.unlink

    def recording_mkstemp(*args, **kwargs):  # noqa: ANN002, ANN003, ANN202
        fd, name = real_mkstemp(*args, **kwargs)
        probe_fds.add(fd)
        return fd, name

    def failing_close(fd: int) -> None:
        real_close(fd)
        if fd in probe_fds:
            probe_fds.discard(fd)  # the number can be reused once it is closed
            raise OSError(errno.EIO, "Input/output error")

    def refusing_unlink(path, *args, **kwargs):  # noqa: ANN001, ANN002, ANN003, ANN202
        if os.path.basename(path).startswith(".wms-write-check-"):
            raise PermissionError(errno.EACCES, "Permission denied", path)
        return real_unlink(path, *args, **kwargs)

    monkeypatch.setattr(tempfile, "mkstemp", recording_mkstemp)
    monkeypatch.setattr(os, "close", failing_close)
    if unlink_too:
        monkeypatch.setattr(os, "unlink", refusing_unlink)


def test_a_probe_file_that_cannot_be_closed_is_still_deleted(monkeypatch, tmp_path):
    """A share can report an I/O error on close. That is not a permission problem: the
    message says the close failed, the probe is still deleted, and nobody is asked to
    delete a file that is not there."""
    from app.main import create_app

    _failing_close(monkeypatch)
    _dirs(monkeypatch, tmp_path, tmp_path / "pictures")
    with pytest.raises(RuntimeError, match=r"closing a test file failed \(Input/output error\)") as exc:
        create_app()
    assert "by hand" not in str(exc.value)
    assert "Allow deleting" not in str(exc.value)
    assert [p.name for p in tmp_path.iterdir() if p.name.startswith(".wms-write-check-")] == []


def test_a_probe_file_that_can_be_neither_closed_nor_deleted_is_named(monkeypatch, tmp_path):
    from app.main import create_app

    _failing_close(monkeypatch, unlink_too=True)
    _dirs(monkeypatch, tmp_path, tmp_path / "pictures")
    with pytest.raises(RuntimeError, match=(
            r"closing \S*\.wms-write-check-\w+ failed \(Input/output error\) and it could not be "
            r"deleted \(Permission denied\)\. Check the share, then delete it by hand")):
        create_app()
