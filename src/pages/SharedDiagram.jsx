import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Spin, Button, Dropdown } from "@douyinfe/semi-ui";
import { IconDownload } from "@douyinfe/semi-icons";
import { getPublicDiagram } from "../api/diagrams";
import InteractiveCanvas from "../components/InteractiveCanvas";
import { toPng, toJpeg, toSvg } from "html-to-image";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import { exportSQL } from "../utils/exportSQL";
import { jsonToDocumentation } from "../utils/exportAs/documentation";
import { databases } from "../data/databases";

export default function SharedDiagram() {
  const { shareId } = useParams();
  const [diagram, setDiagram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSharedDiagram = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPublicDiagram(shareId);
  
      setDiagram(data);
    } catch (error) {
      console.error("Failed to load shared diagram:", error);
      setError("无法加载分享的图表，可能链接已失效或图表不存在");
    } finally {
      setLoading(false);
    }
  }, [shareId]);

  useEffect(() => {
    if (shareId) {
      loadSharedDiagram();
    }
  }, [shareId, loadSharedDiagram]);

  // Export functions
  const exportAsPNG = useCallback(() => {
    const canvas = document.getElementById("shared-canvas");
    if (canvas) {
      toPng(canvas).then(function (dataUrl) {
        const link = document.createElement('a');
        link.download = `${diagram.title || 'diagram'}.png`;
        link.href = dataUrl;
        link.click();
      });
    }
  }, [diagram]);

  const exportAsJPEG = useCallback(() => {
    const canvas = document.getElementById("shared-canvas");
    if (canvas) {
      toJpeg(canvas, { quality: 0.95 }).then(function (dataUrl) {
        const link = document.createElement('a');
        link.download = `${diagram.title || 'diagram'}.jpeg`;
        link.href = dataUrl;
        link.click();
      });
    }
  }, [diagram]);

  const exportAsSVG = useCallback(() => {
    const canvas = document.getElementById("shared-canvas");
    if (canvas) {
      const filter = (node) => node.tagName !== "i";
      toSvg(canvas, { filter: filter }).then(function (dataUrl) {
        const link = document.createElement('a');
        link.download = `${diagram.title || 'diagram'}.svg`;
        link.href = dataUrl;
        link.click();
      });
    }
  }, [diagram]);

  const exportAsPDF = useCallback(() => {
    const canvas = document.getElementById("shared-canvas");
    if (canvas) {
      toJpeg(canvas).then(function (dataUrl) {
        const doc = new jsPDF("l", "px", [
          canvas.offsetWidth,
          canvas.offsetHeight,
        ]);
        doc.addImage(
          dataUrl,
          "jpeg",
          0,
          0,
          canvas.offsetWidth,
          canvas.offsetHeight,
        );
        doc.save(`${diagram.title || 'diagram'}.pdf`);
      });
    }
  }, [diagram]);

  const exportAsJSON = useCallback(() => {
    const data = JSON.stringify(diagram, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    saveAs(blob, `${diagram.title || 'diagram'}.json`);
  }, [diagram]);

  // SQL导出功能
  const exportAsSQL = useCallback((dbType) => {
    try {
      
      // Create a diagram object with the database type
      // Note: toMySQL expects 'references' not 'relationships'
      const diagramWithDb = {
        ...diagram,
        database: dbType,
        types: diagram.types || [],
        enums: diagram.enums || [],
        references: diagram.relationships || []
      };
      
      const sqlData = exportSQL(diagramWithDb);
      const blob = new Blob([sqlData], { type: 'text/plain' });
      saveAs(blob, `${diagram.title || 'diagram'}_${dbType}.sql`);
    } catch (error) {
      console.error('SQL导出失败:', error);
      console.error('Error details:', error.stack);
    }
  }, [diagram]);

  // Markdown文档导出功能
  const exportAsMarkdown = useCallback(() => {
    try {
      const markdownData = jsonToDocumentation({
        tables: diagram.tables || [],
        relationships: diagram.relationships || [],
        notes: diagram.notes || [],
        subjectAreas: diagram.subjectAreas || diagram.areas || [],
        database: diagram.database || 'generic',
        title: diagram.title || '数据库文档',
        ...(databases[diagram.database || 'generic']?.hasTypes && { types: diagram.types || [] }),
        ...(databases[diagram.database || 'generic']?.hasEnums && { enums: diagram.enums || [] }),
      });
      const blob = new Blob([markdownData], { type: 'text/markdown' });
      saveAs(blob, `${diagram.title || 'diagram'}_documentation.md`);
    } catch (error) {
      console.error('Markdown导出失败:', error);
    }
  }, [diagram]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-600">加载图表中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={() => window.location.href = "/"}>
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  if (!diagram) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-500 mb-4">图表不存在</div>
          <Button onClick={() => window.location.href = "/"}>
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {diagram.title || "未命名图表"}
              </h1>
              <p className="text-sm text-gray-500">
                只读模式 - 此图表为分享查看
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Dropdown
                render={
                  <Dropdown.Menu>
                    <Dropdown.Title>图像格式</Dropdown.Title>
                    <Dropdown.Item onClick={exportAsPNG}>
                      导出为 PNG
                    </Dropdown.Item>
                    <Dropdown.Item onClick={exportAsJPEG}>
                      导出为 JPEG
                    </Dropdown.Item>
                    <Dropdown.Item onClick={exportAsSVG}>
                      导出为 SVG
                    </Dropdown.Item>
                    <Dropdown.Item onClick={exportAsPDF}>
                      导出为 PDF
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Title>数据格式</Dropdown.Title>
                    <Dropdown.Item onClick={exportAsJSON}>
                      导出为 JSON
                    </Dropdown.Item>
                    <Dropdown.Item onClick={exportAsMarkdown}>
                      导出为 Markdown 文档
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Title>SQL 脚本</Dropdown.Title>
                    <Dropdown.Item onClick={() => exportAsSQL('mysql')}>
                      MySQL
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => exportAsSQL('postgresql')}>
                      PostgreSQL
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => exportAsSQL('sqlite')}>
                      SQLite
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => exportAsSQL('mariadb')}>
                      MariaDB
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => exportAsSQL('mssql')}>
                      SQL Server
                    </Dropdown.Item>
                  </Dropdown.Menu>
                }
                trigger="click"
              >
                <Button icon={<IconDownload />}>
                  导出
                </Button>
              </Dropdown>
              <Button 
                theme="solid" 
                onClick={() => window.location.href = "/"}
              >
                创建我的图表
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1" style={{ height: 'calc(100vh - 140px)' }}>
        <div 
          id="shared-canvas" 
          className="w-full h-full bg-white relative"
          style={{ minHeight: '600px' }}
        >

          <InteractiveCanvas
            diagram={diagram}
            tables={diagram.tables || []}
            relationships={diagram.relationships || []}
            readonly={true}
          />
          {(!diagram.tables || diagram.tables.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 pointer-events-none">
              <div className="text-center">
                <div className="text-lg mb-2">📊</div>
                <div>此图表暂无内容或正在加载中...</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            由 DrawDB 提供支持 - 
            <a 
              href="/" 
              className="text-blue-600 hover:text-blue-800 ml-1"
            >
              创建你自己的数据库图表
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}