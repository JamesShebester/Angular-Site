# Angular Site with Optimizely CORS Proxy

This project demonstrates how to properly handle CORS issues when integrating third-party services like Optimizely using a server-side proxy approach.

## 🚀 Quick Start

### Development Mode (with CORS proxy)
```bash
npm run start:dev
```
This starts both the Express proxy server (port 3001) and Angular dev server (port 4200) concurrently.

### Individual Components
```bash
# Start only the proxy server
npm run start:server

# Start only Angular (requires proxy server running)
npm run start
```

## 🔧 Architecture

### CORS Problem & Solution

**The Problem:**
- Optimizely CDN doesn't include `Access-Control-Allow-Origin: *` headers
- Modern browsers block cross-origin requests without proper CORS headers
- Direct CDN integration fails in development environments

**The Solution:**
```
[Frontend] ← → [Express Proxy Server] ← → [Optimizely CDN]
```

1. **Express Proxy Server** (`server.js`) runs on port 3001
2. **Angular Dev Server** runs on port 4200 with proxy configuration
3. **Proxy Configuration** (`proxy.conf.json`) routes `/api/*` to port 3001
4. **Smart Loading** (`index.html`) detects environment and chooses appropriate endpoint

### Request Flow

#### Development (localhost):
```
Angular App → /api/optimizely/js/6508035657433088.js
            ↓ (proxy.conf.json)
Express Server → https://cdn.optimizely.com/js/6508035657433088.js
            ↓ (adds CORS headers)
Angular App ← ✅ Script with CORS headers
```

#### Production (GitHub Pages):
```
Angular App → https://cdn.optimizely.com/js/6508035657433088.js
            ↓ (direct call with crossOrigin attribute)
Angular App ← ✅ Script loads (or graceful fallback)
```

## 📁 Key Files

### `server.js` - Express Proxy Server
- CORS-enabled Express server
- Proxies requests to `cdn.optimizely.com`
- Adds proper CORS headers to responses
- Health check endpoint at `/api/health`

### `proxy.conf.json` - Angular Proxy Config
- Routes `/api/*` requests to localhost:3001
- Used by Angular CLI dev server
- Enables seamless API calls during development

### `src/index.html` - Smart Script Loading
- Detects development vs production environment
- Uses proxy endpoint in development
- Falls back to direct CDN in production
- Includes error handling and fallback logic

### `package.json` - NPM Scripts
- `start:server`: Run Express proxy server only
- `start:dev`: Run both servers concurrently
- `start`: Run Angular with proxy configuration

## 🛠️ Technical Details

### CORS Headers Added by Proxy
```javascript
'Access-Control-Allow-Origin': '*'
'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
'Access-Control-Allow-Headers': 'Content-Type, Authorization'
'Content-Type': 'application/javascript; charset=utf-8'
```

### Environment Detection Logic
```javascript
var isLocalhost = window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1';
```

### Proxy Endpoint Structure
```
GET /api/optimizely/js/6508035657433088.js
    ↓ (proxies to)
GET https://cdn.optimizely.com/js/6508035657433088.js
```

## 🚀 Deployment

### GitHub Pages (Production)
```bash
npm run deploy
```
- Builds for production with base-href configuration
- Uses direct CDN integration (no proxy needed)
- Deploys to gh-pages branch

### Alternative Hosting (with Proxy)
For hosting platforms that support Node.js:
1. Set `NODE_ENV=production`
2. Run `npm run build`
3. Start with `npm run start:server`

## 🔍 Testing

### Health Check
```bash
# Test proxy server
curl http://localhost:3001/api/health

# Test Optimizely proxy
curl http://localhost:3001/api/optimizely/js/6508035657433088.js
```

### Browser Console
When running in development, you should see:
```
🔧 Development: Loading Optimizely via proxy server
✅ Optimizely loaded successfully
```

## 📚 Dependencies

### Production
- `express`: Web server framework
- `cors`: CORS middleware
- `http-proxy-middleware`: Proxy functionality
- `concurrently`: Run multiple scripts

### Development
- `@angular/cli`: Angular development tools
- `angular-cli-ghpages`: GitHub Pages deployment

## 🎯 Benefits

1. **✅ Solves CORS Issues**: No more blocked requests in development
2. **🔄 Environment Aware**: Automatically adapts to dev/prod environments
3. **🛡️ Graceful Fallback**: Multiple fallback strategies for reliability
4. **📈 Scalable**: Can proxy any third-party service with CORS issues
5. **🔧 Development Friendly**: Easy setup with single command

## 🌐 Live Demo

- **Development**: http://localhost:4200 (with proxy)
- **Production**: https://jamesshebester.github.io/Angular-Site/ (direct CDN)

---

This solution provides a robust, production-ready approach to handling CORS issues with third-party integrations while maintaining optimal performance in both development and production environments.