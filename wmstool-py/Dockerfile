FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TZ=Asia/Taipei \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# tzdata makes TZ=Asia/Taipei affect the process clock the way the Java service's
# Asia/Taipei default does. Installed before the dependency layer so it is cached
# with the base tools.
RUN apt-get update \
 && apt-get install -y --no-install-recommends tzdata \
 && ln -snf /usr/share/zoneinfo/Asia/Taipei /etc/localtime \
 && echo Asia/Taipei > /etc/timezone \
 && rm -rf /var/lib/apt/lists/*

# Dependencies, including the tools extra (xlrd), before the application code so
# an app-only change does not reinstall them. `python -m app.template_check`
# runs in this image.
COPY pyproject.toml ./
RUN python -c "import pathlib,subprocess,sys,tomllib; p=tomllib.loads(pathlib.Path('pyproject.toml').read_text()); deps=[*p['project']['dependencies'], *p['project']['optional-dependencies']['tools']]; subprocess.check_call([sys.executable, '-m', 'pip', 'install', '--no-cache-dir', *deps])"

COPY app ./app
COPY alembic.ini ./
COPY migrations ./migrations
RUN pip install --no-cache-dir --no-deps .

# uid 1000 (wms). EXCEL_DIR and PICTURE_DIR are bind mounts and are not created
# here. They must be writable by uid 1000, for example:
#   sudo chown -R 1000:1000 /data/files
# A directory mode of 0775 owned by that uid, or 0777 on a disposable volume,
# is enough. The process cannot chown a root-owned mount.
RUN useradd --uid 1000 --create-home --shell /usr/sbin/nologin wms \
 && chown -R wms:wms /app
USER wms

EXPOSE 8080
# alembic upgrade head stays first: the container applies migration 0002 before
# it accepts traffic. Do not start uvicorn before the upgrade. See
# contract-tests/README.md, "切換順序".
CMD ["sh", "-c", "alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port 8080"]
