import { useState, useEffect, useCallback, createContext } from "react";
import ControlPanel from "./EditorHeader/ControlPanel";
import Canvas from "./EditorCanvas/Canvas";
import { CanvasContextProvider } from "../context/CanvasContext";
import SidePanel from "./EditorSidePanel/SidePanel";
import { DB, State } from "../data/constants";
import {
  useLayout,
  useSettings,
  useTransform,
  useDiagram,
  useUndoRedo,
  useAreas,
  useNotes,
  useTypes,
  useTasks,
  useSaveState,
  useEnums,
} from "../hooks";
import FloatingControls from "./FloatingControls";
import { Modal, Tag } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { databases } from "../data/databases";
import { isRtl } from "../i18n/utils/rtl";
import { useSearchParams } from "react-router-dom";
import { getDiagram, createDiagram, updateDiagram } from "../api/diagrams";

export const IdContext = createContext({ diagramId: null, setDiagramId: () => {} });

const SIDEPANEL_MIN_WIDTH = 384;

export default function WorkSpace() {
  const [diagramId, setDiagramId] = useState(null);
  const [title, setTitle] = useState("Untitled Diagram");
  const [resize, setResize] = useState(false);
  const [width, setWidth] = useState(SIDEPANEL_MIN_WIDTH);
  const [lastSaved, setLastSaved] = useState("");
  const [showSelectDbModal, setShowSelectDbModal] = useState(false);
  const [selectedDb, setSelectedDb] = useState("");
  const { layout } = useLayout();
  const { settings } = useSettings();
  const { types, setTypes } = useTypes();
  const { areas, setAreas } = useAreas();
  const { tasks, setTasks } = useTasks();
  const { notes, setNotes } = useNotes();
  const { saveState, setSaveState } = useSaveState();
  const { transform, setTransform } = useTransform();
  const { enums, setEnums } = useEnums();
  const {
    tables,
    relationships,
    setTables,
    setRelationships,
    database,
    setDatabase,
  } = useDiagram();
  const { undoStack, redoStack, setUndoStack, setRedoStack } = useUndoRedo();
  const { t, i18n } = useTranslation();
  let [searchParams, setSearchParams] = useSearchParams();

  const handleResize = (e) => {
    if (!resize) return;
    const w = isRtl(i18n.language) ? window.innerWidth - e.clientX : e.clientX;
    if (w > SIDEPANEL_MIN_WIDTH) setWidth(w);
  };

  const save = useCallback(async () => {
    if (saveState !== State.SAVING) return;

    const diagramData = {
      name: title,
      content: {
        tables,
        relationships,
        notes,
        areas,
        tasks,
        pan: transform.pan,
        zoom: transform.zoom,
        enums,
        types,
      },
      database,
    };

    try {
      if (diagramId) {
        await updateDiagram(diagramId, diagramData);
      } else {
        const newDiagram = await createDiagram(diagramData);
        setDiagramId(newDiagram.id);
        setSearchParams({ id: newDiagram.id });
      }
      setSaveState(State.SAVED);
      setLastSaved(new Date().toLocaleString());
    } catch (error) {
      console.error("Failed to save diagram:", error);
      setSaveState(State.ERROR);
    }
  }, [
    saveState,
    title,
    tables,
    relationships,
    notes,
    areas,
    tasks,
    transform,
    database,
    enums,
    types,
    diagramId,
    setSaveState,
    setSearchParams,
  ]);

  const load = useCallback(async () => {
    const id = searchParams.get("id");
    if (id) {
      try {
        const diagram = await getDiagram(id);
        const content = JSON.parse(diagram.content);
        setDiagramId(diagram.id);
        setTitle(diagram.name);
        setDatabase(diagram.database || DB.GENERIC);
        setTables(content.tables || []);
        setRelationships(content.relationships || []);
        setNotes(content.notes || []);
        setAreas(content.areas || []);
        setTasks(content.tasks || []);
        setTransform(content.transform || { pan: { x: 0, y: 0 }, zoom: 1 });
        setTypes(content.types || []);
        setEnums(content.enums || []);
        setUndoStack([]);
        setRedoStack([]);
      } catch (error) {
        console.error("Failed to load diagram:", error);
        setSaveState(State.FAILED_TO_LOAD);
        // Optionally, redirect to a new diagram or show an error message
        setSearchParams({});
      }
    } else {
      // No ID in URL, so it's a new diagram
      console.log("New diagram, database:", database);
      if (database === "") {
        console.log("Setting showSelectDbModal to true");
        setShowSelectDbModal(true);
      }
    }
  }, [
    searchParams,
    setDiagramId,
    setTitle,
    setDatabase,
    setTables,
    setRelationships,
    setNotes,
    setAreas,
    setTasks,
    setTransform,
    setTypes,
    setEnums,
    setUndoStack,
    setRedoStack,
    setSaveState,
    database,
    setSearchParams,
  ]);

  useEffect(() => {
    if (
      tables?.length === 0 &&
      areas?.length === 0 &&
      notes?.length === 0 &&
      types?.length === 0 &&
      tasks?.length === 0
    )
      return;

    if (settings.autosave) {
      setSaveState(State.SAVING);
    }
  }, [
    undoStack,
    redoStack,
    settings.autosave,
    tables?.length,
    areas?.length,
    notes?.length,
    types?.length,
    relationships?.length,
    tasks?.length,
    transform.zoom,
    title,
    setSaveState,
  ]);

  useEffect(() => {
    if (saveState === State.SAVING) {
      save();
    }
  }, [saveState, save]);

  useEffect(() => {
    document.title = "Editor | drawDB";
    load();
  }, [load]);

  return (
    <div className="h-full flex flex-col overflow-hidden theme">
      <IdContext.Provider value={{ diagramId, setDiagramId }}>
        <ControlPanel
          diagramId={diagramId}
          setDiagramId={setDiagramId}
          title={title}
          setTitle={setTitle}
          lastSaved={lastSaved}
          setLastSaved={setLastSaved}
        />
      </IdContext.Provider>
      <div
        className="flex h-full overflow-y-auto"
        onPointerUp={(e) => e.isPrimary && setResize(false)}
        onPointerLeave={(e) => e.isPrimary && setResize(false)}
        onPointerMove={(e) => e.isPrimary && handleResize(e)}
        onPointerDown={(e) => {
          e.target.releasePointerCapture(e.pointerId);
        }}
        style={isRtl(i18n.language) ? { direction: "rtl" } : {}}
      >
        {layout.sidebar && (
          <SidePanel resize={resize} setResize={setResize} width={width} />
        )}
        <div className="relative w-full h-full overflow-hidden">
          <CanvasContextProvider className="h-full w-full">
            <Canvas saveState={saveState} setSaveState={setSaveState} />
          </CanvasContextProvider>
          {!(layout.sidebar || layout.toolbar || layout.header) && (
            <div className="fixed right-5 bottom-4">
              <FloatingControls />
            </div>
          )}
        </div>
      </div>
      <Modal
        centered
        size="medium"
        closable={false}
        hasCancel={false}
        title={t("pick_db")}
        okText={t("confirm")}
        visible={showSelectDbModal}
        onOk={() => {
          console.log("Modal OK clicked, selectedDb:", selectedDb);
          if (selectedDb === "") return;
          setDatabase(selectedDb);
          setShowSelectDbModal(false);
        }}
        okButtonProps={{ disabled: selectedDb === "" }}
      >
        <div className="grid grid-cols-3 gap-4 place-content-center">
          {Object.values(databases).map((x) => (
            <div
              key={x.name}
              onClick={() => setSelectedDb(x.label)}
              className={`space-y-3 p-3 rounded-md border-2 select-none ${
                settings.mode === "dark"
                  ? "bg-zinc-700 hover:bg-zinc-600"
                  : "bg-zinc-100 hover:bg-zinc-200"
              } ${selectedDb === x.label ? "border-zinc-400" : "border-transparent"}`}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold">{x.name}</div>
                {x.beta && (
                  <Tag size="small" color="light-blue">
                    Beta
                  </Tag>
                )}
              </div>
              {x.image && (
                <img
                  src={x.image}
                  className="h-8"
                  style={{
                    filter:
                      "opacity(0.4) drop-shadow(0 0 0 white) drop-shadow(0 0 0 white)",
                  }}
                />
              )}
              <div className="text-xs">{x.description}</div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}