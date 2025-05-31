import React from 'react';

const Edit = (props) => {
  return React.createElement('span', {
    'data-testid': 'mui-icon-edit',
    ...props,
  }, props.children || 'Edit');
};

Edit.displayName = 'Edit';

export default Edit;
