SHELL := /bin/bash

# Simple targets to run dev/build and toggle mock API

dev:
	npm run dev

build:
	npm run build

# Toggle mock API flag in src/lib/http.ts
mock-on:
	@sed -E -i.bak "s/const USE_MOCK = false/const USE_MOCK = true/" src/lib/http.ts && rm -f src/lib/http.ts.bak && echo "Mocks enabled"

mock-off:
	@sed -E -i.bak "s/const USE_MOCK = true/const USE_MOCK = false/" src/lib/http.ts && rm -f src/lib/http.ts.bak && echo "Mocks disabled"

.PHONY: dev build mock-on mock-off

