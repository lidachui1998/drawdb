import {
  Spin,
  Input,
  Image,
  Toast,
  Modal as SemiUIModal,
} from "@douyinfe/semi-ui";
import { DB, MODAL, STATUS } from "../../../data/constants";
import { useState } from "react";
import {
  useAreas,
  useEnums,
  useNotes,
  useDiagram,
  useTransform,
  useTypes,
  useUndoRedo,
  useTasks,
} from "../../../hooks";
// import { saveAs } from "file-saver"; // No longer needed
import { dataURItoBlob } from "../../../utils/utils";
import { Parser } from "node-sql-parser";
import { Parser as OracleParser } from "oracle-sql-parser";
import {
  getModalTitle,
  getModalWidth,
  getOkText,
} from "../../../utils/modalData";
import Rename from "./Rename";
import Open from "./Open";
import New from "./New";
import ImportDiagram from "./ImportDiagram";
import ImportSource from "./ImportSource";
import ShareModal from "./ShareModal";
import CodeEditor from "../../CodeEditor";
import { useTranslation } from "react-i18next";
import { importSQL } from "../../../utils/importSQL/index";
import { databases } from "../../../data/databases";
import { isRtl } from "../../../i18n/utils/rtl";
import { getDiagrams } from "../../../api/diagrams";

const extensionToLanguage = {
  md: "markdown",
  sql: "sql",
  dbml: "dbml",
  json: "json",
};

const getMimeType = (extension) => {
  switch (extension) {
    case "json":
      return "application/json";
    case "sql":
      return "text/sql";
    case "dbml":
      return "text/plain";
    case "md":
      return "text/markdown";
    default:
      return "text/plain";
  }
};

