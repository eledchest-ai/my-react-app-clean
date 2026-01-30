import { configureStore } from "@reduxjs/toolkit";

// If you have slices, import them here and add them to reducer.
// If you don't use Redux yet, keep an empty reducer object to satisfy TS/build.
export const store = configureStore({
  reducer: {},
});

// ✅ These two exports are what hooks.ts needs
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
