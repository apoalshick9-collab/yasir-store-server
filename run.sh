#!/bin/sh
# تشغيل سيرفر متجر ياسر أبو الشيخ
exec uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}
