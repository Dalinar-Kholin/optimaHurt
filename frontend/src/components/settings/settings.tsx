import AccountSetting from "./accountSetting/accountSetting.tsx";
import HurtSetting from "./hurtSetting/hurtSetting.tsx";
import {SyntheticEvent, useState} from "react";
import Box from "@mui/material/Box";
import TabContext from '@mui/lab/TabContext';
import {Alert, Button, Tab} from "@mui/material";
import {TabList, TabPanel} from "@mui/lab";
import {hurtNames} from "../../interfaces.ts";
import fetchWithAuth from "../../typeScriptFunc/fetchWithAuth.ts";

export interface INewDataHurt{
    login : string,
    password : string,
    hurtName : hurtNames
}

export interface INewAccountData{

}

export interface INewCompanyData{

}

export default function SettingPage(){
    const [value, setValue] = useState('2');

    const [newHurtData, setNewHurtData] = useState<INewDataHurt[]>([])
    const [newAccountData, setNewAccountData] = useState<string>("")
    const [_newCompanyData, _setNewCompanyData] = useState<INewCompanyData[]>([])

    const [showAlert, setShowAlert] = useState<boolean>(false)
    const [isProper, setIsProper] = useState<boolean>(false)
    const handleChange = (_event: SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    return(
        <>
            <Box sx={{ width: '100%', typography: 'body1',padding: "30px 10px",margin: "30px auto", borderRadius: "20px",backgroundColor: "#363636" }}>
                <TabContext value={value}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider',display: "flex", justifyContent: "center" }}>
                        <TabList onChange={handleChange} aria-label="lab API tabs example" >
                            <Tab label="ustawienia konta" value="1" />
                            <Tab label="ustawienia hurtowni" value="2" />
                            {/*<Tab label="dane firmy" value="3" />*/}
                        </TabList>
                    </Box>
                    <TabPanel value="1">
                        <AccountSetting fn={(s: string)=>{
                            setNewAccountData(s)
                        }}/>
                    </TabPanel>
                    <TabPanel value="2">
                        <HurtSetting fn={(username, pass, name)=> {
                            if (!newHurtData.some(i => i.hurtName==name)) {
                                setNewHurtData([...newHurtData, {
                                    login: username,
                                    password: pass,
                                    hurtName: name
                                }])
                            }
                        }}/>
                    </TabPanel>
                    {/*<TabPanel value="3">
                        <CompanyData/>
                    </TabPanel>*/}

                </TabContext>
                {newHurtData.length!==0 || newAccountData!=="" || _newCompanyData.length!==0 ? <Button variant={"contained"} color={"success"} onClick={()=> {
                    const dataToSend= {
                        newHurtData: newHurtData,
                        newCompanyData: _newCompanyData,
                        newAccountData: newAccountData,
                    }
                    fetchWithAuth("/api/changeUserData", {
                        method: "PATCH",
                        body: JSON.stringify(dataToSend)
                    }).then(response => {

                        if (response.status!== 200){
                            throw new Error("dupa")
                        }
                        setShowAlert(true)
                        setIsProper(true)
                    }).catch( ()=> {
                        setShowAlert(true)
                        setIsProper(false)
                    })


                }}> zapisz zmiany</Button> : <></>}

                {!showAlert? <></> : isProper ? <Alert variant="filled" severity="success">
                    udało się zapisać dane
                </Alert> : <Alert variant="filled" severity="error">
                    nie udało się zapisać danych
                </Alert>}
            </Box>

        </>
    )
}
