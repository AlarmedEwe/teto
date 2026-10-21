import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faCar,
  faBullseye,
  faWineGlass,
  faDollarSign,
  faGraduationCap,
  faHeartPulse,
  faUtensils,
  faPlane,
  faGamepad,
  faBagShopping,
  faTag,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

export interface CategoryIconOption {
  id: string;
  label: string;
  icon: IconDefinition;
}

export const CATEGORY_ICON_MAP: Record<string, IconDefinition> = {
  house: faHouse,
  car: faCar,
  bullseye: faBullseye,
  'wine-glass': faWineGlass,
  'dollar-sign': faDollarSign,
  'graduation-cap': faGraduationCap,
  'heart-pulse': faHeartPulse,
  utensils: faUtensils,
  plane: faPlane,
  gamepad: faGamepad,
  'bag-shopping': faBagShopping,
  tag: faTag,
};

export const AVAILABLE_CATEGORY_ICONS: CategoryIconOption[] = [
  { id: 'house', label: 'Custos Fixos / Casa', icon: faHouse },
  { id: 'car', label: 'Conforto / Carro', icon: faCar },
  { id: 'bullseye', label: 'Metas / Alvo', icon: faBullseye },
  { id: 'wine-glass', label: 'Prazeres / Lazer', icon: faWineGlass },
  { id: 'dollar-sign', label: 'Investimentos / $', icon: faDollarSign },
  { id: 'graduation-cap', label: 'Conhecimento / Estudos', icon: faGraduationCap },
  { id: 'heart-pulse', label: 'Saúde', icon: faHeartPulse },
  { id: 'utensils', label: 'Alimentação', icon: faUtensils },
  { id: 'plane', label: 'Viagens', icon: faPlane },
  { id: 'gamepad', label: 'Jogos / Entretenimento', icon: faGamepad },
  { id: 'bag-shopping', label: 'Compras', icon: faBagShopping },
  { id: 'tag', label: 'Outros / Padrão', icon: faTag },
];

export function resolveCategoryIcon(iconName?: string | null, categoryName?: string): IconDefinition {
  if (iconName && CATEGORY_ICON_MAP[iconName]) {
    return CATEGORY_ICON_MAP[iconName];
  }

  if (categoryName) {
    const lower = categoryName.toLowerCase();
    if (lower.includes('custo') || lower.includes('fixo') || lower.includes('casa') || lower.includes('moradia')) {
      return faHouse;
    }
    if (lower.includes('conforto') || lower.includes('carro') || lower.includes('transporte')) {
      return faCar;
    }
    if (lower.includes('meta') || lower.includes('reserva') || lower.includes('objetivo')) {
      return faBullseye;
    }
    if (lower.includes('prazer') || lower.includes('lazer') || lower.includes('restaurante')) {
      return faWineGlass;
    }
    if (lower.includes('invest') || lower.includes('liberdade') || lower.includes('ações') || lower.includes('fii')) {
      return faDollarSign;
    }
    if (lower.includes('conhec') || lower.includes('estudo') || lower.includes('curso') || lower.includes('livro')) {
      return faGraduationCap;
    }
    if (lower.includes('saúde') || lower.includes('saude') || lower.includes('medico')) {
      return faHeartPulse;
    }
    if (lower.includes('mercado') || lower.includes('alimento')) {
      return faUtensils;
    }
  }

  return faTag;
}

interface CategoryIconProps {
  icon?: string | null;
  categoryName?: string;
  colorHex?: string;
  variant?: 'pure' | 'badge' | 'circle' | 'solid-circle';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  icon,
  categoryName,
  colorHex = '#f59e0b',
  variant = 'badge',
  size = 'sm',
  className = '',
}) => {
  const iconDef = resolveCategoryIcon(icon, categoryName);

  if (variant === 'pure') {
    const sizeClasses = {
      xs: 'w-3 h-3 text-[10px]',
      sm: 'w-3.5 h-3.5 text-xs',
      md: 'w-4 h-4 text-sm',
      lg: 'w-5 h-5 text-base',
    }[size];

    return (
      <FontAwesomeIcon
        icon={iconDef}
        className={`${sizeClasses} ${className}`}
        style={colorHex ? { color: colorHex } : undefined}
      />
    );
  }

  if (variant === 'solid-circle') {
    const badgeSizes = {
      xs: 'w-6 h-6 text-[10px]',
      sm: 'w-8 h-8 text-xs',
      md: 'w-9 h-9 text-sm',
      lg: 'w-11 h-11 text-base',
    }[size];

    return (
      <div
        className={`${badgeSizes} rounded-full flex items-center justify-center text-white shrink-0 shadow-md ${className}`}
        style={{ backgroundColor: colorHex }}
      >
        <FontAwesomeIcon icon={iconDef} />
      </div>
    );
  }

  if (variant === 'circle') {
    const badgeSizes = {
      xs: 'w-6 h-6 text-[10px]',
      sm: 'w-8 h-8 text-xs',
      md: 'w-9 h-9 text-sm',
      lg: 'w-11 h-11 text-base',
    }[size];

    return (
      <div
        className={`${badgeSizes} rounded-full flex items-center justify-center shrink-0 border transition-transform duration-200 ${className}`}
        style={{
          backgroundColor: `${colorHex}22`,
          borderColor: `${colorHex}44`,
          color: colorHex,
        }}
      >
        <FontAwesomeIcon icon={iconDef} />
      </div>
    );
  }

  // Variant 'badge' (rounded-xl)
  const badgeSizes = {
    xs: 'w-6 h-6 text-[10px] rounded-lg',
    sm: 'w-7 h-7 text-xs rounded-xl',
    md: 'w-9 h-9 text-sm rounded-xl',
    lg: 'w-10 h-10 text-base rounded-2xl',
  }[size];

  return (
    <div
      className={`${badgeSizes} flex items-center justify-center shrink-0 border transition-all ${className}`}
      style={{
        backgroundColor: `${colorHex}18`,
        borderColor: `${colorHex}38`,
        color: colorHex,
      }}
    >
      <FontAwesomeIcon icon={iconDef} />
    </div>
  );
};
