import { AlertCircle } from 'lucide-react';

export default function FieldError({
    message,
    id,
}: {
    message?: string;
    id?: string;
}) {
    if (!message) return null;

    return (
        <p
            id={id}
            className="mt-1 flex items-center gap-1 text-xs font-medium text-red-500"
        >
            <AlertCircle className="size-3.5 shrink-0" />
            {message}
        </p>
    );
}
