import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const PipelineViewPage = () => {
    const { id } = useParams();
    const { t } = useTranslation();

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">{t("pages.admin.pipeline_view.title", "Pipeline Details")}</h1>
            <p>Pipeline ID: {id}</p>
            {/* Details will be implemented here */}
        </div>
    );
};
