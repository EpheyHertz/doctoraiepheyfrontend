import React, { Suspense } from 'react';
import PasswordResetConfirm from '../auth/password-reset-confirm'; // Assuming it's a dynamically imported component

const PasswordForm = () => (
  <Suspense fallback={<div>Loading form...</div>}>
    <PasswordResetConfirm />
  </Suspense>
);

export default PasswordForm;
