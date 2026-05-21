import React from 'react';
import EmptyState from './EmptyState';

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

const ErrorState = ({
  title = 'Something went wrong',
  message = 'Please try again in a moment.',
  onRetry,
}: ErrorStateProps) => (
  <EmptyState
    icon="exclamation-triangle"
    title={title}
    message={message}
    actionLabel={onRetry ? 'Retry' : undefined}
    onAction={onRetry}
  />
);

export default ErrorState;
