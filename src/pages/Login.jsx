import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, Typography, Toast, Spin } from '@douyinfe/semi-ui';
import { IconMail, IconKey, IconArrowLeft } from '@douyinfe/semi-icons';
import icon from '../assets/icon-dark.png';

const { Title, Text } = Typography;

export default function Login() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, verify } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('请输入邮箱地址');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await login(email);
      setEmailSent(true);
      Toast.success({ content: '验证码已发送到您的邮箱' });
    } catch (error) {
      console.error('Login failed:', error);
      setError('发送验证码失败，请稍后重试');
      Toast.error({ content: '发送验证码失败' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code) {
      setError('请输入验证码');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await verify(email, code);
      Toast.success({ content: '登录成功' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Verification failed:', error);
      setError('验证码错误或已过期');
      Toast.error({ content: '验证失败' });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setEmailSent(false);
    setCode('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={icon} alt="DrawDB" className="w-16 h-16 mx-auto mb-4" />
          <Title heading={2} className="text-gray-800">
            欢迎使用 DrawDB
          </Title>
          <Text type="secondary" className="text-lg">
            数据库设计协作平台
          </Text>
        </div>

        <Card className="shadow-lg border-0">
          <div className="p-6">
            {!emailSent ? (
              <>
                <Title heading={4} className="text-center mb-6">
                  邮箱登录
                </Title>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Text className="block mb-2 font-medium">
                      邮箱地址
                    </Text>
                    <Input
                      type="email"
                      value={email}
                      onChange={(value) => setEmail(value)}
                      placeholder="请输入您的邮箱地址"
                      prefix={<IconMail />}
                      size="large"
                      className="w-full"
                      disabled={loading}
                    />
                  </div>
                  
                  {error && (
                    <div className="text-red-500 text-sm text-center">
                      {error}
                    </div>
                  )}
                  
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    className="w-full"
                    loading={loading}
                    disabled={!email || loading}
                  >
                    {loading ? '发送中...' : '发送验证码'}
                  </Button>
                </form>
                
                <div className="mt-6 text-center">
                  <Text type="secondary" size="small">
                    我们将向您的邮箱发送6位数验证码
                  </Text>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <Title heading={4}>
                    输入验证码
                  </Title>
                  <Text type="secondary" className="mt-2">
                    验证码已发送至
                  </Text>
                  <Text strong className="text-blue-600 block mt-1">
                    {email}
                  </Text>
                </div>
                
                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <Text className="block mb-2 font-medium">
                      6位验证码
                    </Text>
                    <Input
                      type="text"
                      value={code}
                      onChange={(value) => setCode(value)}
                      placeholder="请输入6位验证码"
                      prefix={<IconKey />}
                      size="large"
                      className="w-full text-center text-lg tracking-widest"
                      maxLength={6}
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                  
                  {error && (
                    <div className="text-red-500 text-sm text-center">
                      {error}
                    </div>
                  )}
                  
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    className="w-full"
                    loading={loading}
                    disabled={!code || code.length !== 6 || loading}
                  >
                    {loading ? '验证中...' : '登录'}
                  </Button>
                  
                  <Button
                    type="tertiary"
                    size="large"
                    className="w-full"
                    onClick={handleBackToEmail}
                    disabled={loading}
                    icon={<IconArrowLeft />}
                  >
                    返回修改邮箱
                  </Button>
                </form>
                
                <div className="mt-6 text-center">
                  <Text type="secondary" size="small">
                    验证码有效期为10分钟，请及时输入
                  </Text>
                </div>
              </>
            )}
          </div>
        </Card>
        
        <div className="text-center mt-6">
          <Text type="secondary" size="small">
            首次使用将自动创建账户
          </Text>
        </div>
      </div>
    </div>
  );
}
