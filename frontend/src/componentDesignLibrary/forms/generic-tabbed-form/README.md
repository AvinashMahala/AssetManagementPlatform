# Generic Tabbed Form

A reusable component for creating multi-step tabbed forms with a progress stepper, header, and fixed footer navigation.

## Usage

```tsx
import { GenericTabbedForm } from 'componentDesignLibrary';

const MyForm = () => {
  // ... state management
  
  return (
    <GenericTabbedForm
      title="Create Item"
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      completedTabs={completedTabs}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    >
      {/* Tab Content */}
    </GenericTabbedForm>
  );
};
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| title | string | The main title of the form page |
| subtitle | string | Optional subtitle |
| tabs | TabConfig[] | Array of tab configurations |
| activeTab | string | ID of the currently active tab |
| onTabChange | (id: string) => void | Callback when tab changes |
| completedTabs | Set<string> | Set of completed tab IDs |
| isEdit | boolean | Whether the form is in edit mode |
| loading | boolean | Whether the form is submitting |
| hasTabData | (id: string) => boolean | Optional function to check if a tab has data |
| onNext | () => void | Callback for next button |
| onPrevious | () => void | Callback for previous button |
| onSubmit | (e) => void | Callback for form submission |
| onCancel | () => void | Callback for cancel button |
