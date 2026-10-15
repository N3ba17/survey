import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type AppLogoIconProps = ImgHTMLAttributes<HTMLImageElement> & {
    variant?: 'full' | 'icon';
};

export default function AppLogoIcon({
    className,
    alt = 'EEC Logo',
    variant = 'full',
    ...props
}: AppLogoIconProps) {
    const src = variant === 'icon' ? '/images/eec-icon.png' : '/images/eec-logo.jpg';

    return (
        <img
            src={src}
            alt={alt}
            className={cn('h-8 w-auto max-w-full object-contain', className)}
            {...props}
        />
    );
}
