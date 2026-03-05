import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreatePage from "@/pages/CreatePage";
import EditorPage from "@/pages/EditorPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreatePage />} />
        <Route path="/editor/:projectId" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
