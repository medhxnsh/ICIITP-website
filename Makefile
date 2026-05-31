ENV_FILE := config/.env

.PHONY: up down build logs ps restart

up:
	docker compose --env-file $(ENV_FILE) up -d

build:
	docker compose --env-file $(ENV_FILE) up -d --build

down:
	docker compose down

logs:
	docker compose logs -f

ps:
	docker compose ps

restart:
	docker compose --env-file $(ENV_FILE) restart
