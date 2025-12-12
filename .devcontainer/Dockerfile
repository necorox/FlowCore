# Base Image
FROM mcr.microsoft.com/devcontainers/base:bookworm

# Argument for language versions
ARG GO_VERSION="1.21.4"
ARG NODE_VERSION="20.10.0"
ARG PHP_VERSION="8.2"
ARG PYTHON_VERSION="3.11"
ARG RUST_VERSION="1.74.0"

# Install common tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    curl \
    git \
    unzip \
    build-essential \
    pkg-config \
    libssl-dev \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install Go
RUN curl -fsSL "https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz" | tar -xz -C /usr/local
ENV PATH=$PATH:/usr/local/go/bin

# Install Node.js
RUN curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz" | tar -xz -C /usr/local --strip-components=1

# Install PHP
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    php${PHP_VERSION} \
    php${PHP_VERSION}-cli \
    php${PHP_VERSION}-mbstring \
    php${PHP_VERSION}-xml \
    php${PHP_VERSION}-curl \
    php${PHP_VERSION}-zip \
    php${PHP_VERSION}-pgsql \
    composer \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install Python
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*
# Alias python to python3 if needed, though python3 is standard now.

# Install Rust
ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain ${RUST_VERSION} \
    && chmod -R a+w /usr/local/rustup /usr/local/cargo

# Verify versions
RUN go version && node -v && php -v && python3 --version && rustc --version

# Install claude-code
RUN npm install -g @anthropic-ai/claude-code

# Set workspace directory
WORKDIR /workspace
