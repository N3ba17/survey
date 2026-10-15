import { useState } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    className?: string;
    imageClassName?: string;
    alt?: string;
};

export default function CompanyLogo({
    className,
    imageClassName,
    alt = 'EEC Logo',
}: Props) {
    const [imgFailed, setImgFailed] = useState(false);

    return (
        <div className={cn('flex shrink-0 items-center justify-center', className)}>
            {!imgFailed ? (
                <img
                    src="/images/eec-logo.jpg"
                    alt={alt}
                    onError={() => setImgFailed(true)}
                    className={cn('h-10 w-auto max-w-full object-contain transition-transform', imageClassName)}
                />
            ) : (
                <div
                    className={cn(
                        'flex h-10 w-auto items-center justify-center rounded-xl bg-gradient-to-br from-[#005577] to-[#00ADC5] px-3 text-white shadow-md shadow-[#00ADC5]/25',
                        imageClassName,
                    )}
                >
                    <span className="text-xs font-black tracking-wider text-white">EEC</span>
                </div>
            )}
        </div>
    );
}