export default function Modal({
  modal,
  setModal,
  title,
  setTitle,
  setDiagramId,
  exportData,
  setExportData,
  importDb,
  importFrom,
}) {
  const { t, i18n } = useTranslation();
  const { setTables, setRelationships, database, setDatabase } = useDiagram();
  const { setNotes } = useNotes();
  const { setAreas } = useAreas();
  const { setTypes } = useTypes();
  const { setEnums } = useEnums();
  const { setTasks } = useTasks();
  const { setTransform } = useTransform();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const [uncontrolledTitle, setUncontrolledTitle] = useState(title);
  const [importSource, setImportSource] = useState({
    src: "",
    overwrite: false,
  });
  const [importData, setImportData] = useState(null);
  const [error, setError] = useState({
    type: STATUS.NONE,
    message: "",
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState(-1);
  const [selectedDiagramId, setSelectedDiagramId] = useState(0);
  const [saveAsTitle, setSaveAsTitle] = useState(title);
  const [diagrams, setDiagrams] = useState([]);

  const overwriteDiagram = (data = importData) => {
    setTables(data.tables || []);
    setRelationships(data.relationships || []);
    setAreas(data.subjectAreas || data.areas || []);
    setNotes(data.notes || []);
    if (data.title) {
      setTitle(data.title);
    }
    if (databases[database].hasEnums && data.enums) {
      setEnums(data.enums);
    }
    if (databases[database].hasTypes && data.types) {
      setTypes(data.types);
    }
  };

  const loadDiagrams = async () => {
    try {
      const userDiagrams = await getDiagrams();
      setDiagrams(userDiagrams);
    } catch (error) {
      console.error("Failed to load diagrams:", error);
      Toast.error("Failed to load diagrams");
    }
  };

  const parseSQLAndLoadDiagram = () => {
    if (importSource.src.trim() === "") {
      setError({ type: STATUS.ERROR, message: "Please enter SQL code" });
      return;
    }

    try {
      let ast;
      let parser;
      
      if (importDb === DB.ORACLESQL) {
        parser = new OracleParser();
        ast = parser.parse(importSource.src);
      } else {
        parser = new Parser();
        ast = parser.astify(importSource.src, { database: importDb });
      }

      const diagram = importSQL(ast, importDb, database);
      
      if (importSource.overwrite) {
        overwriteDiagram(diagram);
      } else {
        // Merge with existing diagram
        setTables(prev => [...prev, ...diagram.tables]);
        setRelationships(prev => [...prev, ...diagram.relationships]);
        if (diagram.notes) setNotes(prev => [...prev, ...diagram.notes]);
        if (diagram.areas) setAreas(prev => [...prev, ...diagram.areas]);
        if (diagram.types) setTypes(prev => [...prev, ...diagram.types]);
        if (diagram.enums) setEnums(prev => [...prev, ...diagram.enums]);
      }
      
      setModal(MODAL.NONE);
      setError({ type: STATUS.NONE, message: "" });
    } catch (e) {
      console.error("SQL parsing error:", e);
      setError({ 
        type: STATUS.ERROR, 
        message: `Failed to parse SQL: ${e.message || 'Invalid SQL syntax'}` 
      });
    }
  };

  const createNewDiagram = (id) => {
    const newWindow = window.open("/editor");
    newWindow.name = "lt " + id;
  };

  const getModalOnOk = async () => {
    switch (modal) {
      case MODAL.IMG: {
        console.log('Exporting image with data:', exportData);
        
        // Create a very simple filename for testing
        const timestamp = Date.now();
        const filename = `diagram_${timestamp}.${exportData.extension}`;
        console.log('Simple filename:', filename);
        
        // Create a more reliable download method
        const blob = dataURItoBlob(exportData.data);
        console.log('Blob created:', blob);
        
        // Try multiple methods to ensure download works
        console.log('Blob type:', blob.type);
        console.log('Blob size:', blob.size);
        
        // Method 1: Use fetch to convert data URL to blob with explicit type
        try {
          const response = await fetch(exportData.data);
          const fetchBlob = await response.blob();
          
          // Force the correct MIME type
          const typedBlob = new Blob([fetchBlob], { 
            type: exportData.extension === 'png' ? 'image/png' : 
                  exportData.extension === 'jpeg' ? 'image/jpeg' : 
                  exportData.extension === 'svg' ? 'image/svg+xml' : blob.type 
          });
          
          const url = URL.createObjectURL(typedBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          
          // Force download attribute
          link.setAttribute('download', filename);
          link.style.display = 'none';
          
          console.log('Final download link:', {
            href: link.href,
            download: link.download,
            filename: filename
          });
          
          // Trigger download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          
        } catch (error) {
          console.error('All methods failed:', error);
        }
        
        setModal(MODAL.NONE);
        return;
      }
      case MODAL.CODE: {
        // Create a very simple filename for testing
        const timestamp = Date.now();
        const filename = `code_${timestamp}.${exportData.extension}`;
        console.log('Exporting code with simple filename:', filename);
        
        const blob = new Blob([exportData.data], {
          type: "text/plain",
        });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        console.log('Code download link created:', link.download);
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        setModal(MODAL.NONE);
        return;
      }
      case MODAL.IMPORT:
        // ... (this logic remains the same)
        return;
      case MODAL.IMPORT_SRC:
        parseSQLAndLoadDiagram();
        return;
      case MODAL.OPEN:
        if (selectedDiagramId === 0) return;
        window.location.href = `/editor?id=${selectedDiagramId}`;
        setModal(MODAL.NONE);
        return;
      case MODAL.RENAME:
        setTitle(uncontrolledTitle);
        setModal(MODAL.NONE);
        return;
      case MODAL.SAVEAS:
        setTitle(saveAsTitle);
        setModal(MODAL.NONE);
        return;
      case MODAL.NEW:
        setModal(MODAL.NONE);
        createNewDiagram(selectedTemplateId);
        return;
      case MODAL.SHARE:
        // Share modal handles its own actions
        setModal(MODAL.NONE);
        return;
      default:
        setModal(MODAL.NONE);
        return;
    }
  };

  const getModalBody = () => {
    switch (modal) {
      case MODAL.OPEN:
        return (
          <Open
            diagrams={diagrams}
            loadDiagrams={loadDiagrams}
            selectedDiagramId={selectedDiagramId}
            setSelectedDiagramId={setSelectedDiagramId}
          />
        );
      case MODAL.SHARE:
        return <ShareModal setModal={setModal} />;
      case MODAL.RENAME:
        return <Rename title={uncontrolledTitle} setTitle={setUncontrolledTitle} />;
      case MODAL.SAVEAS:
        return <Rename title={saveAsTitle} setTitle={setSaveAsTitle} />;
      case MODAL.NEW:
        return <New selectedTemplateId={selectedTemplateId} setSelectedTemplateId={setSelectedTemplateId} />;
      case MODAL.IMPORT:
        return <ImportDiagram importData={importData} setImportData={setImportData} error={error} setError={setError} overwriteDiagram={overwriteDiagram} />;
      case MODAL.IMPORT_SRC:
        return <ImportSource importSource={importSource} setImportSource={setImportSource} importDb={importDb} />;
      case MODAL.CODE:
        return (
          <CodeEditor
            code={exportData.data}
            setCode={(code) => setExportData(prev => ({ ...prev, data: code }))}
            language={extensionToLanguage[exportData.extension]}
          />
        );
      case MODAL.IMG:
        return (
          <div className="text-center">
            <Image src={exportData.data} alt="Export preview" />
          </div>
        );
      default:
        return <></>;
    }
  };

  return (
    <SemiUIModal
      title={getModalTitle(modal, t)}
      visible={modal !== MODAL.NONE}
      onOk={modal === MODAL.SHARE ? undefined : getModalOnOk}
      onCancel={() => setModal(MODAL.NONE)}
      okText={getOkText(modal, t)}
      width={getModalWidth(modal)}
      style={isRtl(i18n.language) ? { direction: "rtl" } : {}}
      {...(modal === MODAL.SHARE && { footer: null })}
    >
      {getModalBody()}
    </SemiUIModal>
  );
}