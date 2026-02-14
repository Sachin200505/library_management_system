# Vercel deployable Django container
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# System deps for psycopg2
RUN apt-get update \ 
    && apt-get install -y --no-install-recommends build-essential libpq-dev \ 
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --upgrade pip \ 
    && pip install -r requirements.txt

COPY . .

# Collect static assets at build time
RUN python manage.py collectstatic --noinput

CMD ["gunicorn", "library_management_system.wsgi:application", "--bind", "0.0.0.0:8000"]
