import { TextArea, Select } from "@douyinfe/semi-ui";

export default function ImportSource({ importSource, setImportSource, importDb }) {
  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          数据库类型
        </label>
        <Select
          value={importDb}
          placeholder="选择数据库类型"
          className="w-full"
        >
          <Select.Option value="mysql">MySQL</Select.Option>
          <Select.Option value="postgresql">PostgreSQL</Select.Option>
          <Select.Option value="sqlite">SQLite</Select.Option>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          SQL 代码
        </label>
        <TextArea
          value={importSource.src}
          onChange={(value) => setImportSource(prev => ({ ...prev, src: value }))}
          placeholder="粘贴您的 SQL 代码..."
          rows={10}
          className="w-full"
        />
      </div>
    </div>
  );
}