import logging
import sys
import re

SENSITIVE_PATTERNS = [
    re.compile(r"(api[_-]?key\s*[:=]\s*)([^\s&,]+)", re.IGNORECASE),
    re.compile(r"(password\s*[:=]\s*)([^\s&,]+)", re.IGNORECASE),
    re.compile(r"(token\s*[:=]\s*)([^\s&,]+)", re.IGNORECASE),
    re.compile(r"(authorization\s*[:=]\s*Bearer\s+)([^\s&,]+)", re.IGNORECASE),
]


class SensitiveDataFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            for pattern in SENSITIVE_PATTERNS:
                record.msg = pattern.sub(r"\1[REDACTED]", record.msg)
        return True


def setup_logging():
    logger = logging.getLogger("vedviki")
    logger.setLevel(logging.INFO)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            fmt="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        handler.addFilter(SensitiveDataFilter())
        logger.addHandler(handler)

    return logger


logger = setup_logging()
