.PHONY: run stop

run:
	@echo "Stopping any existing frontend..."
	@-fuser -k 3000/tcp >/dev/null 2>&1 || true
	@# Also try to kill by name just in case
	@-pkill -f "next" || true
	@# Clear lock file if it exists (stale lock prevention)
	@rm -f .next/dev/lock
	@echo "Starting frontend..."
	@npm run dev

stop:
	@echo "Stopping frontend..."
	@-fuser -k 3000/tcp >/dev/null 2>&1 || true
	@-pkill -f "next" || true
