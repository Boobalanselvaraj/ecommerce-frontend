export default function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeMap = {
    sm: { container: 'w-6 h-6', outerBorder: 'border-[2px]', inner: 'w-3.5 h-3.5 border-[1.5px]', innerOffset: '2.5s' },
    md: { container: 'w-12 h-12', outerBorder: 'border-[3px]', inner: 'w-7 h-7 border-[2px]', innerOffset: '1.5s' },
    lg: { container: 'w-20 h-20', outerBorder: 'border-[4px]', inner: 'w-11 h-11 border-[2.5px]', innerOffset: '1s' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`relative flex items-center justify-center ${currentSize.container} ${className}`}>
      {/* Outer Spinner: slow clockwise */}
      <div className={`absolute inset-0 rounded-full border-brand-500/10 border-t-brand-600 animate-spin [animation-duration:1.8s] ${currentSize.outerBorder}`} />
      
      {/* Inner Spinner: fast counter-clockwise */}
      <div className={`absolute rounded-full border-purple-500/10 border-b-purple-500 animate-spin [animation-direction:reverse] [animation-duration:1s] ${currentSize.inner}`} />
      
      {/* Center glowing pulse dot */}
      <div className="absolute w-1.5 h-1.5 rounded-full bg-brand-500 shadow-md shadow-brand-500/80 animate-ping" />
      <div className="absolute w-1 h-1 rounded-full bg-brand-600" />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] gap-6 animate-fade-in">
      <div className="relative">
        <LoadingSpinner size="lg" />
        {/* Ambient background glow */}
        <div className="absolute inset-0 bg-brand-500/10 blur-xl rounded-full scale-150 animate-pulse pointer-events-none" />
      </div>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <p className="text-sm font-bold bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400 bg-clip-text text-transparent tracking-wider uppercase">
          Loading amazing things
        </p>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-wide">Please wait a moment</span>
      </div>
    </div>
  );
}
