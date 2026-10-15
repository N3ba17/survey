import * as React from 'react';
import * as RechartsPrimitive from 'recharts';
import { cn } from '@/lib/utils';

export type ChartConfig = Record<
    string,
    {
        label?: React.ReactNode;
        color?: string;
    }
>;

type ChartContainerProps = React.ComponentProps<'div'> & {
    config: ChartConfig;
    children: React.ComponentProps<
        typeof RechartsPrimitive.ResponsiveContainer
    >['children'];
};

/**
 * Responsive, config-driven shell around a Recharts chart (shadcn chart
 * container pattern). Each entry in `config` is exposed as a `--color-<key>`
 * CSS variable on the container so chart markup can style itself by key.
 */
export function ChartContainer({
    config,
    children,
    className,
    ...props
}: ChartContainerProps) {
    const chartId = `chart-${React.useId().replace(/:/g, '')}`;

    const variables = Object.entries(config)
        .map(([key, item]) =>
            item.color ? `--color-${key}: ${item.color};` : '',
        )
        .join(' ');

    return (
        <div data-chart={chartId} className={cn('w-full', className)} {...props}>
            <style>{`[data-chart="${chartId}"]{${variables}}`}</style>
            <RechartsPrimitive.ResponsiveContainer>
                {children}
            </RechartsPrimitive.ResponsiveContainer>
        </div>
    );
}
