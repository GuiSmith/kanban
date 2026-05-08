up-dev:
	docker compose up kanban-app-dev -d
up-prod:
	docker compose up kanban-app -d --build
down:
	docker compose down