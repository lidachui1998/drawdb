import { SideSheet } from "@douyinfe/semi-ui";
import { SIDESHEET } from "../../../data/constants";

export default function Sidesheet({ type, onClose }) {
  const getTitle = () => {
    switch (type) {
      case SIDESHEET.ABOUT:
        return "关于 DrawDB";
      case SIDESHEET.SHORTCUTS:
        return "快捷键";
      default:
        return "";
    }
  };

  const getContent = () => {
    switch (type) {
      case SIDESHEET.ABOUT:
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">DrawDB</h2>
            <p className="mb-4">
              DrawDB 是一个免费、简单、直观的数据库设计工具和 SQL 生成器。
            </p>
            <p className="mb-4">
              使用 DrawDB，您可以轻松创建数据库图表，设计表结构，定义关系，并生成 SQL 脚本。
            </p>
            <div className="mt-6">
              <h3 className="font-semibold mb-2">功能特性：</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>可视化数据库设计</li>
                <li>支持多种数据库类型</li>
                <li>实时协作</li>
                <li>SQL 脚本生成</li>
                <li>导入导出功能</li>
              </ul>
            </div>
          </div>
        );
      case SIDESHEET.SHORTCUTS:
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">快捷键</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">文件操作</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>保存</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+S</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>打开</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+O</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>导入</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+I</kbd>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">编辑操作</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>撤销</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+Z</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>重做</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+Y</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>复制</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+C</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>粘贴</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+V</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>剪切</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+X</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>复制元素</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+D</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>删除</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Delete</kbd>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">视图操作</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>放大</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+=</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>缩小</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+-</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>重置视图</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+0</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <SideSheet
      title={getTitle()}
      visible={type !== SIDESHEET.NONE}
      onCancel={onClose}
      width={400}
    >
      {getContent()}
    </SideSheet>
  );
}