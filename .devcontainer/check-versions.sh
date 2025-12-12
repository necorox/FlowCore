#!/bin/bash

echo "Checking language versions..."

if command -v go &> /dev/null; then
    echo "Go: $(go version)"
else
    echo "Go: Not installed"
fi

if command -v node &> /dev/null; then
    echo "Node.js: $(node -v)"
else
    echo "Node.js: Not installed"
fi

if command -v php &> /dev/null; then
    echo "PHP: $(php -v | head -n 1)"
else
    echo "PHP: Not installed"
fi

if command -v python3 &> /dev/null; then
    echo "Python: $(python3 --version)"
else
    echo "Python: Not installed"
fi

if command -v rustc &> /dev/null; then
    echo "Rust: $(rustc --version)"
else
    echo "Rust: Not installed"
fi
