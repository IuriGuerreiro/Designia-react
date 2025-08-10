# 🛡️ CSP, CORS & Security Policies Guide

**THE ULTIMATE GUIDE TO FIX "REFUSED TO CONNECT" ERRORS AND STRIPE/EXTERNAL SERVICE INTEGRATION**

---

## 🚨 **COMMON ERRORS THIS FIXES:**

- ❌ `Refused to connect to 'https://js.stripe.com/v3'`
- ❌ `Content Security Policy directive violation`
- ❌ `Cross-Origin Request Blocked`
- ❌ Stripe/PayPal/Google APIs not loading
- ❌ External scripts/fonts/images blocked
- ❌ Embedded iframes not working

---

## 📍 **FOR VITE/REACT PROJECTS**

### **File: `vite.config.ts`**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // CORS Headers
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none', // CRITICAL: Not 'credentialless'
      
      // Content Security Policy - ALLOW EXTERNAL SERVICES
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "  https://js.stripe.com",           // Stripe
        "  https://accounts.google.com",     // Google OAuth
        "  https://apis.google.com",         // Google APIs
        "  https://www.paypal.com",          // PayPal
        "  https://www.paypalobjects.com",   // PayPal Objects
        "connect-src 'self'",
        "  https://api.stripe.com",          // Stripe API
        "  https://accounts.google.com",     // Google Auth
        "  https://www.paypal.com",          // PayPal API
        "  http://localhost:*",              // Local development
        "  http://127.0.0.1:*",              // Local development
        "  http://192.168.*:*",              // Local network
        "frame-src 'self'",
        "  https://js.stripe.com",           // Stripe iframes
        "  https://hooks.stripe.com",        // Stripe webhooks
        "  https://accounts.google.com",     // Google Auth
        "  https://www.paypal.com",          // PayPal checkout
        "style-src 'self' 'unsafe-inline'",
        "  https://fonts.googleapis.com",    // Google Fonts
        "font-src 'self'",
        "  https://fonts.gstatic.com",       // Google Fonts
        "img-src 'self' data: https:",      // All images
      ].join(' '),
      
      // Permissions Policy
      'Permissions-Policy': 'identity-credentials-get=*, publickey-credentials-get=*, storage-access=*',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    },
    
    // Proxy for API calls (optional)
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Your backend URL
        changeOrigin: true,
        secure: false
      }
    }
  }
})
```

### **File: `index.html`**
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- SECURITY HEADERS FOR EXTERNAL SERVICES -->
    <meta http-equiv="Cross-Origin-Opener-Policy" content="same-origin-allow-popups" />
    <meta http-equiv="Cross-Origin-Embedder-Policy" content="unsafe-none" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://accounts.google.com https://apis.google.com https://www.paypal.com; connect-src 'self' https://api.stripe.com https://accounts.google.com https://www.paypal.com http://localhost:* http://127.0.0.1:* http://192.168.*:*; frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://accounts.google.com https://www.paypal.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:;" />
    
    <title>Your App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 🔧 **COMMON CSP DIRECTIVES EXPLAINED**

| Directive | Purpose | Common Values |
|-----------|---------|---------------|
| `default-src` | Default policy for all resource types | `'self'` |
| `script-src` | JavaScript sources | `'self'`, `'unsafe-inline'`, `https://js.stripe.com` |
| `connect-src` | AJAX, WebSocket, EventSource | `'self'`, `https://api.stripe.com` |
| `frame-src` | `<iframe>` sources | `'self'`, `https://js.stripe.com` |
| `style-src` | CSS sources | `'self'`, `'unsafe-inline'`, `https://fonts.googleapis.com` |
| `font-src` | Font sources | `'self'`, `https://fonts.gstatic.com` |
| `img-src` | Image sources | `'self'`, `data:`, `https:` |
| `object-src` | `<object>`, `<embed>`, `<applet>` | `'none'` (usually blocked) |

---

## ⚡ **QUICK FIX TEMPLATES**

### **For Stripe Integration:**
```
script-src: https://js.stripe.com
connect-src: https://api.stripe.com
frame-src: https://js.stripe.com https://hooks.stripe.com
```

### **For Google OAuth/APIs:**
```
script-src: https://accounts.google.com https://apis.google.com
connect-src: https://accounts.google.com
frame-src: https://accounts.google.com
```

### **For PayPal:**
```
script-src: https://www.paypal.com https://www.paypalobjects.com
connect-src: https://www.paypal.com
frame-src: https://www.paypal.com
```

### **For Font/Style Libraries:**
```
style-src: https://fonts.googleapis.com https://cdn.jsdelivr.net
font-src: https://fonts.gstatic.com https://cdn.jsdelivr.net
```

---

## 🚨 **CRITICAL WARNINGS**

### **❌ DON'T DO THIS:**
```typescript
// This BREAKS external services like Stripe
'Cross-Origin-Embedder-Policy': 'require-corp'
'Cross-Origin-Embedder-Policy': 'credentialless'

// This is TOO RESTRICTIVE
'Content-Security-Policy': "default-src 'self'"
```

### **✅ DO THIS:**
```typescript
// This ALLOWS external services
'Cross-Origin-Embedder-Policy': 'unsafe-none'

// This is PERMISSIVE for external services
'Content-Security-Policy': "default-src 'self'; script-src 'self' https://js.stripe.com ..."
```

---

## 🔍 **DEBUGGING TOOLS**

### **Browser Console Commands:**
```javascript
// Check current CSP policy
console.log(document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content);

// Test if script can load
const script = document.createElement('script');
script.src = 'https://js.stripe.com/v3/';
script.onload = () => console.log('✅ Script loaded');
script.onerror = () => console.log('❌ Script blocked');
document.head.appendChild(script);

// Check CORS headers
fetch('https://api.stripe.com/healthcheck')
  .then(r => console.log('✅ CORS OK'))
  .catch(e => console.log('❌ CORS blocked:', e));
```

### **Network Tab Checks:**
1. Open Developer Tools → Network tab
2. Look for red/blocked requests
3. Check response headers for CSP violations
4. Look for status codes: 0, blocked, CORS error

---

## 🆘 **EMERGENCY "ALLOW EVERYTHING" MODE**

**ONLY FOR DEBUGGING - NOT FOR PRODUCTION!**

```typescript
// Vite config - TEMPORARILY DISABLE ALL SECURITY
server: {
  headers: {
    'Cross-Origin-Opener-Policy': 'unsafe-none',
    'Cross-Origin-Embedder-Policy': 'unsafe-none',
    'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
  }
}
```

Use this to test if CSP is the issue, then gradually restrict it.

---

## 🎯 **FINAL REMINDER**

**THE #1 CAUSE OF "REFUSED TO CONNECT" ERRORS:**

1. **`Cross-Origin-Embedder-Policy: credentialless`** ← Change to `unsafe-none`
2. **Missing external domains in CSP** ← Add `https://js.stripe.com` etc.
3. **Too restrictive CSP** ← Allow `'unsafe-inline'` for development

**ALWAYS RESTART YOUR DEV SERVER AFTER CHANGING THESE FILES!**

---

*Save this guide - it will save your ass when external services break! 🛡️*