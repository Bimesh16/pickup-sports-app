#!/bin/bash

echo "=== FIXING DUPLICATE DTO ISSUES ==="

# Find all DTO files that are duplicated
echo "Step 1: Finding duplicate SessionDTO files..."
find src/main/java -name "SessionDTO.java" -print0 | while IFS= read -r -d '' file; do
    if [[ "$file" != "src/main/java/com/bmessi/pickupsportsapp/dto/SessionDTO.java" ]]; then
        echo "Removing duplicate: $file"
        rm "$file"
    fi
done

echo "Step 2: Finding duplicate UserStatsDTO files..."
find src/main/java -name "UserStatsDTO.java" -print0 | while IFS= read -r -d '' file; do
    if [[ "$file" != "src/main/java/com/bmessi/pickupsportsapp/dto/UserStatsDTO.java" ]]; then
        echo "Removing duplicate: $file"
        rm "$file"
    fi
done

# Clean up ComprehensiveProfileDTO by removing embedded classes
echo "Step 3: Cleaning ComprehensiveProfileDTO..."
if [ -f "src/main/java/com/bmessi/pickupsportsapp/dto/ComprehensiveProfileDTO.java" ]; then
    # Create a backup
    cp "src/main/java/com/bmessi/pickupsportsapp/dto/ComprehensiveProfileDTO.java" "ComprehensiveProfileDTO.backup"

    # Remove everything after the main class closing brace
    sed -i '/^}$/,$d' src/main/java/com/bmessi/pickupsportsapp/dto/ComprehensiveProfileDTO.java
    # Add back the final closing brace
    echo "}" >> src/main/java/com/bmessi/pickupsportsapp/dto/ComprehensiveProfileDTO.java
fi

echo "Step 4: Making sure all DTOs are public..."
# Fix access modifiers
sed -i 's/^class SessionDTO/public class SessionDTO/' src/main/java/com/bmessi/pickupsportsapp/dto/SessionDTO.java 2>/dev/null || true
sed -i 's/^class UserStatsDTO/public class UserStatsDTO/' src/main/java/com/bmessi/pickupsportsapp/dto/UserStatsDTO.java 2>/dev/null || true

echo "=== FIXES APPLIED ==="
echo "Try running: ./mvnw clean compile -DskipTests"
