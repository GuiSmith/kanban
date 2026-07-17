# Inicialização
dev-up:
	docker container stop kanban-app || true
	([ -d node_modules ] || npm ci) && docker compose up kanban-app-dev -d
	docker logs -f kanban-app-dev
up:
	docker container stop kanban-app-dev || true
	docker compose up kanban-app -d --build
	docker logs -f kanban-app
down:
	docker compose down

# Migração
dev-migrate:
	docker exec -it kanban-app-dev npm run migrate
migrate:
	docker exec -it kanban-app npm run migrate

# DB
psql:
	docker exec -it kanban-db psql -U kanban -d kanban
