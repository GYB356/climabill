// Mock DatePicker component
import React from 'react';

export const DatePicker = ({ label, value, onChange, ...props }) => {
  return React.createElement('div', {
    'data-testid': 'mui-date-picker',
    'aria-label': label,
    ...props,
    onClick: () => onChange && onChange(new Date()),
  }, label);
};

export default DatePicker;
