#!/bin/bash

# Build script for Pickup Sports App
# This script ensures the correct Java version is used for building

echo "Setting up Java environment for Pickup Sports App..."
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home

echo "Java version: $(java -version 2>&1 | head -n 1)"
echo "Maven version: $(mvn -version 2>&1 | head -n 1)"

echo "Starting Maven build..."
mvn clean compile test-compile

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
else
    echo "❌ Build failed!"
    exit 1
fi
