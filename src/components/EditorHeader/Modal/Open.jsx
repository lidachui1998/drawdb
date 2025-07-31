import { useEffect } from "react";
import { List, Button, Empty, Spin } from "@douyinfe/semi-ui";
import { IconFile, IconCalendar } from "@douyinfe/semi-icons";

export default function Open({ diagrams, loadDiagrams, selectedDiagramId, setSelectedDiagramId }) {
  useEffect(() => {
    loadDiagrams();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  if (!diagrams) {
    return (
      <div className="flex justify-center p-8">
        <Spin size="large" />
      </div>
    );
  }

  if (diagrams.length === 0) {
    return (
      <div className="p-8">
        <Empty
          title="暂无图表"
          description="您还没有创建任何图表"
          image={<IconFile size="extra-large" />}
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <List
        dataSource={diagrams}
        renderItem={(diagram) => (
          <List.Item
            className={`cursor-pointer p-4 rounded-lg border-2 mb-2 ${
              selectedDiagramId === diagram.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedDiagramId(diagram.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{diagram.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <IconCalendar className="mr-1" />
                  创建于 {formatDate(diagram.created_at)}
                </div>
                {diagram.updated_at !== diagram.created_at && (
                  <div className="flex items-center text-sm text-gray-500">
                    <IconCalendar className="mr-1" />
                    更新于 {formatDate(diagram.updated_at)}
                  </div>
                )}
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
}