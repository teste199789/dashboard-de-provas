export const formatPercent = (value) => {
  if (isNaN(value) || !isFinite(value)) {
    return '0,00%';
  }
  return `${(value * 100).toFixed(2).replace('.', ',')}%`;
};