'use client';

import dynamic from 'next/dynamic';

// Lazy-load EditProfileDialog — defers heavy bundle (avatar upload, 57-university
// autocomplete, framer-motion) until the dialog is actually needed on the profile page.
const EditProfileDialogInner = dynamic(
  () => import('./EditProfileDialog').then((m) => ({ default: m.EditProfileDialog })),
  {
    loading: () => (
      <button
        disabled
        className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-4 py-2 text-sm font-medium text-muted-foreground cursor-wait"
      >
        <span className="h-3.5 w-3.5 animate-spin rounded-full border border-muted-foreground/30 border-t-muted-foreground" />
        Đang tải...
      </button>
    ),
  }
);

export { EditProfileDialogInner as EditProfileDialog };
