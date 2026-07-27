import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/Home';
import { JobListPage } from './pages/JobList';
import { RegisterStep1Page } from './pages/register/Step1';
import { RegisterStep2Page } from './pages/register/Step2';
import { RegisterPreviewPage } from './pages/register/Preview';
import { RegisterPlaceEditPage } from './pages/register/PlaceEdit';
import { RegisterPeriodEditPage } from './pages/register/PeriodEdit';
import { DetailPage } from './pages/Detail';
import { EditMainPage } from './pages/edit/EditMain';
import { EditPlacePage } from './pages/edit/EditPlace';
import { EditPeriodPage } from './pages/edit/EditPeriod';
import { ReRegisterMainPage } from './pages/reregister/ReRegisterMain';
import { ReRegisterPlacePage } from './pages/reregister/ReRegisterPlace';
import { ReRegisterPeriodPage } from './pages/reregister/ReRegisterPeriod';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobListPage />} />

        <Route path="/register/step1" element={<RegisterStep1Page />} />
        <Route path="/register/step2" element={<RegisterStep2Page />} />
        <Route path="/register/preview" element={<RegisterPreviewPage />} />
        <Route path="/register/preview/place" element={<RegisterPlaceEditPage />} />
        <Route path="/register/preview/period" element={<RegisterPeriodEditPage />} />

        <Route path="/jobs/:id" element={<DetailPage />} />
        <Route path="/jobs/:id/edit" element={<EditMainPage />} />
        <Route path="/jobs/:id/edit/place" element={<EditPlacePage />} />
        <Route path="/jobs/:id/edit/period" element={<EditPeriodPage />} />

        <Route path="/reregister/:sourceJobId" element={<ReRegisterMainPage />} />
        <Route path="/reregister/:sourceJobId/place" element={<ReRegisterPlacePage />} />
        <Route path="/reregister/:sourceJobId/period" element={<ReRegisterPeriodPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
