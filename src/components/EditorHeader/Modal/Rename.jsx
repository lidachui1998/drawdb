import { Input } from "@douyinfe/semi-ui";

export default function Rename({ title, setTitle }) {
  return (
    <div className="p-4">
      <Input
        value={title}
        onChange={(v) => setTitle(v)}
        placeholder="输入图表名称"
        autoFocus
      />
    </div>
  );
}