"use client";

import { Button, Tooltip } from "@mui/material";
import TranslateOutlinedIcon from "@mui/icons-material/TranslateOutlined";
import { useI18n } from "@/i18n/LocaleContext";

export default function LanguageToggle() {
  const { locale, changeLocale, t } = useI18n();
  return (
    <Tooltip title={t("Change language")}>
      <Button
        size="small"
        color="primary"
        startIcon={<TranslateOutlinedIcon fontSize="small" />}
        onClick={() => changeLocale(locale === "en" ? "ar" : "en")}
        aria-label={t("Change language")}
        sx={{ minWidth: "auto", whiteSpace: "nowrap" }}
      >
        {locale === "en" ? "العربية" : "English"}
      </Button>
    </Tooltip>
  );
}
