import { memo } from "react";
import { Routes, Route } from "react-router-dom";
import isEqual from "fast-deep-equal/react";
import { Editor } from "./Editor";

export const EditorRoutes = memo(() => {
  return (
    <Routes>
      <Route path=":script" element={<Editor />} />
    </Routes>
  );
}, isEqual);
