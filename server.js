const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:4200', 'https://jamesshebester.github.io'],
  credentials: true
}));

// Proxy endpoint for Optimizely CDN
app.use('/api/optimizely', createProxyMiddleware({
  target: 'https://cdn.optimizely.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/optimizely': '', // Remove /api/optimizely from the path
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add custom headers if needed
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  },
  onProxyRes: (proxyRes, req, res) => {
    // Add CORS headers to the response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    
    // Set proper content type for JavaScript files
    if (req.url.endsWith('.js')) {
      proxyRes.headers['Content-Type'] = 'application/javascript; charset=utf-8';
    }
  },
  logLevel: 'debug'
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Optimizely Proxy Server'
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist/angular-site/browser')));
  
  // Handle Angular routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/angular-site/browser/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Optimizely proxy available at: http://localhost:${PORT}/api/optimizely/`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;