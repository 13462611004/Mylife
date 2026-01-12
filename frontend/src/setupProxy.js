const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // 确保静态文件能够正确加载
  app.use('/maps', (req, res, next) => {
    // 让 React 开发服务器处理静态文件
    next();
  });
};
