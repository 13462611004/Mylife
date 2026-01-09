import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import './App.css';
import './styles/global.css';

const Home = lazy(() => import('./pages/Home'));
const Marathon = lazy(() => import('./pages/Marathon'));
const Login = lazy(() => import('./pages/Login'));
const Admin = lazy(() => import('./pages/Admin'));
const Moments = lazy(() => import('./pages/Moments'));

const LoadingSpinner: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <Spin size="large" tip="加载中..." />
  </div>
);

const { Content, Footer } = Layout;

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={
            <Layout className="app-layout">
              <Content className="app-content">
                <Moments />
              </Content>
              <Footer className="app-footer">
                追光小慢侠 ©{new Date().getFullYear()}
              </Footer>
            </Layout>
          } />
          
          <Route path="/admin/login" element={<Login />} />
          
          <Route path="/home" element={
            <Layout className="app-layout">
              <Content className="app-content">
                <Home />
              </Content>
              <Footer className="app-footer">
                追光小慢侠 ©{new Date().getFullYear()}
              </Footer>
            </Layout>
          } />
          
          <Route path="/marathon" element={
            <Layout className="app-layout">
              <Content className="app-content">
                <Marathon />
              </Content>
              <Footer className="app-footer">
                追光小慢侠 ©{new Date().getFullYear()}
              </Footer>
            </Layout>
          } />
          
          <Route path="/moments" element={
            <Layout className="app-layout">
              <Content className="app-content">
                <Moments />
              </Content>
              <Footer className="app-footer">
                追光小慢侠 ©{new Date().getFullYear()}
              </Footer>
            </Layout>
          } />
          
          <Route path="/admin" element={
            <Layout className="app-layout">
              <Content className="app-content">
                <Admin />
              </Content>
              <Footer className="app-footer">
                追光小慢侠 ©{new Date().getFullYear()}
              </Footer>
            </Layout>
          } />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
