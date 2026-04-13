.PHONY: build up down restart logs logs-server logs-client ps clean db-migrate db-push push push-client push-server deploy

# 建置所有 image
build:
	docker compose build

# 建置並啟動所有服務
up:
	docker compose up -d

# 建置後啟動（強制重新 build）
up-build:
	docker compose up -d --build

# 停止所有服務
down:
	docker compose down

# 停止並清除 volume
down-clean:
	docker compose down -v

# 重啟所有服務
restart:
	docker compose restart

# 查看所有服務 log
logs:
	docker compose logs -f

# 查看 server log
logs-server:
	docker compose logs -f server

# 查看 client log
logs-client:
	docker compose logs -f client

# 查看服務狀態
ps:
	docker compose ps

# 執行 prisma migrate
db-migrate:
	docker compose exec server npx prisma migrate dev

# 執行 prisma db push
db-push:
	docker compose exec server npx prisma db push

# 只建置 client
build-client:
	docker compose build client

# 只建置 server
build-server:
	docker compose build server

# === Push to Artifact Registry ===

REGISTRY := asia-east1-docker.pkg.dev/flashesim/flashpoint

# Build (linux/amd64) + push client 和 server
push:
	DOCKER_DEFAULT_PLATFORM=linux/amd64 docker compose build
	docker push $(REGISTRY)/server:latest
	docker push $(REGISTRY)/client:latest

# 只 push client
push-client:
	DOCKER_DEFAULT_PLATFORM=linux/amd64 docker compose build client
	docker push $(REGISTRY)/client:latest

# 只 push server
push-server:
	DOCKER_DEFAULT_PLATFORM=linux/amd64 docker compose build server
	docker push $(REGISTRY)/server:latest

# === Deploy to GCE ===

GCE_INSTANCE := flashpoint
GCE_ZONE := asia-east1-c

# 上傳 docker-compose.prod.yml 和 Caddyfile.prod 到 GCE
deploy:
	gcloud compute scp docker-compose.prod.yml Caddyfile.prod $(GCE_INSTANCE):~ --zone=$(GCE_ZONE)
