import { useState, useEffect } from "react";
import { List, Tag, Empty } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { useDiagram, useUndoRedo } from "../../../hooks";

export default function Timeline() {
  const { t } = useTranslation();
  const { tables, relationships, notes, areas } = useDiagram();
  const { undoStack } = useUndoRedo();
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    // Generate timeline from undo stack and current state
    const events = [];
    
    // Add creation events for current elements
    tables.forEach(table => {
      events.push({
        id: `table-${table.id}`,
        type: 'create',
        element: 'table',
        name: table.name,
        timestamp: new Date(),
        description: `创建了表 "${table.name}"`
      });
    });

    relationships.forEach((rel, index) => {
      events.push({
        id: `relationship-${index}`,
        type: 'create',
        element: 'relationship',
        name: `关系 ${index + 1}`,
        timestamp: new Date(),
        description: `创建了表关系`
      });
    });

    notes.forEach((note, index) => {
      events.push({
        id: `note-${index}`,
        type: 'create',
        element: 'note',
        name: `备注 ${index + 1}`,
        timestamp: new Date(),
        description: `添加了备注`
      });
    });

    areas.forEach((area, index) => {
      events.push({
        id: `area-${index}`,
        type: 'create',
        element: 'area',
        name: area.name || `区域 ${index + 1}`,
        timestamp: new Date(),
        description: `创建了主题区域 "${area.name || `区域 ${index + 1}`}"`
      });
    });

    // Sort by timestamp (most recent first)
    events.sort((a, b) => b.timestamp - a.timestamp);
    
    setTimeline(events);
  }, [tables, relationships, notes, areas, undoStack]);

  const getElementIcon = (element) => {
    switch (element) {
      case 'table':
        return '📋';
      case 'relationship':
        return '🔗';
      case 'note':
        return '📝';
      case 'area':
        return '📦';
      default:
        return '📄';
    }
  };

  const getElementColor = (element) => {
    switch (element) {
      case 'table':
        return 'blue';
      case 'relationship':
        return 'green';
      case 'note':
        return 'yellow';
      case 'area':
        return 'purple';
      default:
        return 'grey';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    
    const days = Math.floor(hours / 24);
    return `${days}天前`;
  };

  if (timeline.length === 0) {
    return (
      <div className="p-4">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          title="暂无操作记录"
          description="开始编辑图表后，操作历史将显示在这里"
        />
      </div>
    );
  }

  return (
    <div className="sidesheet-theme">
      <List
        dataSource={timeline}
        renderItem={(item) => (
          <List.Item
            style={{ paddingLeft: "18px", paddingRight: "18px" }}
            className="hover-1"
          >
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="mr-2 text-lg">{getElementIcon(item.element)}</span>
                  <span className="font-medium">{item.name}</span>
                  <Tag 
                    color={getElementColor(item.element)} 
                    size="small" 
                    className="ml-2"
                  >
                    {t(item.element)}
                  </Tag>
                </div>
                <span className="text-xs text-gray-500">
                  {formatTime(item.timestamp)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {item.description}
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
}