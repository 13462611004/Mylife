import React from 'react';
import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined, TrophyOutlined, BarChartOutlined, MessageOutlined } from '@ant-design/icons';
import '../../styles/Navigation.css';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminPage = location.pathname === '/admin';

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/admin/login');
  };

  return (
    <Menu 
      mode="horizontal" 
      style={{ marginBottom: '24px' }}
      className="navigation-menu"
    >
      <Menu.Item key="home" icon={<HomeOutlined />} onClick={() => navigate('/home')}>
        <span className="nav-item-text">关于</span>
      </Menu.Item>
      <Menu.Item key="marathon" icon={<TrophyOutlined />} onClick={() => navigate('/marathon')}>
        <span className="nav-item-text">长路未央</span>
      </Menu.Item>
      <Menu.Item key="moments" icon={<MessageOutlined />} onClick={() => navigate('/moments')}>
        <span className="nav-item-text">春夏秋冬</span>
      </Menu.Item>
      {isAdminPage && (
        <Menu.Item key="admin" icon={<BarChartOutlined />} onClick={() => navigate('/admin')} style={{ marginLeft: 'auto' }}>
          <span className="nav-item-text">管理界面</span>
        </Menu.Item>
      )}
      {isAdminPage && (
        <Menu.Item key="logout" onClick={handleLogout}>
          <span className="nav-item-text">退出登录</span>
        </Menu.Item>
      )}
    </Menu>
  );
};

export default Navigation;
