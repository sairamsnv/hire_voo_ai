# 🚀 Quick cURL API Testing Guide

## 🔑 Your API Key
```
LfGmr1JbE93B218L79yaRQ_DNE27da6e2gwVvsx0C_w
```

---

## 🧪 Quick Test Commands

### **1. Test Sessions API**
```bash
curl -H "X-API-Key: LfGmr1JbE93B218L79yaRQ_DNE27da6e2gwVvsx0C_w" \
     -H "Content-Type: application/json" \
     http://127.0.0.1:8000/api/sessions/
```

### **2. Test Security Events**
```bash
curl -H "X-API-Key: LfGmr1JbE93B218L79yaRQ_DNE27da6e2gwVvsx0C_w" \
     -H "Content-Type: application/json" \
     http://127.0.0.1:8000/api/security/events/
```

### **3. Test API Keys Management**
```bash
curl -H "X-API-Key: LfGmr1JbE93B218L79yaRQ_DNE27da6e2gwVvsx0C_w" \
     -H "Content-Type: application/json" \
     http://127.0.0.1:8000/api/security/keys/
```

### **4. Test API Request Logs**
```bash
curl -H "X-API-Key: LfGmr1JbE93B218L79yaRQ_DNE27da6e2gwVvsx0C_w" \
     -H "Content-Type: application/json" \
     http://127.0.0.1:8000/api/security/logs/
```

---

## 🧪 Error Testing

### **Test Invalid API Key**
```bash
curl -H "X-API-Key: INVALID_KEY" \
     -H "Content-Type: application/json" \
     http://127.0.0.1:8000/api/sessions/
```

### **Test Missing API Key**
```bash
curl -H "Content-Type: application/json" \
     http://127.0.0.1:8000/api/sessions/
```

---

## 📊 Expected Responses

### **✅ Success Response (200)**
```json
{
  "sessions": [
    {
      "id": 1,
      "user": "admin@example.com",
      "ip_address": "127.0.0.1",
      "user_agent": "curl/7.68.0",
      "created_at": "2024-01-15T10:30:00Z",
      "last_activity": "2024-01-15T11:45:00Z",
      "is_active": true
    }
  ]
}
```

### **❌ Error Response (401)**
```json
{
  "error": "Invalid API key",
  "code": "INVALID_API_KEY"
}
```

---

## 🔧 One-Liner Test Script

Create a file called `test_curl.sh`:

```bash
#!/bin/bash

API_KEY="LfGmr1JbE93B218L79yaRQ_DNE27da6e2gwVvsx0C_w"
BASE_URL="http://127.0.0.1:8000/api"

echo "🧪 Testing API Key Authentication..."
echo ""

echo "1️⃣ Testing Sessions API..."
curl -s -H "X-API-Key: $API_KEY" \
     -H "Content-Type: application/json" \
     "$BASE_URL/sessions/" | jq '.'

echo ""
echo "2️⃣ Testing Security Events..."
curl -s -H "X-API-Key: $API_KEY" \
     -H "Content-Type: application/json" \
     "$BASE_URL/security/events/" | jq '.'

echo ""
echo "3️⃣ Testing API Keys..."
curl -s -H "X-API-Key: $API_KEY" \
     -H "Content-Type: application/json" \
     "$BASE_URL/security/keys/" | jq '.'

echo ""
echo "4️⃣ Testing API Logs..."
curl -s -H "X-API-Key: $API_KEY" \
     -H "Content-Type: application/json" \
     "$BASE_URL/security/logs/" | jq '.'

echo ""
echo "✅ Testing complete!"
```

**Run it:**
```bash
chmod +x test_curl.sh
./test_curl.sh
```

---

## 🎯 Quick Status Check

```bash
# Check if Django server is running
curl -s http://127.0.0.1:8000/api/sessions/ | head -c 100

# Check API key validity
curl -s -H "X-API-Key: LfGmr1JbE93B218L79yaRQ_DNE27da6e2gwVvsx0C_w" \
     http://127.0.0.1:8000/api/sessions/ | jq '.sessions | length'
```

---

## 📝 Windows Command Prompt

For Windows users, use these commands:

```cmd
curl -H "X-API-Key: LfGmr1JbE93B218L79yaRQ_DNE27da6e2gwVvsx0C_w" -H "Content-Type: application/json" http://127.0.0.1:8000/api/sessions/
```

---

## 🚀 Ready to Test!

Just copy and paste any of the cURL commands above to test your API key authentication! 🎉 