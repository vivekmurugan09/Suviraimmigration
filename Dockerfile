FROM python:3.11-slim AS builder
WORKDIR /app
COPY . .
RUN python3 scripts/build-static.py

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template

ENV PORT=10000
EXPOSE 10000
CMD ["nginx", "-g", "daemon off;"]
