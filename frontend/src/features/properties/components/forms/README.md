# PropertyFormTabbed

This folder contains the tabbed property form used to create and edit properties in the app. The original `PropertyFormTabbed.tsx` was refactored to extract constants, types, validators, and initial state logic into separate files to improve testability and maintainability.

## Files

- `PropertyFormTabbed.tsx` — main React component. Handles UI layout and glue logic (hooks, navigation, wiring to child forms).
- `constants.ts` — static configuration values: `AMENITIES` and `TABS` (tab metadata). Icons are attached in the component for readability.
- `types.ts` — local types used by the component (props, `FormErrors`, `TabId`).
- `validators.ts` — pure validator functions and helpers: `validateTab`, `validateAll`, `getTabForField`, `hasTabData`. These return structured error objects and are easy to unit test.
- `initialState.ts` — `buildInitialState()` centralises initial `PropertyInput` population from `initialData`, `isEdit` and the current user id.
- `PropertyFormTabbed.module.scss` — placeholder file for component-specific styles.
- `README.md` — this file.

## Implementation notes

- Validation: `validators.ts` contains conservative validation rules (required fields per tab). The component uses tab-level validation to allow creating the property step-by-step; in edit mode users may freely navigate between tabs.
- API error mapping: server-side validation errors are mapped into `errors` and the first invalid field is focused and the corresponding tab activated.
- Initial owner selection: when creating, the current user is used as default owner unless `initialData.ownerId` is provided; when editing the existing owner is loaded.

## Tests & Further extractions (suggested)

- Unit tests for `validators.ts` and `initialState.ts` (small pure functions).
- Break each tab into a small presentational component (e.g., `BasicTab.tsx`, `AddressTab.tsx`, etc.) to improve readability and make unit testing of rendering easier.
- Consider extracting a `usePropertyForm` hook to encapsulate the state machine (active tab, validation flow, completed tabs) so the component only handles rendering.
- Add accessibility tests (focus and error annoucement behavior) and E2E tests for multi-step flows.

## Validation rules summary

- Basic: `name` required; `ownerId` required when creating
- Address: `street`, `city`, `state`, `pincode` required
- Details: `totalArea` must be > 0
- Owner: at least one mobile and one email when creating
