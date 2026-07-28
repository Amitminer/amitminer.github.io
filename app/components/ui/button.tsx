import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/app/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-sky-400/90 via-cyan-400/90 to-blue-500/90 backdrop-blur-md text-slate-950 font-bold border border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)] hover:from-sky-300 hover:via-cyan-300 hover:to-blue-400',
        emerald:
          'bg-gradient-to-r from-emerald-400/90 via-teal-400/90 to-cyan-500/90 backdrop-blur-md text-slate-950 font-bold border border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)] hover:from-emerald-300 hover:via-teal-300 hover:to-cyan-400',
        amber:
          'bg-gradient-to-r from-amber-400/90 via-orange-400/90 to-amber-500/90 backdrop-blur-md text-slate-950 font-bold border border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)] hover:from-amber-300 hover:via-orange-300 hover:to-amber-400',
        rose:
          'bg-gradient-to-r from-rose-500/90 via-red-500/90 to-amber-500/90 backdrop-blur-md text-slate-950 font-bold border border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)] hover:from-rose-400 hover:via-red-400 hover:to-amber-400',
        destructive:
          'bg-gradient-to-r from-red-900/80 to-rose-900/80 text-red-100 border border-red-700/60 hover:from-red-800 hover:to-rose-800',
        outline:
          'border border-slate-700/80 bg-slate-900/80 text-slate-100 backdrop-blur-md hover:bg-slate-800 hover:border-slate-600 hover:text-white',
        secondary:
          'bg-slate-800/90 text-slate-200 border border-slate-700/80 hover:bg-slate-700 hover:border-slate-600 hover:text-white',
        ghost: 'hover:bg-slate-800/60 text-slate-300 hover:text-white',
        link: 'text-sky-400 underline-offset-4 hover:underline hover:text-sky-300',
      },
      size: {
        default: 'h-11 px-6 py-2.5 text-sm',
        sm: 'h-9 px-4 py-1.5 text-xs',
        lg: 'h-12 px-7 py-3 text-base',
        icon: 'h-11 w-11 p-0 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
