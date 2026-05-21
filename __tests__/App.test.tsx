/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

test('renders correctly', async () => {
  jest.useFakeTimers();
  const App = require('../App').default;
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
    jest.advanceTimersByTime(1200);
  });

  await ReactTestRenderer.act(() => {
    renderer?.unmount();
  });

  jest.clearAllTimers();
  jest.useRealTimers();
});
