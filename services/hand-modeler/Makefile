.PHONY: help install dev test lint format clean

help:
	@echo "Connecting Hands - Hand Modeler Service"
	@echo ""
	@echo "Available commands:"
	@echo "  make install       Install dependencies"
	@echo "  make dev           Run development server"
	@echo "  make test          Run tests"
	@echo "  make lint          Run linting"
	@echo "  make format        Format code"
	@echo "  make clean         Remove generated files"

install:
	poetry install

dev:
	poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

test:
	poetry run pytest

lint:
	poetry run ruff check .
	poetry run black --check .
	poetry run mypy .

format:
	poetry run black .
	poetry run ruff check --fix .

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache .mypy_cache .ruff_cache
	rm -rf dist build *.egg-info
