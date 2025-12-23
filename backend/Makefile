.PHONY: run stop

run:
	@echo "Stopping any existing server..."
	@-fuser -k 8080/tcp >/dev/null 2>&1 || true
	@-pkill -f "go run cmd/server/main.go" || true
	@echo "Starting server..."
	@DB_PASSWORD=0 DB_HOST=$$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' infra-db-1) go run cmd/server/main.go

stop:
	@echo "Stopping server..."
	@-pkill -f "go run cmd/server/main.go" || true
