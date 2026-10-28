FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY ai_server/requirements.txt ai_server/requirements.txt
RUN pip install --no-cache-dir -r ai_server/requirements.txt
COPY ai_server ai_server
RUN useradd --uid 10001 --create-home app
USER app
CMD ["sh", "-c", "exec uvicorn ai_server.main:app --host 0.0.0.0 --port ${PORT:-8080} --ws-max-size 200000"]
