# Inicialização
dev-up:
	docker compose up kanban-app-dev -d
prod-up:
	docker compose up kanban-app -d --build
down:
	docker compose down

# Migração
dev-migrate:
	docker exec -it kanban-app-dev npm run migrate
prod-migrate:
	docker exec -it kanban-app npm run migrate
