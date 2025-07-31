import { Button, Input, Toast } from "@douyinfe/semi-ui";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { IdContext } from "../../Workspace";
import { shareDiagram } from "../../../api/diagrams";

export default function Share({ setModal }) {
  const { t } = useTranslation();
  const { diagramId } = useContext(IdContext);
  const [email, setEmail] = useState("");

  const handleShare = async () => {
    if (!email) return;
    try {
      await shareDiagram(diagramId, email);
      Toast.success(`Successfully shared with ${email}`);
      setModal(null);
    } catch (error) {
      Toast.error("Failed to share diagram. Make sure the user exists.");
      console.error(error);
    }
  };

  return (
    <div>
      <Input
        placeholder="Collaborator's email"
        value={email}
        onChange={(v) => setEmail(v)}
      />
      <div className="flex justify-end gap-2 mt-4">
        <Button onClick={() => setModal(null)}>{t("cancel")}</Button>
        <Button theme="solid" onClick={handleShare}>
          {t("share")}
        </Button>
      </div>
    </div>
  );
}