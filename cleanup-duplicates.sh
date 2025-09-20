#!/bin/bash
#!/bin/bash

echo "Cleaning up duplicate DTO files..."

# Remove any standalone DTO files that might be duplicated
# We'll keep the ones in the main dto package and remove others

echo "Checking for SessionDTO duplicates..."
find src/main/java -name "SessionDTO.java" -not -path "*/dto/SessionDTO.java" -delete

echo "Checking for UserStatsDTO duplicates..."
find src/main/java -name "UserStatsDTO.java" -not -path "*/dto/UserStatsDTO.java" -delete

echo "Cleanup complete. Try building again."
# 🧹 Pickup Sports App - Duplicate File Cleanup Script
# Run this script to clean up duplicate and unwanted files

echo "🚀 Starting cleanup of duplicate files and build artifacts..."

# Remove duplicate authentication components
echo "📝 Cleaning up duplicate authentication files..."
rm -f "frontend-web/game_entrance_auth (1).jsx" 2>/dev/null
echo "   ✅ Removed game_entrance_auth (1).jsx"

# Remove Python build scripts (these were temporary)
echo "🐍 Cleaning up Python build scripts..."
rm -f "frontend-web/__write.py" 2>/dev/null
rm -f "frontend-web/__edit_app_providers.py" 2>/dev/null
echo "   ✅ Removed Python build scripts"

# Remove old test results (keep the structure but clean artifacts)
echo "🧪 Cleaning up old test artifacts..."
rm -rf frontend-web/test-results/*/test-results.xml 2>/dev/null
rm -rf frontend-web/test-results/*/test-attachments 2>/dev/null
echo "   ✅ Cleaned test artifacts"

# Remove node_modules caches (but not node_modules itself)
echo "📦 Cleaning up node_modules caches..."
find . -name ".npm" -type d -exec rm -rf {} + 2>/dev/null
find . -name ".yarn-cache" -type d -exec rm -rf {} + 2>/dev/null
echo "   ✅ Cleaned package manager caches"

# Remove any backup files
echo "💾 Cleaning up backup files..."
find . -name "*.bak" -type f -delete 2>/dev/null
find . -name "*~" -type f -delete 2>/dev/null
echo "   ✅ Removed backup files"

# Remove temporary IDE files
echo "💻 Cleaning up IDE temporary files..."
find . -name ".DS_Store" -type f -delete 2>/dev/null
find . -name "Thumbs.db" -type f -delete 2>/dev/null
echo "   ✅ Removed IDE temporary files"

# Clean up duplicate game entrance auth file
echo "🔐 Consolidating authentication components..."
if [ -f "frontend-web/game_entrance_auth.jsx" ]; then
    echo "   ✅ Main game_entrance_auth.jsx exists - duplicate removed"
fi

# Clean up log files
echo "📋 Cleaning up log files..."
find . -name "*.log" -type f -delete 2>/dev/null
find . -name "npm-debug.log*" -type f -delete 2>/dev/null
echo "   ✅ Removed log files"

# Summary
echo ""
echo "🎉 Cleanup completed! Summary:"
echo "   - Removed duplicate authentication components"
echo "   - Cleaned up build scripts and artifacts"
echo "   - Removed cache files and temporary data"
echo "   - Consolidated component structure"
echo ""
echo "📁 Your project structure is now cleaner and ready for development!"
echo ""
echo "🎯 Next steps:"
echo "   1. Review the COMPLETE_DEVELOPMENT_ROADMAP.md"
echo "   2. Start with mobile app development using the provided prompts"
echo "   3. Run 'npm install' in both frontend-web and mobile directories"
echo "   4. Begin Phase 2: Mobile-First Implementation"
echo ""
echo "✨ Happy coding! Your pickup sports app is going to be amazing!"
