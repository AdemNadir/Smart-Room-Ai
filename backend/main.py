import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app import config
from app.database import init_db
from app.models import AppError

log = logging.getLogger("smartroom")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="SMART ROOM AI",
    lifespan=lifespan,
    docs_url="/docs" if config.DEBUG else None,
    redoc_url="/redoc" if config.DEBUG else None,
    openapi_url="/openapi.json" if config.DEBUG else None,
)

# pydantic error type -> reason code of contract 6.1. Anything else is invalid_format.
REASONS = {
    "missing": "required",
    "string_too_short": "too_short",
    "too_short": "too_short",
    "string_too_long": "too_long",
    "too_long": "too_long",
    "greater_than": "too_small",
    "greater_than_equal": "too_small",
    "less_than": "too_large",
    "less_than_equal": "too_large",
    "extra_forbidden": "unknown_value",
    "literal_error": "unknown_value",
    "enum": "unknown_value",
}


def error_response(status: int, code: str, message: str,
                   fields: dict | None = None, extra: dict | None = None) -> JSONResponse:
    error = {"code": code, "message": message}
    if fields:
        error["fields"] = fields
    body = {"error": error}
    if extra:
        body.update(extra)
    return JSONResponse(body, status_code=status)


@app.exception_handler(AppError)
async def handle_app_error(request: Request, exc: AppError) -> JSONResponse:
    return error_response(exc.status, exc.code, exc.message, exc.fields, exc.extra)


@app.exception_handler(RequestValidationError)
async def handle_validation_error(request: Request,
                                  exc: RequestValidationError) -> JSONResponse:
    fields = {}
    for err in exc.errors():
        if err["type"] == "json_invalid":
            fields["body"] = "invalid_format"
            continue
        # loc starts with "body" / "query" / "path"; only codes are returned, never the input
        name = ".".join(str(part) for part in err["loc"][1:]) or "body"
        fields[name] = REASONS.get(err["type"], "invalid_format")
    return error_response(422, "validation_error", "Some fields need attention.", fields)


@app.exception_handler(StarletteHTTPException)
async def handle_http_error(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    if exc.status_code == 404:
        return error_response(404, "not_found", "This address does not exist.")
    if exc.status_code == 405:
        return error_response(405, "method_not_allowed", "This method is not allowed here.")
    return error_response(422, "validation_error", "The request could not be read.")


@app.exception_handler(Exception)
async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
    # Details stay in the server console only (S11).
    log.exception("unhandled error on %s %s", request.method, request.url.path)
    return error_response(500, "server_error", "Something went wrong on the server. Try again.")


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "offline_mode": True}


if __name__ == "__main__":
    # Reads SMARTROOM_HOST / SMARTROOM_PORT; one worker because SQLite has one writer.
    uvicorn.run(app, host=config.HOST, port=config.PORT, workers=1)
