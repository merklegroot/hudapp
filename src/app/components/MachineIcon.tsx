'use client';

import { 
  SiApple,
  SiIntel,
  SiRaspberrypi
} from 'react-icons/si';
import { FaDesktop, FaLaptop, FaServer, FaQuestion, FaBuilding, FaMicrochip } from 'react-icons/fa';
import { HiDesktopComputer } from 'react-icons/hi';

interface MachineIconProps {
  machineModel: string;
  className?: string;
}

// Custom SVG Icon Component
interface CustomSVGProps {
  path: string;
  viewBox?: string;
  className?: string;
  fill?: string;
}

const CustomSVG = ({ path, viewBox = "0 0 24 24", className = "w-6 h-6", fill = "currentColor" }: CustomSVGProps) => (
  <svg
    viewBox={viewBox}
    className={className}
    fill={fill}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d={path} />
  </svg>
);

// Custom brand SVG paths (simplified for size)
const BrandLogos = {
  // ASUS ROG simplified logo
  ROG: "M12 2L22 7v10l-10 5L2 17V7l10-5zm0 2.5L4.5 8.25v7.5L12 19.5l7.5-3.75v-7.5L12 4.5zm0 3L8 9.5v5l4 2 4-2v-5L12 7.5z",
  
  // Dell simplified logo
  DELL: "M2 8h20v8H2V8zm2 2v4h16v-4H4zm1 1h14v2H5v-2z",
  
  // HP simplified logo  
  HP: "M2 6h8v12H2V6zm12 0h8v12h-8V6zM4 8v8h4V8H4zm12 0v8h4V8h-4z",
  
  // Lenovo simplified logo
  LENOVO: "M2 10h4v4H2v-4zm6 0h4v4H8v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z",
  
  // MSI simplified logo (gaming/dragon inspired)
  MSI: "M12 2l8 6v8l-8 6-8-6V8l8-6zm0 3L6 9v6l6 4 6-4V9l-6-4z"
};

export default function MachineIcon({ machineModel, className = "w-6 h-6" }: MachineIconProps) {
  const modelLower = machineModel.toLowerCase();

  // Apple machines
  if (modelLower.includes('macbook') || modelLower.includes('imac') || 
      modelLower.includes('mac mini') || modelLower.includes('mac pro') || 
      modelLower.includes('mac studio') || modelLower.includes('apple')) {
    return <SiApple className={`${className} text-gray-700`} />;
  }
  
  // Dell machines
  if (modelLower.includes('dell') || modelLower.includes('inspiron') || 
      modelLower.includes('latitude') || modelLower.includes('precision') || 
      modelLower.includes('xps') || modelLower.includes('optiplex') || 
      modelLower.includes('vostro') || modelLower.includes('alienware')) {
    return <CustomSVG path={BrandLogos.DELL} className={`${className} text-blue-600`} />;
  }
  
  // HP machines
  if (modelLower.includes('hp ') || modelLower.includes('hewlett') || 
      modelLower.includes('pavilion') || modelLower.includes('elitebook') || 
      modelLower.includes('probook') || modelLower.includes('spectre') || 
      modelLower.includes('envy') || modelLower.includes('omen') || 
      modelLower.includes('compaq')) {
    return <CustomSVG path={BrandLogos.HP} className={`${className} text-blue-500`} />;
  }
  
  // Lenovo machines
  if (modelLower.includes('lenovo') || modelLower.includes('thinkpad') || 
      modelLower.includes('thinkcentre') || modelLower.includes('ideapad') || 
      modelLower.includes('yoga') || modelLower.includes('legion') || 
      modelLower.includes('thinkstation')) {
    return <CustomSVG path={BrandLogos.LENOVO} className={`${className} text-red-600`} />;
  }
  
  // ASUS machines
  if (modelLower.includes('asus') || modelLower.includes('zenbook') || 
      modelLower.includes('vivobook') || modelLower.includes('expertbook') || 
      modelLower.includes('proart') || modelLower.includes('tuf ')) {
    return <FaBuilding className={`${className} text-black`} />;
  }
  
  // ASUS ROG (Gaming) - Special case with custom logo
  if (modelLower.includes('rog ') || modelLower.includes('republic of gamers') ||
      modelLower.includes('strix') || modelLower.includes('gaming')) {
    return <CustomSVG path={BrandLogos.ROG} className={`${className} text-red-600`} />;
  }
  
  // MSI machines
  if (modelLower.includes('msi') || modelLower.includes('stealth') || 
      modelLower.includes('creator') || modelLower.includes('prestige') || 
      modelLower.includes('modern')) {
    return <CustomSVG path={BrandLogos.MSI} className={`${className} text-red-500`} />;
  }
  
  // Acer machines
  if (modelLower.includes('acer') || modelLower.includes('aspire') || 
      modelLower.includes('swift') || modelLower.includes('spin') || 
      modelLower.includes('nitro') || modelLower.includes('predator') || 
      modelLower.includes('chromebook') || modelLower.includes('travelmate')) {
    return <FaBuilding className={`${className} text-green-600`} />;
  }
  
  // Samsung machines
  if (modelLower.includes('samsung') || modelLower.includes('galaxy book') || 
      modelLower.includes('notebook') || modelLower.includes('chromebook')) {
    return <FaBuilding className={`${className} text-blue-700`} />;
  }
  
  // Microsoft Surface
  if (modelLower.includes('surface') || modelLower.includes('microsoft')) {
    return <FaBuilding className={`${className} text-blue-600`} />;
  }
  
  // Raspberry Pi
  if (modelLower.includes('raspberry') || modelLower.includes('pi ')) {
    return <SiRaspberrypi className={`${className} text-red-500`} />;
  }
  
  // Intel NUC
  if (modelLower.includes('nuc') || modelLower.includes('intel')) {
    return <SiIntel className={`${className} text-blue-600`} />;
  }
  
  // Generic device type detection based on model names
  if (modelLower.includes('server') || modelLower.includes('rack') || 
      modelLower.includes('blade') || modelLower.includes('poweredge') || 
      modelLower.includes('proliant')) {
    return <FaServer className={`${className} text-gray-600`} />;
  }
  
  if (modelLower.includes('laptop') || modelLower.includes('notebook') || 
      modelLower.includes('book') || modelLower.includes('portable')) {
    return <FaLaptop className={`${className} text-gray-600`} />;
  }
  
  if (modelLower.includes('desktop') || modelLower.includes('tower') || 
      modelLower.includes('workstation') || modelLower.includes('pc')) {
    return <HiDesktopComputer className={`${className} text-gray-600`} />;
  }
  
  // Generic computer fallback
  if (modelLower.includes('computer') || modelLower.includes('system') || 
      modelLower !== 'unknown') {
    return <FaDesktop className={`${className} text-gray-600`} />;
  }
  
  // Unknown machine fallback
  return <FaQuestion className={`${className} text-gray-500`} />;
}
