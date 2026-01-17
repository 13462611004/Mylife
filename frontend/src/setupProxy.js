const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // 确保静态文件能够正确加载
  app.use('/maps', (req, res, next) => {
    // 让 React 开发服务器处理静态文件
    next();
  });

  // 代理API请求到后端（开发环境使用8000端口）
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
    })
  );

  // 代理media文件到后端（开发环境使用8000端口）
  app.use(
    '/media',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
    })
  );
};
