// Mock AdapterDateFns component
export const AdapterDateFns = function() {
  return {
    date: (date) => date || new Date(),
    format: () => '01/01/2025',
    parse: () => new Date(2025, 0, 1),
    isValid: () => true,
  };
};

export default AdapterDateFns;
