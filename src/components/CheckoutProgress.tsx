import { Step, StepLabel, Stepper } from "@mui/material";

const STEPS = ["Checkout", "Payment", "Confirmation"];

export default function CheckoutProgress({ step }: { step: 1 | 2 | 3 }) {
  return (
    <Stepper
      alternativeLabel
      activeStep={step - 1}
      aria-label="Order progress"
      sx={{ maxWidth: 720, mx: "auto", mb: { xs: 5, md: 7 } }}
    >
      {STEPS.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
