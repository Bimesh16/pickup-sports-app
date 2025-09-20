#!/bin/bash

echo "Finding duplicate DTO files..."

echo "=== SessionDTO files ==="
find src/main/java -name "SessionDTO.java" -exec ls -la {} \;

echo ""
echo "=== UserStatsDTO files ==="
find src/main/java -name "UserStatsDTO.java" -exec ls -la {} \;

echo ""
echo "=== All DTO files in dto package ==="
ls -la src/main/java/com/bmessi/pickupsportsapp/dto/*.java

echo ""
echo "Please remove duplicate files manually, keeping only one copy of each."
