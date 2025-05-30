// Mock LocalizationProvider component
import React from 'react';

export const LocalizationProvider = ({ children }) => {
  return React.createElement('div', {
    'data-testid': 'mui-localization-provider',
  }, children);
};

export default LocalizationProvider;
