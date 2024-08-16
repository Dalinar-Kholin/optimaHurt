import {hurtNames} from "../../../interfaces.ts";
import {Alert, AlertTitle, TextField} from "@mui/material";
import {useState} from "react";
import fetchWithAuth from "../../../typeScriptFunc/fetchWithAuth.ts";
interface IHurtComp{
    name : hurtNames
    fn : (username: string, pass : string, name : hurtNames) => void
}


export default function HurtComp({name, fn} : IHurtComp){
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [error, setError] = useState<string>("")

    return(
        <>
            <form>
                <TextField value={username}  autoComplete={"off"} label={"username"} onChange={(e)=>{
                    setUsername(e.target.value)
                }}></TextField>
                <TextField value={password}  autoComplete={"off"} label={"password"} onChange={(e)=>{
                    setPassword(e.target.value)
                }}
                        onKeyDown={(e)=> {
                            if (e.key=="Enter"){
                                const body = {
                                    username : username,
                                    password: password,
                                    hurtName: name
                                }
                                fetchWithAuth("/api/checkCredentials",  {
                                    body: JSON.stringify(body),
                                    method: "POST",
                                    headers:{
                                        "Content-Type": "application/json"
                                    }
                                }).then(response =>{
                                    if (response.status!=200){
                                        response.json().then(data => {
                                            setError(data.error)
                                        })
                                        return;
                                    }
                                    // jeżeli dostaliśmy 200 oznacza że dane są prawidłowe i możemy jest ustawić
                                    setError("")
                                    fn(username, password, name)
                                    return
                                }).catch(_err =>{
                                        setError("network error")

                                })
                            }
                        }}
                ></TextField>
                {error === "" ? <div></div> : <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {error}
                </Alert>}
            </form>
        </>
    )
}