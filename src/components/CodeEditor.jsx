import { Editor } from "@monaco-editor/react";

export default function CodeEditor({ code, setCode, language }) {
  const getMonacoLanguage = (lang) => {
    switch (lang) {
      case "sql":
        return "sql";
      case "json":
        return "json";
      case "dbml":
        return "sql"; // DBML使用SQL语法高亮
      case "markdown":
        return "markdown";
      default:
        return "plaintext";
    }
  };

  return (
    <div className="h-[500px] border border-gray-200 rounded">
      <Editor
        height="100%"
        language={getMonacoLanguage(language)}
        value={code}
        onChange={(value) => setCode && setCode(value)}
        theme="vs"
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: "on",
          roundedSelection: false,
          scrollbar: {
            vertical: "visible",
            horizontal: "visible",
          },
          wordWrap: "on",
          readOnly: !setCode, // 如果没有setCode函数，则为只读模式
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
        }}
      />
    </div>
  );
}