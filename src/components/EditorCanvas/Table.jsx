import { useMemo, useState, useRef, useEffect } from "react";
import {
  Tab,
  ObjectType,
  tableFieldHeight,
  tableHeaderHeight,
  tableColorStripHeight,
} from "../../data/constants";
import {
  IconEdit,
  IconMore,
  IconMinus,
  IconDeleteStroked,
  IconKeyStroked,
  IconLock,
  IconUnlock,
} from "@douyinfe/semi-icons";
import { Popover, Tag, Button, SideSheet } from "@douyinfe/semi-ui";
import { useLayout, useSettings, useDiagram, useSelect } from "../../hooks";
import TableInfo from "../EditorSidePanel/TablesTab/TableInfo";
import { useTranslation } from "react-i18next";
import { dbToTypes } from "../../data/datatypes";
import { isRtl } from "../../i18n/utils/rtl";
import i18n from "../../i18n/i18n";
import { getTableHeight } from "../../utils/utils";

export default function Table(props) {
  const [hoveredField, setHoveredField] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const tableRef = useRef(null);
  const { database } = useDiagram();
  const {
    tableData,
    onPointerDown,
    setHoveredTable,
    handleGripField,
    setLinkingLine,
  } = props;
  const { layout } = useLayout();
  const { deleteTable, deleteField, updateTable } = useDiagram();
  const { settings } = useSettings();
  const { t } = useTranslation();
  const {
    selectedElement,
    setSelectedElement,
    bulkSelectedElements,
    setBulkSelectedElements,
  } = useSelect();

  const borderColor = useMemo(
    () => (settings.mode === "light" ? "border-zinc-300" : "border-zinc-600"),
    [settings.mode],
  );

  const height = getTableHeight(tableData);

  // 获取表格的当前尺寸
  const tableWidth = tableData.width || settings.tableWidth;
  const tableHeight = tableData.height || height;

  // 调整大小开始
  const handleResizeStart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: tableWidth,
      height: tableHeight,
    });
  };

  // 调整大小过程中
  const handleResizeMove = (e) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    const newWidth = Math.max(180, resizeStart.width + deltaX); // 最小宽度180
    const newHeight = Math.max(height, resizeStart.height + deltaY); // 最小高度为原始计算高度
    
    updateTable(tableData.id, {
      width: newWidth,
      height: newHeight,
    });
  };

  // 调整大小结束
  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  // 监听全局鼠标事件
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, resizeStart]);

  const isSelected = useMemo(() => {
    return (
      (selectedElement.id == tableData.id &&
        selectedElement.element === ObjectType.TABLE) ||
      bulkSelectedElements.some(
        (e) => e.type === ObjectType.TABLE && e.id === tableData.id,
      )
    );
  }, [selectedElement, tableData, bulkSelectedElements]);

  const lockUnlockTable = () => {
    setBulkSelectedElements((prev) =>
      prev.filter((el) => el.id !== tableData.id || el.type !== ObjectType.TABLE),
    );
    updateTable(tableData.id, { locked: !tableData.locked });
  };

  const openEditor = () => {
    if (!layout.sidebar) {
      setSelectedElement((prev) => ({
        ...prev,
        element: ObjectType.TABLE,
        id: tableData.id,
        open: true,
      }));
    } else {
      setSelectedElement((prev) => ({
        ...prev,
        currentTab: Tab.TABLES,
        element: ObjectType.TABLE,
        id: tableData.id,
        open: true,
      }));
      if (selectedElement.currentTab !== Tab.TABLES) return;
      document
        .getElementById(`scroll_table_${tableData.id}`)
        .scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <foreignObject
        key={tableData.id}
        x={tableData.x}
        y={tableData.y}
        width={tableWidth}
        height={tableHeight}
        className="group drop-shadow-lg rounded-md cursor-move"
        onPointerDown={onPointerDown}
      >
        <div
          ref={tableRef}
          onDoubleClick={openEditor}
          className={`border-2 hover:border-dashed hover:border-blue-500 transition-all duration-300 ease-in-out
               select-none rounded-lg w-full h-full shadow-lg hover:shadow-2xl backdrop-blur-sm relative ${
                 settings.mode === "light"
                   ? "bg-white text-zinc-800 border-zinc-200"
                   : "bg-zinc-800 text-zinc-200 border-zinc-600"
               } ${isSelected ? "border-solid border-blue-500 shadow-blue-200 ring-2 ring-blue-400 ring-opacity-50" : ""}`}
          style={{ direction: "ltr" }}
        >
          <div
            className="h-[10px] w-full rounded-t-md"
            style={{ backgroundColor: tableData.color }}
          />
          <div
            className={`overflow-hidden font-bold h-[40px] flex justify-between items-center border-b ${
              settings.mode === "light" 
                ? "bg-gradient-to-r from-zinc-50 to-zinc-100 border-zinc-300 text-gray-800" 
                : "bg-gradient-to-r from-zinc-900 to-zinc-800 border-zinc-600 text-zinc-100"
            }`}
          >
            <div className="px-3 flex items-center gap-2 flex-1 min-w-0 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
              <div
                className="w-3 h-3 rounded-full shadow-sm shrink-0"
                style={{ backgroundColor: tableData.color }}
              ></div>
              <span className="tracking-wide font-bold whitespace-nowrap pr-2">{tableData.name}</span>
              {tableData.comment && (
                <i className="fa-solid fa-comment text-blue-500 text-xs opacity-70 shrink-0"></i>
              )}
            </div>
            <div className="hidden group-hover:block shrink-0">
              <div className="flex justify-end items-center mx-2 space-x-1.5">
                <Button
                  icon={tableData.locked ? <IconLock /> : <IconUnlock />}
                  size="small"
                  theme="solid"
                  style={{
                    backgroundColor: "#2f68adb3",
                  }}
                  onClick={lockUnlockTable}
                />
                <Button
                  icon={<IconEdit />}
                  size="small"
                  theme="solid"
                  style={{
                    backgroundColor: "#2f68adb3",
                  }}
                  onClick={openEditor}
                />
                <Popover
                  key={tableData.id}
                  content={
                    <div className="popover-theme">
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fa-solid fa-comment text-blue-500"></i>
                        <strong className="text-sm">{t("comment")}:</strong>
                      </div>
                      {tableData.comment === "" ? (
                        <div className="text-sm text-gray-500 italic">{t("not_set")}</div>
                      ) : (
                        <div className={`text-sm p-2 rounded-md ${
                          settings.mode === "light" 
                            ? "bg-gray-50 border border-gray-200" 
                            : "bg-zinc-700 border border-zinc-600"
                        }`}>
                          "{tableData.comment}"
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fa-solid fa-list text-green-500"></i>
                        <strong className="text-sm">{t("indices")}:</strong>
                      </div>
                      {tableData.indices.length === 0 ? (
                        <div className="text-sm text-gray-500 italic">{t("not_set")}</div>
                      ) : (
                        <div className="space-y-2">
                          {tableData.indices.map((index, k) => (
                            <div
                              key={k}
                              className={`flex items-center gap-2 p-2 rounded-md ${
                                settings.mode === "light"
                                  ? "bg-gray-50 border border-gray-200"
                                  : "bg-zinc-700 border border-zinc-600"
                              }`}
                            >
                              <i className="fa-solid fa-thumbtack text-slate-500"></i>
                              <div className="flex flex-wrap gap-1">
                                {index.fields.map((f) => (
                                  <Tag color="blue" key={f} size="small">
                                    {f}
                                  </Tag>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                      <Button
                        icon={<IconDeleteStroked />}
                        type="danger"
                        block
                        style={{ marginTop: "8px" }}
                        onClick={() => deleteTable(tableData.id)}
                      >
                        {t("delete")}
                      </Button>
                    </div>
                  }
                  position="rightTop"
                  showArrow
                  trigger="click"
                  style={{ width: "200px", wordBreak: "break-word" }}
                >
                  <Button
                    icon={<IconMore />}
                    type="tertiary"
                    size="small"
                    style={{
                      backgroundColor: "#808080b3",
                      color: "white",
                    }}
                  />
                </Popover>
              </div>
            </div>
          </div>
          <div 
            className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
            style={{ 
              maxHeight: `${tableHeight - 50}px`, // 减去头部高度
              minHeight: `${Math.max(0, tableHeight - 50)}px`
            }}
          >
            {tableData.fields.map((e, i) => {
            return settings.showFieldSummary ? (
                <Popover
                  key={i}
                  content={
                    <div className="popover-theme">
                      <div
                        className="flex justify-between items-center pb-3 border-b border-gray-200"
                        style={{ direction: "ltr" }}
                      >
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-database text-blue-500"></i>
                          <p className="font-bold text-lg">{e.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              "font-mono text-sm px-2 py-1 rounded-md " + 
                              dbToTypes[database][e.type].color +
                              (settings.mode === "light" 
                                ? " bg-gray-100" 
                                : " bg-zinc-700")
                            }
                          >
                            {e.type +
                              ((dbToTypes[database][e.type].isSized ||
                                dbToTypes[database][e.type].hasPrecision) &&
                              e.size &&
                              e.size !== ""
                                ? "(" + e.size + ")"
                                : "")}
                          </span>
                        </div>
                      </div>
                      <div className="pt-3 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {e.primary && (
                            <Tag color="blue" size="small" className="flex items-center gap-1">
                              <i className="fa-solid fa-key text-xs"></i>
                              {t("primary")}
                            </Tag>
                          )}
                          {e.unique && (
                            <Tag color="amber" size="small" className="flex items-center gap-1">
                              <i className="fa-solid fa-fingerprint text-xs"></i>
                              {t("unique")}
                            </Tag>
                          )}
                          {e.notNull && (
                            <Tag color="purple" size="small" className="flex items-center gap-1">
                              <i className="fa-solid fa-exclamation text-xs"></i>
                              {t("not_null")}
                            </Tag>
                          )}
                          {e.increment && (
                            <Tag color="green" size="small" className="flex items-center gap-1">
                              <i className="fa-solid fa-arrow-up text-xs"></i>
                              {t("autoincrement")}
                            </Tag>
                          )}
                        </div>
                        <div className={`p-2 rounded-md ${
                          settings.mode === "light" 
                            ? "bg-gray-50" 
                            : "bg-zinc-700"
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <i className="fa-solid fa-cog text-gray-500"></i>
                            <strong className="text-sm">{t("default_value")}:</strong>
                          </div>
                          <div className="text-sm">
                            {e.default === "" ? (
                              <span className="italic text-gray-500">{t("not_set")}</span>
                            ) : (
                              <code className="bg-gray-200 dark:bg-zinc-600 px-1 py-0.5 rounded text-xs">
                                {e.default}
                              </code>
                            )}
                          </div>
                        </div>
                        <div className={`p-2 rounded-md ${
                          settings.mode === "light" 
                            ? "bg-gray-50" 
                            : "bg-zinc-700"
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <i className="fa-solid fa-comment text-gray-500"></i>
                            <strong className="text-sm">{t("comment")}:</strong>
                          </div>
                          <div className="text-sm">
                            {e.comment === "" ? (
                              <span className="italic text-gray-500">{t("not_set")}</span>
                            ) : (
                              <div className="italic">"{e.comment}"</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                position="right"
                showArrow
                style={
                  isRtl(i18n.language)
                    ? { direction: "rtl" }
                    : { direction: "ltr" }
                }
              >
                {field(e, i)}
              </Popover>
            ) : (
              field(e, i)
            );
          })}
          </div>
          
          {/* 调整大小手柄 */}
          {(isSelected || isResizing) && (
            <div
              className={`absolute bottom-0 right-0 w-4 h-4 cursor-se-resize ${
                settings.mode === "light" 
                  ? "bg-blue-500 hover:bg-blue-600" 
                  : "bg-blue-400 hover:bg-blue-500"
              } rounded-tl-md opacity-70 hover:opacity-100 transition-all duration-200 flex items-center justify-center`}
              onMouseDown={handleResizeStart}
              style={{ 
                borderTopLeftRadius: '6px',
                borderBottomRightRadius: '6px'
              }}
            >
              <div className="w-2 h-2 border-r border-b border-white opacity-60"></div>
            </div>
          )}
        </div>
      </foreignObject>
      <SideSheet
        title={t("edit")}
        size="small"
        visible={
          selectedElement.element === ObjectType.TABLE &&
          selectedElement.id === tableData.id &&
          selectedElement.open &&
          !layout.sidebar
        }
        onCancel={() =>
          setSelectedElement((prev) => ({
            ...prev,
            open: !prev.open,
          }))
        }
        style={{ paddingBottom: "16px" }}
      >
        <div className="sidesheet-theme">
          <TableInfo data={tableData} />
        </div>
      </SideSheet>
    </>
  );

  function field(fieldData, index) {
    return (
      <div
        className={`${
          index === tableData.fields.length - 1
            ? ""
            : settings.mode === "light" 
              ? "border-b border-zinc-200" 
              : "border-b border-zinc-600"
        } group h-[36px] px-3 py-1 flex justify-between items-center gap-2 w-full hover:bg-opacity-50 transition-colors duration-150 ${
          settings.mode === "light" 
            ? "hover:bg-blue-50" 
            : "hover:bg-zinc-700"
        }`}
        onPointerEnter={(e) => {
          if (!e.isPrimary) return;

          setHoveredField(index);
          setHoveredTable({
            tableId: tableData.id,
            fieldId: fieldData.id,
          });
        }}
        onPointerLeave={(e) => {
          if (!e.isPrimary) return;

          setHoveredField(null);
          setHoveredTable({
            tableId: null,
            fieldId: null,
          });
        }}
        onPointerDown={(e) => {
          // Required for onPointerLeave to trigger when a touch pointer leaves
          // https://stackoverflow.com/a/70976017/1137077
          e.target.releasePointerCapture(e.pointerId);
        }}
      >
        <div
          className={`${
            hoveredField === index ? "text-zinc-400" : ""
          } flex items-center gap-2 flex-1 min-w-0`}
        >
          <button
            className="shrink-0 w-[12px] h-[12px] bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200 border-2 border-white"
            onPointerDown={(e) => {
              if (!e.isPrimary) return;

              handleGripField();
              setLinkingLine((prev) => ({
                ...prev,
                startFieldId: fieldData.id,
                startTableId: tableData.id,
                startX: tableData.x + 15,
                startY:
                  tableData.y +
                  index * tableFieldHeight +
                  tableHeaderHeight +
                  tableColorStripHeight +
                  12,
                endX: tableData.x + 15,
                endY:
                  tableData.y +
                  index * tableFieldHeight +
                  tableHeaderHeight +
                  tableColorStripHeight +
                  12,
              }));
            }}
          />
          <div className="flex-1 min-w-0 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
            <div className="font-medium whitespace-nowrap pr-2">
              {fieldData.name}
            </div>
            {fieldData.comment && (
              <div className={`text-xs whitespace-nowrap pr-2 italic ${
                settings.mode === "light" 
                  ? "text-zinc-500" 
                  : "text-zinc-400"
              }`}>
                "{fieldData.comment}"
              </div>
            )}
          </div>
        </div>
        <div className="text-zinc-400 shrink-0">
          {hoveredField === index ? (
            <Button
              theme="solid"
              size="small"
              style={{
                backgroundColor: "#d42020b3",
              }}
              icon={<IconMinus />}
              onClick={() => deleteField(fieldData, tableData.id)}
            />
          ) : settings.showDataTypes ? (
            <div className="flex gap-1 items-center">
              {fieldData.primary && <IconKeyStroked />}
              {!fieldData.notNull && <span className="font-mono">?</span>}
              <span
                className={
                  "font-mono " + dbToTypes[database][fieldData.type].color
                }
              >
                {fieldData.type +
                  ((dbToTypes[database][fieldData.type].isSized ||
                    dbToTypes[database][fieldData.type].hasPrecision) &&
                  fieldData.size &&
                  fieldData.size !== ""
                    ? `(${fieldData.size})`
                    : "")}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
