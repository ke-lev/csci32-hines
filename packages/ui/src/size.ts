export enum Size {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

const buttonSizeClasses: Record<Size, string> = {
  [Size.SMALL]: 'min-h-6 px-2.5 py-1.5 text-[0.58rem] tracking-[0.05em]',
  [Size.MEDIUM]: 'px-[18px] py-[11px] text-[0.72rem] tracking-[0.04em]',
  [Size.LARGE]: 'min-h-12 px-7 py-4 text-[0.86rem] tracking-[0.035em]',
}

const inputSizeClasses: Record<Size, string> = {
  [Size.SMALL]: 'min-h-6 px-3 py-1.5 text-[0.58rem] tracking-[0.03em]',
  [Size.MEDIUM]: 'px-[18px] py-[11px] text-[0.72rem] tracking-[0.02em]',
  [Size.LARGE]: 'min-h-12 px-7 py-4 text-[0.86rem] tracking-[0.02em]',
}

export function getButtonSizeStyles(size: Size) {
  return buttonSizeClasses[size]
}

export function getInputSizeStyles(size: Size) {
  return inputSizeClasses[size]
}
