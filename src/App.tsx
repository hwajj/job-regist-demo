import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/Home';
import { JobListPage } from './pages/JobList';
import { RegisterStep1Page } from './pages/register/Step1';
import { RegisterStep2Page } from './pages/register/Step2';
import { DetailPage } from './pages/Detail';
import { PreviewMainPage } from './pages/shared/PreviewMain';
import { PlaceEditPage } from './pages/shared/PlaceEdit';
import { PeriodEditPage } from './pages/shared/PeriodEdit';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobListPage />} />

        <Route path="/register/step1" element={<RegisterStep1Page />} />
        <Route path="/register/step2" element={<RegisterStep2Page />} />
        {/* 등록 / 수정 / 재등록 — 같은 PreviewMain · PlaceEdit · PeriodEdit */}
        <Route path="/register/preview" element={<PreviewMainPage />} />
        <Route path="/register/preview/place" element={<PlaceEditPage />} />
        <Route path="/register/preview/period" element={<PeriodEditPage />} />

        <Route path="/jobs/:id" element={<DetailPage />} />
        <Route path="/jobs/:id/edit" element={<PreviewMainPage />} />
        <Route path="/jobs/:id/edit/place" element={<PlaceEditPage />} />
        <Route path="/jobs/:id/edit/period" element={<PeriodEditPage />} />

        <Route path="/reregister/:sourceJobId" element={<PreviewMainPage />} />
        <Route path="/reregister/:sourceJobId/place" element={<PlaceEditPage />} />
        <Route path="/reregister/:sourceJobId/period" element={<PeriodEditPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
