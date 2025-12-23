#!/bin/bash
set -e

echo "Running post-create setup..."

# # apt update
# sudo apt-get update

# # Install PHP 8.2 and extensions
# # Base image is Debian 12 (Bookworm) which includes PHP 8.2
# echo "Installing PHP 8.2 and extensions..."
# sudo apt-get install -y --no-install-recommends \
#     php8.2 \
#     php8.2-cli \
#     php8.2-mbstring \
#     php8.2-xml \
#     php8.2-curl \
#     php8.2-zip \
#     php8.2-pgsql \
#     composer

# # Clean up apt
# sudo apt-get clean -y && sudo rm -rf /var/lib/apt/lists/*

# Install claude-code global package
# Node is installed via features, so npm should be available
echo "Installing claude-code..."
sudo npm install -g @anthropic-ai/claude-code

echo "Setup process initialization complete!"
