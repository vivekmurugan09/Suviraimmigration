FROM python:3.11-slim AS builder
WORKDIR /app
COPY . .
RUN if [ -f "scripts/build-static.py" ] && [ -d "public" ]; then \
        python3 scripts/build-static.py; \
    fi

FROM nginx:alpine
COPY --from=builder /app /tmp/app
RUN mkdir -p /usr/share/nginx/html && \
    if [ -d "/tmp/app/dist" ]; then \
        cp -r /tmp/app/dist/* /usr/share/nginx/html/; \
    elif [ -d "/tmp/app/src/dist" ]; then \
        cp -r /tmp/app/src/dist/* /usr/share/nginx/html/; \
    else \
        cp -r /tmp/app/* /usr/share/nginx/html/; \
    fi && \
    rm -rf /tmp/app

COPY nginx.conf /etc/nginx/templates/default.conf.template

ENV PORT=10000
EXPOSE 10000
CMD ["nginx", "-g", "daemon off;"]
