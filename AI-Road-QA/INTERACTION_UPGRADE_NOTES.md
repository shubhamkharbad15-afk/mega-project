# Interaction and Persona UI update

This pass improves the citizen live camera overlay with a green HUD-style grid, translucent detection regions, corner brackets, and legible candidate labels. The camera capture action now clearly asks the user to capture/review the inspection frame. The overlay visualizes whatever detections the current configured detector returns; it does not itself provide a trained or validated road-damage model, nor does a bounding box alone yield reliable physical dimensions.

The sign-in dialog now asks which portal the user intends to enter (Citizen, Municipal Government, Field Contractor, or Developer/System Admin) and checks that the authenticated backend user role matches that portal. The selector is not an authorization mechanism; backend authorization remains mandatory for all protected APIs. Public registration remains citizen-only.

## Validate locally

From `frontend`:

```powershell
npm ci
npm run build
npm run dev
```

Test the camera over `localhost` or HTTPS and allow camera permission. Check the capture-review flow and role mismatch errors. A complete end-to-end test still requires a configured backend/database and role-assigned accounts.
