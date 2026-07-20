'use client';

import App from '../frontend/src/App.jsx';
import AuthGate from '../frontend/src/components/AuthGate.jsx';

export default function Page() {
  return <AuthGate><App /></AuthGate>;
}
