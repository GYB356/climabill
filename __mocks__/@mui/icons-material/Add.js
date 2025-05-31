import React from 'react';

const Add = React.forwardRef((props, ref) => {
  return React.createElement('span', {
    'data-testid': 'mui-icon-add',
    ref,
    ...props,
  }, props.children || 'Add');
});

Add.displayName = 'Add';

export default Add;
