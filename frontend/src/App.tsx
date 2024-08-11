import LoginForm from "./components/login/loginForm.tsx";
import { Navigate, Route, Routes, useLocation} from 'react-router-dom';
import MainSite from "./components/home/mainSite.tsx";
import AppBarCustomed from "./components/appBar/appBar.tsx";
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import useCheckCookie from "./customHook/useCheckCookie.ts";
import Tariff from "./components/tariff/Tariff.tsx";
import SettingPage from "./components/settings/settings.tsx";
import {useEffect, useState} from "react";


const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});


function CheckCookie() {
    useCheckCookie();
    return <></>
}




function App() {
    const [showAppBar, setShowAppBar] = useState<boolean>(false)

    const location = useLocation();

    useEffect(() => {
        if (location.pathname === "/login") {
            setShowAppBar(false);
        } else {
            setShowAppBar(true);
        }
    }, [location.pathname]);

    return (
        <div>
            <ThemeProvider theme={darkTheme}>
                <CssBaseline/>
                {/*<Router> komponent App jest owrapowany więc tutaj nie trzeba*/}
                    <CheckCookie/>
                    {showAppBar ?<AppBarCustomed /> : <></> }
                    <Routes>
                        <Route path={"/login"} element={<LoginForm/>}/>
                        <Route path={"/main"} element={<MainSite/>}/>
                        <Route path={"/cennik"} element={<Tariff/>}/>
                        <Route path={"/ustawienia"} element={<SettingPage/>}/>
                        <Route path={"/*"} element={<Navigate to={"/main"}/>}/>
                    </Routes>
            </ThemeProvider>
        </div>
    )
}

export default App
