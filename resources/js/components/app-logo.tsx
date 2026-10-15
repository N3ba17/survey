import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name } = usePage().props;
    const displayName = !name || name === 'Laravel' ? 'EEC Portal' : name;

    return (
        <>
            <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-white p-1 shadow-xs border border-sidebar-border/60">
                <AppLogoIcon variant="icon" className="size-6 object-contain" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm leading-none">
                <span className="mb-0.5 truncate font-bold text-sidebar-foreground">
                    {displayName}
                </span>
                <span className="truncate text-[11px] text-muted-foreground font-medium">
                    Supplier Survey
                </span>
            </div>
        </>
    );
}
