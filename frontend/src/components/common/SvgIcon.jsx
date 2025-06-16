import React from 'react';

const SvgIcon = ({ 
  name, 
  className = '', 
  width = '24', 
  height = '24',
  ...props 
}) => {
  return (
    <img 
      src={`/assets/icons/${name}.svg`} 
      alt={name}
      className={className}
      width={width}
      height={height}
      {...props}
    />
  );
};

export default SvgIcon;
