"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({children} : {children: ReactNode}){
    const [theme, setTheme] = useState<Theme>(() => {
        if(typeof window !== "undefined"){
            return (localStorage.getItem("theme") as Theme) || "system";
        }
        return "system";
    });

    useEffect(() => {

        const applyTheme = (selectedTheme: Theme) => {
            if(selectedTheme === 'system'){
                const systemTheme = window.matchMedia("(prefer-color-scheme: dark)").matches ? "dark" : "light";
                document.documentElement.classList.remove("light", "dark");
                document.documentElement.classList.add(systemTheme);
            }else{
                document.documentElement.classList.remove("light", "dark");
                document.documentElement.classList.add(theme);
            }
        };
        applyTheme(theme);
        localStorage.setItem("theme", theme);

        if(theme === "system"){
            const mediaQuery = window.matchMedia("(prefer-color-scheme: dark)");
            const handleChange = () => applyTheme("system");
            mediaQuery.addEventListener("change", handleChange);

            return () => {
                mediaQuery.removeEventListener("change", handleChange);
            }
        }
    }, [theme]);


    return (
        <ThemeContext.Provider value={{theme, setTheme}}>
            {children}
        </ThemeContext.Provider>
    );
}

// Custom hook to use the Theme context
export function useTheme(){
    const context = useContext(ThemeContext);
    if(!context){
        throw new Error("Use Theme must be used in the Theme Provider");
    }
    return context;
}
