import { useState, useEffect } from "react";

export const useIsDesktop = (breakpoint = 1024): boolean => {
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const handleResize = () =>
            setIsDesktop(window.innerWidth >= breakpoint);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [breakpoint]);

    return isDesktop;
};
