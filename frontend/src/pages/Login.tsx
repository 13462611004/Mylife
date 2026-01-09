import React, { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { LockOutlined, TrophyOutlined, FireOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/axios';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values: { password: string }) => {
    setLoading(true);
    try {
      await apiClient.post('/api/admin/login/', {
        password: values.password,
      });
      message.success('登录成功');
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin');
    } catch (error: any) {
      message.error(error.response?.data?.error || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ 
        position: 'absolute', 
        top: '10%', 
        left: '10%', 
        fontSize: '48px', 
        opacity: 0.1,
        color: 'white'
      }}>
        <FireOutlined />
      </div>
      <div style={{ 
        position: 'absolute', 
        bottom: '10%', 
        right: '10%', 
        fontSize: '48px', 
        opacity: 0.1,
        color: 'white'
      }}>
        <TrophyOutlined />
      </div>
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <TrophyOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <span>追光小慢侠 - 管理系统</span>
          </div>
        }
        style={{ 
          width: 400, 
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          border: 'none'
        }}
      >
        <Form
          onFinish={handleLogin}
          layout="vertical"
        >
          <Form.Item
            name="password"
            label="管理员密码"
            rules={[{ required: true, message: '请输入管理员密码' }]}
            style={{ marginBottom: '24px' }}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#1890ff' }} />}
              placeholder="请输入密码"
              autoComplete="current-password"
              size="large"
              style={{ 
                height: '40px',
                borderRadius: '8px',
                border: '1px solid #d9d9d9'
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block
              size="large"
              style={{ 
                height: '40px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              登录管理系统
            </Button>
          </Form.Item>
        </Form>
        <div style={{ 
          textAlign: 'center', 
          marginTop: '16px', 
          color: '#666',
          fontSize: '12px'
        }}>
          <p>默认密码: admin123</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
