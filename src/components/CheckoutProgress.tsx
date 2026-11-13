import { Step, StepLabel, Stepper } from "@mui/material";
import { useI18n } from "@/i18n/LocaleContext";

const STEPS = ["Checkout", "Payment", "Confirmation"];

export default function CheckoutProgress({ step }: { step: 1 | 2 | 3 }) {
  const { t } = useI18n();
  return (
    <Stepper
      alternativeLabel
      activeStep={step - 1}
      aria-label={t("Order progress")}
      sx={{ maxWidth: 720, mx: "auto", mb: { xs: 5, md: 7 } }}
    >
      {STEPS.map((label) => (
        <Step key={label}>
          <StepLabel>{t(label)}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
