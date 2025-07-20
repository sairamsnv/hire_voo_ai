#!/bin/bash

echo "🚀 Building frontend..."
cd frontend
npm run build

echo "📁 Copying build files to Django staticfiles..."
cd ..
cp -r frontend/dist/* hire_voo_ai/staticfiles/

echo "✅ Frontend build and deployment completed!"
echo "📂 Files copied to: hire_voo_ai/staticfiles/"
echo "🌐 Django server should now serve the updated frontend" 