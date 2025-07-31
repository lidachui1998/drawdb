import { Button, Card } from "@douyinfe/semi-ui";

export default function New({ selectedTemplateId, setSelectedTemplateId }) {
  const templates = [
    { id: -1, name: "空白图表", description: "从头开始创建" },
    { id: 0, name: "电商系统", description: "包含用户、订单、商品等表" },
    { id: 1, name: "博客系统", description: "包含文章、用户、评论等表" },
  ];

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer border-2 ${
              selectedTemplateId === template.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedTemplateId(template.id)}
          >
            <div className="p-4">
              <h3 className="font-semibold">{template.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}