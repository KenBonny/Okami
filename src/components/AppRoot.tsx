import { useEffect, useRef } from "react";
import GoogleAuth from "./GoogleAuth";
import { createManager } from "./manager";
import type { User } from "./Models";

export default function AppRoot() {
    const appRootRef = useRef<HTMLDivElement>(null);
    const authContainerRef = useRef<HTMLDivElement>(null);
    const managerRef = useRef<ReturnType<typeof createManager> | null>(null);

    useEffect(() => {
        if (!appRootRef.current || !authContainerRef.current) return;

        managerRef.current = createManager({
            rootElement: appRootRef.current,
            googleAuthComponent: authContainerRef.current,
        });
    }, []);

    const handleAuthSuccess = (user: User) => {
        managerRef.current?.setUser(user);
    };

    const handleLogout = () => {
        managerRef.current?.setUser(null);
    };

    return (
        <>
            <div ref={authContainerRef}>
                <GoogleAuth className="justify-end" onSuccess={handleAuthSuccess} onLogout={handleLogout} />
            </div>
            <div ref={appRootRef} />
        </>
    );
}
