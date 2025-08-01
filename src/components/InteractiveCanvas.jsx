import { useEffect, useState, useRef, useCallback } from "react";
import {
  Cardinality,
  tableColorStripHeight,
  tableFieldHeight,
  tableHeaderHeight,
  tableWidth,
  noteWidth,
  noteRadius,
  noteFold,
  darkBgTheme,
  gridSize,
  gridCircleRadius,
} from "../data/constants";
import { calcPath } from "../utils/calcPath";

function Table({ table, grab, readonly = false }) {
  const tableHeight =
    tableHeaderHeight +
    tableColorStripHeight +
    table.fields.length * tableFieldHeight;

  return (
    <foreignObject
      x={table.x}
      y={table.y}
      width={tableWidth}
      height={tableHeight}
      className={readonly ? "" : "cursor-move"}
      onMouseDown={readonly ? undefined : (e) => grab(e, table.id)}
    >
      <div className="border-2 border-zinc-200 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out select-none w-full h-full backdrop-blur-sm relative">
        {/* Color strip */}
        <div
          className="h-[10px] w-full rounded-t-md"
          style={{ backgroundColor: table.color }}
        />
        
        {/* Table header */}
        <div className="overflow-hidden font-bold h-[40px] flex justify-between items-center border-b bg-gradient-to-r from-zinc-50 to-zinc-100 border-zinc-300 text-gray-800">
          <div className="px-3 flex items-center gap-2 flex-1 min-w-0">
            <div
              className="w-3 h-3 rounded-full shadow-sm shrink-0"
              style={{ backgroundColor: table.color }}
            ></div>
            <span className="tracking-wide font-bold whitespace-nowrap pr-2">{table.name}</span>
            {table.comment && (
              <i className="fa-solid fa-comment text-blue-500 text-xs opacity-70 shrink-0"></i>
            )}
          </div>
        </div>
        
        {/* Table fields */}
        <div className="flex-1">
          {table.fields.map((field, index) => (
            <div 
              key={field.id} 
              className={`${
                index === table.fields.length - 1
                  ? ""
                  : "border-b border-zinc-200"
              } h-[36px] px-3 py-1 flex justify-between items-center gap-2 w-full hover:bg-blue-50 hover:bg-opacity-50 transition-colors duration-150`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-700 truncate">
                    {field.name}
                  </div>
                  {field.comment && (
                    <div className="text-xs text-zinc-500 italic truncate">
                      "{field.comment}"
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-1 items-center text-xs text-gray-500 shrink-0">
                {field.primary && (
                  <i className="fa-solid fa-key text-yellow-500"></i>
                )}
                {!field.notNull && (
                  <span className="font-mono text-gray-400">?</span>
                )}
                <span className="font-mono uppercase">
                  {field.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </foreignObject>
  );
}

function Relationship({ relationship, tables }) {
  const startTable = tables.find((table) => table.id === relationship.startTableId);
  const endTable = tables.find((table) => table.id === relationship.endTableId);

  if (!startTable || !endTable) {
    return null;
  }

  const startField = startTable.fields.find(
    (field) => field.id === relationship.startFieldId,
  );
  const endField = endTable.fields.find(
    (field) => field.id === relationship.endFieldId,
  );

  if (!startField || !endField) {
    return null;
  }

  const startFieldIndex = startTable.fields.findIndex(
    (field) => field.id === relationship.startFieldId,
  );
  const endFieldIndex = endTable.fields.findIndex(
    (field) => field.id === relationship.endFieldId,
  );

  const startY =
    startTable.y +
    tableHeaderHeight +
    tableColorStripHeight +
    startFieldIndex * tableFieldHeight +
    tableFieldHeight / 2;
  const endY =
    endTable.y +
    tableHeaderHeight +
    tableColorStripHeight +
    endFieldIndex * tableFieldHeight +
    tableFieldHeight / 2;

  const startX = startTable.x + tableWidth;
  const endX = endTable.x;

  // Create relationship object for calcPath function
  const relationshipData = {
    startTable: startTable,
    endTable: endTable,
    startFieldIndex: startFieldIndex,
    endFieldIndex: endFieldIndex
  };

  const path = calcPath(relationshipData, tableWidth, 1);

  return (
    <g>
      <path
        d={path}
        stroke="#6b7280"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
      {relationship.cardinality === Cardinality.ONE_TO_MANY && (
        <>
          <circle cx={startX} cy={startY} r="3" fill="#6b7280" />
          <g transform={`translate(${endX - 15}, ${endY - 8})`}>
            <path d="M0,0 L8,4 L0,8 Z" fill="#6b7280" />
            <path d="M8,0 L16,4 L8,8" stroke="#6b7280" strokeWidth="2" fill="none" />
          </g>
        </>
      )}
      {relationship.cardinality === Cardinality.ONE_TO_ONE && (
        <>
          <circle cx={startX} cy={startY} r="3" fill="#6b7280" />
          <circle cx={endX} cy={endY} r="3" fill="#6b7280" />
        </>
      )}
      {relationship.cardinality === Cardinality.MANY_TO_MANY && (
        <>
          <g transform={`translate(${startX + 8}, ${startY - 8})`}>
            <path d="M0,0 L8,4 L0,8 Z" fill="#6b7280" />
            <path d="M8,0 L16,4 L8,8" stroke="#6b7280" strokeWidth="2" fill="none" />
          </g>
          <g transform={`translate(${endX - 15}, ${endY - 8})`}>
            <path d="M0,0 L8,4 L0,8 Z" fill="#6b7280" />
            <path d="M8,0 L16,4 L8,8" stroke="#6b7280" strokeWidth="2" fill="none" />
          </g>
        </>
      )}
    </g>
  );
}

function Note({ note }) {
  return (
    <g>
      <path
        d={`M${note.x + noteFold} ${note.y} L${note.x + noteWidth - noteRadius} ${
          note.y
        } A${noteRadius} ${noteRadius} 0 0 1 ${note.x + noteWidth} ${note.y + noteRadius} L${note.x + noteWidth} ${
          note.y + note.height - noteRadius
        } A${noteRadius} ${noteRadius} 0 0 1 ${note.x + noteWidth - noteRadius} ${note.y + note.height} L${
          note.x + noteRadius
        } ${note.y + note.height} A${noteRadius} ${noteRadius} 0 0 1 ${note.x} ${
          note.y + note.height - noteRadius
        } L${note.x} ${note.y + noteFold}`}
        fill={note.color}
        stroke="rgb(168 162 158)"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d={`M${note.x} ${note.y + noteFold} L${note.x + noteFold - noteRadius} ${
          note.y + noteFold
        } A${noteRadius} ${noteRadius} 0 0 0 ${note.x + noteFold} ${note.y + noteFold - noteRadius} L${
          note.x + noteFold
        } ${note.y} L${note.x} ${note.y + noteFold} Z`}
        fill={note.color}
        stroke="rgb(168 162 158)"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <foreignObject
        x={note.x}
        y={note.y}
        width={noteWidth}
        height={note.height}
      >
        <div className="text-gray-900 select-none w-full h-full px-3 py-2">
          <div className="ms-5 overflow-hidden text-ellipsis font-medium text-sm">
            {note.title}
          </div>
          <div className="mt-1 text-xs text-gray-600 whitespace-pre-wrap overflow-hidden">
            {note.content}
          </div>
        </div>
      </foreignObject>
    </g>
  );
}

export default function InteractiveCanvas({
  diagram,
  zoom: initialZoom = 1,
  readonly = false,
  tables: propTables,
  relationships: propRelationships,
  notes: propNotes,
  areas: propAreas,
  types: propTypes,
  enums: propEnums,
  database: propDatabase
}) {
  // 检测主题模式
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                    window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
    };
    
    checkTheme();
    
    // 监听主题变化
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkTheme);
    
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkTheme);
    };
  }, []);
  // Use props if provided, otherwise use diagram object
  const initialTables = propTables || diagram?.tables || [];
  const relationships = propRelationships || diagram?.relationships || [];
  const notes = propNotes || diagram?.notes || [];

  const [tables, setTables] = useState(initialTables);
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(-1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  // 调整表格位置，确保在可视区域内
  useEffect(() => {
    if (initialTables.length > 0) {
      const adjustedTables = initialTables.map((table, index) => {
        let x = table.x;
        let y = table.y;
        
        if (x < 50 || y < 50) {
          x = 100 + (index % 3) * 300;
          y = 100 + Math.floor(index / 3) * 200;
        }
        
        return { ...table, x, y };
      });
      
      console.log('Adjusted tables:', adjustedTables);
      setTables(adjustedTables);
    }
  }, [initialTables]);

  // 表格拖拽功能
  const grabTable = useCallback((e, id) => {
    if (readonly) return;
    e.stopPropagation();
    setDragging(id);
    const tableIndex = tables.findIndex(t => t.id === id);
    if (tableIndex !== -1) {
      setOffset({
        x: e.clientX - tables[tableIndex].x,
        y: e.clientY - tables[tableIndex].y,
      });
    }
  }, [readonly, tables]);

  const moveTable = useCallback((e) => {
    if (readonly || dragging === -1) return;
    const dx = e.clientX - offset.x;
    const dy = e.clientY - offset.y;
    
    setTables(prev => prev.map(table => 
      table.id === dragging 
        ? { ...table, x: dx, y: dy }
        : table
    ));
  }, [readonly, dragging, offset]);

  const releaseTable = useCallback(() => {
    setDragging(-1);
  }, []);

  // 画布平移功能
  const handleMouseDown = useCallback((e) => {
    if (e.target === svgRef.current || e.target.tagName === 'rect') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e) => {
    if (dragging !== -1) {
      moveTable(e);
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  }, [dragging, isPanning, panStart, moveTable]);

  const handleMouseUp = useCallback(() => {
    releaseTable();
    setIsPanning(false);
  }, [releaseTable]);

  // 缩放功能
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)));
  }, []);

  // 重置视图
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // 适应画布
  const fitToCanvas = useCallback(() => {
    if (tables.length === 0) return;
    
    const minX = Math.min(...tables.map(t => t.x));
    const minY = Math.min(...tables.map(t => t.y));
    const maxX = Math.max(...tables.map(t => t.x + tableWidth));
    const maxY = Math.max(...tables.map(t => t.y + tableHeaderHeight + tableColorStripHeight + t.fields.length * tableFieldHeight));
    
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    
    if (svgRef.current) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const scaleX = (svgRect.width - 100) / contentWidth;
      const scaleY = (svgRect.height - 100) / contentHeight;
      const newZoom = Math.min(scaleX, scaleY, 1);
      
      setZoom(newZoom);
      setPan({
        x: (svgRect.width - contentWidth * newZoom) / 2 - minX * newZoom,
        y: (svgRect.height - contentHeight * newZoom) / 2 - minY * newZoom
      });
    }
  }, [tables]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div 
      className="relative w-full h-full"
      style={{
        backgroundColor: isDarkMode ? darkBgTheme : "white",
      }}
    >
      {/* 控制面板 */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-md p-2 flex items-center gap-2`}>
          <button
            onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            +
          </button>
          <span className="text-sm font-mono min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(prev => Math.max(0.1, prev * 0.8))}
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            -
          </button>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-2 flex flex-col gap-1`}>
          <button
            onClick={resetView}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
          >
            重置视图
          </button>
          <button
            onClick={fitToCanvas}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
          >
            适应画布
          </button>
        </div>
      </div>

      {/* SVG 画布 */}
      <svg
        ref={svgRef}
        className={`w-full h-full ${readonly ? 'cursor-default' : isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        style={{ minHeight: '400px' }}
      >
        <defs>
          <pattern
            id="pattern-grid"
            x={-gridCircleRadius}
            y={-gridCircleRadius}
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
            patternContentUnits="userSpaceOnUse"
          >
            <circle
              cx={gridCircleRadius}
              cy={gridCircleRadius}
              r={gridCircleRadius}
              fill="rgb(99, 152, 191)"
              opacity="1"
            />
          </pattern>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
          </marker>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#pattern-grid)"
        />
        <g
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {/* 调试信息 */}
          <text x="10" y="30" fill="red" fontSize="14">
            Debug: Tables={tables.length}, Relationships={relationships.length}
          </text>
          
          {/* 渲染关系线 */}
          {relationships.map((relationship) => (
            <Relationship
              key={relationship.id}
              relationship={relationship}
              tables={tables}
            />
          ))}
          
          {/* 渲染表格 */}
          {tables.map((table) => (
            <Table
              key={table.id}
              table={table}
              grab={grabTable}
              readonly={readonly}
            />
          ))}
          
          {/* 渲染笔记 */}
          {notes.map((note) => (
            <Note
              key={note.id}
              note={note}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}