import * as React from 'react';
import LogoSvg from '@/assets/logo.svg';

export type LogoProps = React.SVGProps<SVGSVGElement> & {
  title?: string;
  alt?: string;
  className?: string;
};

/**
 * @description 로고
 */
const Logo: React.FC<LogoProps> = props => {
  return <LogoSvg {...props} />;
};

export default Logo;
