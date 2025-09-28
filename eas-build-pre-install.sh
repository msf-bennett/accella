cat > eas-build-pre-install.sh << 'EOF'
#!/bin/bash
echo "🔧 Running pre-install script..."

if [ -n "$GOOGLE_SERVICES_JSON" ]; then
  echo "$GOOGLE_SERVICES_JSON" > google-services.json
  echo "✅ google-services.json created from environment variable"
  
  # Verify the file was created
  if [ -f "google-services.json" ]; then
    echo "✅ google-services.json file exists and is ready"
    ls -la google-services.json
  else
    echo "❌ Failed to create google-services.json"
    exit 1
  fi
else
  echo "❌ GOOGLE_SERVICES_JSON environment variable not found"
  echo "Available environment variables:"
  env | grep -E "(GOOGLE|EAS|EXPO)" || echo "No relevant environment variables found"
  exit 1
fi

echo "🚀 Pre-install script completed successfully"
EOF