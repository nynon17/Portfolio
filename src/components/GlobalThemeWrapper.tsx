import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

export default function GlobalThemeWrapper({ children }: Props) {
    return <>{children}</>;
}