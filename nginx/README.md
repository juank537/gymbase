# GymBase - Docker Production Setup

## Estructura de servicios

```
┌─────────────┐
│  Nginx      │  Port 80/443
│  Proxy      │
└──────┬──────┘
       │
       ├──→ Frontend (nginx:80)
       │
       └──→ Backend (FastAPI:8000)
               │
               └──→ PostgreSQL (5432)
```

## Cómo ejecutar

### Desarrollo con Docker
```bash
docker-compose up -d
```

### Producción con Nginx Proxy
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Ver logs
```bash
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx-proxy
```

### Detener
```bash
docker-compose down
docker-compose down -v  # Con volumes (borra datos)
```

## Endpoints

- **Frontend**: http://localhost
- **Backend API**: http://localhost/api/v1
- **Health Check**: http://health/health

## Configuración SSL (Producción)

1. Obtener certificado SSL (Let's Encrypt):
```bash
docker run -it --rm \
  -v ./nginx/ssl:/etc/letsencrypt \
  certbot/certbot certonly --standalone -d yourdomain.com
```

2. Descomentar bloque HTTPS en `nginx/nginx.conf`

3. Recargar nginx:
```bash
docker-compose exec nginx-proxy nginx -s reload
```

## Health Checks

Todos los servicios tienen health checks configurados:
- **Postgres**: pg_isready
- **Backend**: /api/v1/health endpoint
- **Frontend**: wget spider
- **Nginx**: No necesita (depende de backend/frontend)

## Variables de entorno

Editar `docker-compose.prod.yml` antes de deploy:
- `JWT_SECRET`: Generar con `openssl rand -hex 32`
- `POSTGRES_PASSWORD`: Contraseña segura
- `CORS_ORIGINS`: Dominios permitidos