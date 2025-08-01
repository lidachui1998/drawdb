import { MODAL } from "../data/constants";

export const getModalTitle = (modal, t) => {
  switch (modal) {
    case MODAL.OPEN:
      return "打开图表";
    case MODAL.SHARE:
      return "分享图表";
    case MODAL.RENAME:
      return "重命名图表";
    case MODAL.SAVEAS:
      return "另存为";
    case MODAL.NEW:
      return "新建图表";
    case MODAL.IMPORT:
      return "导入图表";
    case MODAL.IMPORT_SRC:
      return "导入SQL";
    case MODAL.CODE:
      return "代码";
    case MODAL.IMG:
      return "图片预览";
    default:
      return "";
  }
};

export const getModalWidth = (modal) => {
  switch (modal) {
    case MODAL.OPEN:
      return 600;
    case MODAL.SHARE:
      return 600;
    case MODAL.NEW:
      return 500;
    case MODAL.IMPORT:
      return 500;
    case MODAL.IMPORT_SRC:
      return 600;
    case MODAL.CODE:
      return 800;
    case MODAL.IMG:
      return 600;
    default:
      return 400;
  }
};

export const getOkText = (modal, t) => {
  switch (modal) {
    case MODAL.OPEN:
      return "打开";
    case MODAL.SHARE:
      return "分享";
    case MODAL.RENAME:
      return "确定";
    case MODAL.SAVEAS:
      return "保存";
    case MODAL.NEW:
      return "创建";
    case MODAL.IMPORT:
      return "导入";
    case MODAL.IMPORT_SRC:
      return "导入";
    case MODAL.CODE:
      return t("export") || "导出";
    case MODAL.IMG:
      return t("export") || "导出";
    default:
      return "确定";
  }
};