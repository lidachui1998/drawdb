import { Button, Upload, Banner } from "@douyinfe/semi-ui";
import { IconUpload } from "@douyinfe/semi-icons";

export default function ImportDiagram({ importData, setImportData, error, setError, overwriteDiagram }) {
  const handleFileUpload = (fileList) => {
    const file = fileList[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setImportData(data);
          setError({ type: "NONE", message: "" });
        } catch (err) {
          setError({ type: "ERROR", message: "无效的JSON文件" });
        }
      };
      reader.readAsText(file.fileInstance);
    }
  };

  return (
    <div className="p-4">
      <Upload
        action=""
        accept=".json"
        beforeUpload={() => false}
        onChange={({ fileList }) => handleFileUpload(fileList)}
        dragable
      >
        <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
          <IconUpload size="extra-large" className="mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">拖拽文件到此处或点击上传</p>
          <p className="text-sm text-gray-500 mt-2">支持 .json 格式文件</p>
        </div>
      </Upload>
      
      {error.type === "ERROR" && (
        <Banner type="danger" description={error.message} className="mt-4" />
      )}
      
      {importData && (
        <div className="mt-4">
          <Banner type="success" description="文件解析成功" />
          <Button
            type="primary"
            className="mt-2"
            onClick={overwriteDiagram}
          >
            导入图表
          </Button>
        </div>
      )}
    </div>
  );
}