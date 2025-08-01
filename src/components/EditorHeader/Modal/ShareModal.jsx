import { useState, useContext, useEffect, useCallback } from "react";
import { Button, Input, Toast, Tabs, TabPane, Switch, List, Tag } from "@douyinfe/semi-ui";
import { IconLink, IconMail, IconDelete } from "@douyinfe/semi-icons";

import { IdContext } from "../../Workspace";
import { shareDiagram, generatePublicLink, removePublicLink } from "../../../api/diagrams";
import { MODAL } from "../../../data/constants";

export default function ShareModal({ setModal }) {
  const { diagramId } = useContext(IdContext);
  const [email, setEmail] = useState("");
  const [publicLinkEnabled, setPublicLinkEnabled] = useState(false);
  const [publicLink, setPublicLink] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadSharingSettings = useCallback(async () => {
    try {
      // Load existing collaborators
      const collaboratorsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/diagrams/${diagramId}/collaborators`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (collaboratorsResponse.ok) {
        const collaboratorsData = await collaboratorsResponse.json();
        setCollaborators(collaboratorsData);
      }
      
      // Load diagram info to check public sharing status
      const diagramResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/diagrams/${diagramId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (diagramResponse.ok) {
        const diagramData = await diagramResponse.json();
        if (diagramData.public_share_enabled && diagramData.public_share_id) {
          setPublicLinkEnabled(true);
          setPublicLink(`${window.location.origin}/share/${diagramData.public_share_id}`);
        }
      }
    } catch (error) {
      console.error("Failed to load sharing settings:", error);
    }
  }, [diagramId]);

  useEffect(() => {
    // Load existing sharing settings
    if (diagramId) {
      loadSharingSettings();
    }
  }, [diagramId, loadSharingSettings]);

  const handleGeneratePublicLink = async () => {
    if (!diagramId) return;
    
    setLoading(true);
    try {
      if (publicLinkEnabled) {
        // Remove public link
        await removePublicLink(diagramId);
        setPublicLink("");
        setPublicLinkEnabled(false);
        Toast.success("公开链接已移除");
      } else {
        // Generate public link
        const response = await generatePublicLink(diagramId);
        const shareUrl = `${window.location.origin}/share/${response.shareId}`;
        setPublicLink(shareUrl);
        setPublicLinkEnabled(true);
        Toast.success("公开链接已生成");
      }
    } catch (error) {
      console.error("Public link operation failed:", error);
      if (error.response?.status === 403) {
        Toast.error("只有图表所有者可以生成公开链接");
      } else {
        Toast.error("操作失败，请重试");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollaborator = async () => {
    if (!email || !diagramId) return;
    
    setLoading(true);
    try {
      await shareDiagram(diagramId, email);
      setCollaborators(prev => [...prev, { email, role: "editor", status: "accepted" }]);
      setEmail("");
      Toast.success(`已成功邀请 ${email} 作为协作者`);
    } catch (error) {
      console.error("Collaborator invitation failed:", error);
      if (error.response?.status === 404) {
        Toast.error("用户不存在，请确认邮箱地址正确");
      } else if (error.response?.status === 403) {
        Toast.error("只有图表所有者可以邀请协作者");
      } else {
        Toast.error("邀请失败，请重试");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyPublicLink = () => {
    if (!publicLink) return;
    
    navigator.clipboard.writeText(publicLink).then(() => {
      Toast.success("链接已复制到剪贴板");
    }).catch(() => {
      Toast.error("复制失败");
    });
  };

  return (
    <div className="w-full">
      <Tabs type="line">
        <TabPane tab="公开分享" itemKey="public">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium">公开链接</h3>
                <p className="text-sm text-gray-500 mt-1">
                  任何人都可以通过此链接查看图表，但无法编辑
                </p>
              </div>
              <Switch
                checked={publicLinkEnabled}
                onChange={handleGeneratePublicLink}
                loading={loading}
              />
            </div>
            
            {publicLinkEnabled && publicLink && (
              <div className="mt-4">
                <div className="flex gap-2">
                  <Input
                    value={publicLink}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    icon={<IconLink />}
                    onClick={copyPublicLink}
                  >
                    复制链接
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  此链接允许任何人查看图表，但不能进行编辑
                </p>
              </div>
            )}
            

          </div>
        </TabPane>
        
        <TabPane tab="协作者" itemKey="collaborators">
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">邀请协作者</h3>
              <p className="text-sm text-gray-500 mb-4">
                邀请其他用户编辑此图表
              </p>
              
              <div className="flex gap-2">
                <Input
                  placeholder="输入协作者的邮箱地址"
                  value={email}
                  onChange={(v) => setEmail(v)}
                  onEnterPress={handleAddCollaborator}
                  className="flex-1"
                />
                <Button
                  theme="solid"
                  icon={<IconMail />}
                  onClick={handleAddCollaborator}
                  loading={loading}
                  disabled={!email}
                >
                  邀请
                </Button>
              </div>
            </div>
            
            {collaborators.length > 0 && (
              <div>
                <h4 className="text-md font-medium mb-2">当前协作者</h4>
                <List
                  dataSource={collaborators}
                  renderItem={(item) => (
                    <List.Item
                      main={
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <span>{item.email}</span>
                            <Tag color="blue" size="small" className="ml-2">
                              {item.role === "editor" ? "编辑者" : "查看者"}
                            </Tag>
                          </div>
                          <Button
                            type="danger"
                            theme="borderless"
                            icon={<IconDelete />}
                            size="small"
                            onClick={async () => {
                              try {
                                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/diagrams/${diagramId}/collaborators/${encodeURIComponent(item.email)}`, {
                                  method: 'DELETE',
                                  headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                  }
                                });
                                
                                if (response.ok) {
                                  setCollaborators(prev => 
                                    prev.filter(c => c.email !== item.email)
                                  );
                                  Toast.success(`已移除协作者 ${item.email}`);
                                } else {
                                  Toast.error("移除协作者失败");
                                }
                              } catch (error) {
                                console.error("Failed to remove collaborator:", error);
                                Toast.error("移除协作者失败");
                              }
                            }}
                          />
                        </div>
                      }
                    />
                  )}
                />
              </div>
            )}
          </div>
        </TabPane>
      </Tabs>
      
      <div className="flex justify-end gap-2 mt-4 p-4 border-t">
        <Button onClick={() => setModal(MODAL.NONE)}>
          关闭
        </Button>
      </div>
    </div>
  );
}