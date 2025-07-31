import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Card, 
  Typography, 
  List, 
  Toast, 
  Spin, 
  Empty,
  Popconfirm,
  Space
} from '@douyinfe/semi-ui';
import { 
  IconPlus, 
  IconEdit, 
  IconDelete, 
  IconShareStroked, 
  IconCalendar 
} from '@douyinfe/semi-icons';
import { getDiagrams, createDiagram, deleteDiagram } from '../api/diagrams';
import icon from '../assets/icon-dark.png';

const { Title, Text } = Typography;

export default function Dashboard() {
  const [diagrams, setDiagrams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDiagrams();
  }, []);

  const loadDiagrams = async () => {
    try {
      setLoading(true);
      const userDiagrams = await getDiagrams();
      setDiagrams(userDiagrams);
    } catch (error) {
      console.error('Failed to load diagrams:', error);
      Toast.error({ content: '加载图表失败' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiagram = async () => {
    try {
      const newDiagram = await createDiagram({
        name: '新建图表',
        content: {
          tables: [],
          relationships: [],
          notes: [],
          areas: []
        }
      });
      navigate(`/editor?id=${newDiagram.id}`);
    } catch (error) {
      console.error('Failed to create diagram:', error);
      Toast.error({ content: '创建图表失败' });
    }
  };

  const handleDeleteDiagram = async (id) => {
    try {
      await deleteDiagram(id);
      Toast.success({ content: '图表已删除' });
      loadDiagrams();
    } catch (error) {
      console.error('Failed to delete diagram:', error);
      Toast.error({ content: '删除图表失败' });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src={icon} alt="DrawDB" className="w-8 h-8 mr-3" />
              <Title heading={3} className="!mb-0">
                DrawDB
              </Title>
            </div>
            <div className="flex items-center space-x-4">
              <Text type="secondary">
                欢迎，{user?.email}
              </Text>
              <Button 
                type="tertiary" 
                onClick={logout}
              >
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Title heading={2}>
              我的图表
            </Title>
            <Text type="secondary">
              管理您的数据库设计图表
            </Text>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<IconPlus />}
            onClick={handleCreateDiagram}
          >
            新建图表
          </Button>
        </div>

        {diagrams.length === 0 ? (
          <Card className="text-center py-16">
            <Empty
              title="暂无图表"
              description="创建您的第一个数据库设计图表"
              image={<IconEdit size="extra-large" />}
            >
              <Button
                type="primary"
                size="large"
                icon={<IconPlus />}
                onClick={handleCreateDiagram}
              >
                创建图表
              </Button>
            </Empty>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diagrams.map((diagram) => (
              <Card
                key={diagram.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/editor?id=${diagram.id}`)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <Title heading={4} className="!mb-0 truncate">
                      {diagram.name}
                    </Title>
                    <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                      <Popconfirm
                        title="确认删除"
                        content="删除后无法恢复，确定要删除这个图表吗？"
                        onConfirm={() => handleDeleteDiagram(diagram.id)}
                      >
                        <Button
                          type="tertiary"
                          size="small"
                          icon={<IconDelete />}
                          theme="borderless"
                        />
                      </Popconfirm>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <IconCalendar className="mr-2" />
                      <Text type="secondary" size="small">
                        创建于 {formatDate(diagram.created_at)}
                      </Text>
                    </div>
                    {diagram.updated_at !== diagram.created_at && (
                      <div className="flex items-center">
                        <IconEdit className="mr-2" />
                        <Text type="secondary" size="small">
                          更新于 {formatDate(diagram.updated_at)}
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}