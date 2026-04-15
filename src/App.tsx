/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense } from 'react';
const LatexEditorPage = React.lazy(() => import('@/pages/latex-editor'));

export default function App() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#0a0a0f] text-[#22d3ee] flex items-center justify-center">Loading Module...</div>}>
      <LatexEditorPage />
    </Suspense>
  );
}
