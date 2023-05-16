import { Routes, Route } from "react-router-dom";
import { Editor } from "./Editor";

export const EditorRoutes = () => {
  return (
    <Routes>
      <Route path=":script" element={<Editor />} />
    </Routes>
  );
};
