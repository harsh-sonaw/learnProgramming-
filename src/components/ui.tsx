import React from 'react';

/**
 * Shared presentation primitives. Every page is built from these so the site
 * reads as one product instead of a pile of one-off screens: one container
 * width, one heading scale, one accent colour, flat surfaces.
 */

const WIDTHS = {
  narrow: 'max-w-2xl',
  default: 'max-w-4xl',
  wide: 'max-w-6xl',
} as const;

export const Page: React.FC<{
  children: React.ReactNode;
  width?: keyof typeof WIDTHS;
  className?: string;
}> = ({ children, width = 'default', className = '' }) => (
  <div className={`mx-auto w-full ${WIDTHS[width]} px-5 py-10 sm:px-8 sm:py-14 ${className}`}>
    {children}
  </div>
);

export const PageHeader: React.FC<{
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}> = ({ eyebrow, title, description, actions }) => (
  <header className="mb-10 border-b border-slate-800 pb-8">
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 text-[11px] uppercase tracking-widest text-slate-500">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  </header>
);

export const Section: React.FC<{
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, description, actions, children, className = '' }) => (
  <section className={`mb-10 last:mb-0 ${className}`}>
    {(title || actions) && (
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          {title && <h2 className="text-sm font-medium text-slate-200">{title}</h2>}
          {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
        </div>
        {actions}
      </div>
    )}
    {children}
  </section>
);

export const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`text-[11px] uppercase tracking-widest text-slate-500 ${className}`}>{children}</p>
);

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'li' | 'article';
}> = ({ children, className = '', as: Tag = 'div' }) => (
  <Tag className={`rounded-lg border border-slate-800 bg-slate-900/40 ${className}`}>{children}</Tag>
);

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';

const BUTTON_VARIANTS = {
  primary: 'bg-emerald-400 text-slate-950 hover:bg-emerald-300',
  secondary: 'border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800',
  ghost: 'text-slate-400 hover:bg-slate-900 hover:text-white',
} as const;

const BUTTON_SIZES = {
  sm: 'min-h-8 px-3 text-xs',
  md: 'min-h-10 px-4',
} as const;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: keyof typeof BUTTON_SIZES;
};

export const Button: React.FC<ButtonProps> = ({ variant = 'secondary', size = 'md', className = '', ...rest }) => (
  <button className={`${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`} {...rest} />
);

export const ButtonLink: React.FC<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    variant?: keyof typeof BUTTON_VARIANTS;
    size?: keyof typeof BUTTON_SIZES;
  }
> = ({ variant = 'secondary', size = 'md', className = '', ...rest }) => (
  <a className={`${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`} {...rest} />
);

export const inputClass =
  'w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none';

export const Field: React.FC<{
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}> = ({ label, hint, htmlFor, children }) => (
  <div>
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-slate-300">
      {label}
    </label>
    {children}
    {hint && <p className="mt-1.5 text-[11px] text-slate-500">{hint}</p>}
  </div>
);

export const Progress: React.FC<{ value: number; max: number; label: string }> = ({ value, max, label }) => (
  <progress
    aria-label={label}
    value={value}
    max={max || 1}
    className="track-progress block h-1 w-full"
  />
);

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="rounded-lg border border-dashed border-slate-800 px-6 py-12 text-center">
    {icon && <div className="mb-3 flex justify-center text-slate-600">{icon}</div>}
    <p className="text-sm font-medium text-slate-200">{title}</p>
    {description && <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>}
    {action && <div className="mt-5 flex justify-center">{action}</div>}
  </div>
);

/** Key/value row used in stat blocks and lists. */
export const Stat: React.FC<{ label: string; value: React.ReactNode; hint?: string }> = ({
  label,
  value,
  hint,
}) => (
  <div className="border-t border-slate-800 pt-3 first:border-0 first:pt-0">
    <Label>{label}</Label>
    <p className="mt-1 font-mono text-lg text-slate-100">{value}</p>
    {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
  </div>
);
