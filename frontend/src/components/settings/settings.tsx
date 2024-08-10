import AccountSetting from "./accountSetting/accountSetting.tsx";
import HurtSetting from "./hurtSetting/hurtSetting.tsx";
import CompanyData from "./companyData/companyData.tsx";
import {SyntheticEvent, useState} from "react";
import Box from "@mui/material/Box";
import TabContext from '@mui/lab/TabContext';
import {Tab} from "@mui/material";
import {TabList, TabPanel} from "@mui/lab";


export default function SettingPage(){
    const [value, setValue] = useState('1');

    const handleChange = (_event: SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    return(
        <>
            <Box sx={{ width: '100%', typography: 'body1',padding: "30px auto",margin: "30px auto", borderRadius: "20px",backgroundColor: "#363636" }}>
                <TabContext value={value}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider',display: "flex", justifyContent: "center" }}>
                        <TabList onChange={handleChange} aria-label="lab API tabs example">
                            <Tab label="ustawienia konta" value="1" />
                            <Tab label="ustawienia hurtowni" value="2" />
                            <Tab label="dane firmy" value="3" />
                        </TabList>
                    </Box>
                    <TabPanel value="1">
                        <AccountSetting/>
                    </TabPanel>
                    <TabPanel value="2">
                        <HurtSetting/>
                    </TabPanel>
                    <TabPanel value="3">
                        <CompanyData/>
                    </TabPanel>
                </TabContext>
            </Box>

        </>
    )
}

/*
            <Root className="TabsRoot" defaultValue="AccountSetting" style={
                {padding: "30px",  backgroundColor: "#222", margin: "40px auto", borderRadius: "10px"}
            }>
                <List className="TabsList" aria-label="Manage your account">
                    <Trigger className="TabsTrigger" value="hurtSetting">
                        Ustawienia hurtowni
                    </Trigger>
                    <Trigger className="TabsTrigger" value="AccountSettings">
                        Ustawienia Konta
                    </Trigger>
                    <Trigger className="TabsTrigger" value="companyData">
                        Dane Firmy
                    </Trigger>
                </List>
                <Content className="TabsContent" value="AccountSettings">
                    <AccountSetting/>
                </Content>
                <Content className="TabsContent" value="hurtSetting">
                    <HurtSetting/>
                </Content>
                <Content className="TabsContent" value="companyData">
                    <CompanyData/>
                </Content>
            </Root>
*/