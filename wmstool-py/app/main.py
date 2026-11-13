"""FastAPI application factory."""

from fastapi import FastAPI


def create_app() -> FastAPI:
    return FastAPI(title="wmstool", docs_url=None, redoc_url=None, openapi_url=None)


app = create_app()
