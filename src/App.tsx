/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '@/pages/DashboardPage';

const LatexEditorPage = React.lazy(() => import('@/pages/latex-editor'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="h-screen bg-primary-950 text-primary-400 flex items-center justify-center">Loading Hermes Workspace...</div>}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/editor" element={<LatexEditorPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
