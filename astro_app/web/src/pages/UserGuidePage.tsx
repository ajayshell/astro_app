import { marked } from "marked";
// Raw markdown source -- web/docs/USER_GUIDE.md is the single source of truth
// for this page's content (also readable directly in the repo); this
// import renders it in-app instead of duplicating the text here.
import userGuideMarkdown from "../../docs/USER_GUIDE.md?raw";
import { useI18n } from "../i18n/LanguageContext";

interface Props {
  onBack: () => void;
}

const userGuideHtml = marked.parse(userGuideMarkdown, { async: false });

export function UserGuidePage({ onBack }: Props) {
  const { t } = useI18n();

  return (
    <div className="user-guide-page">
      <button type="button" className="back-to-home" onClick={onBack}>
        {t("backToHome")}
      </button>
      <div className="user-guide-content" dangerouslySetInnerHTML={{ __html: userGuideHtml }} />
    </div>
  );
}
