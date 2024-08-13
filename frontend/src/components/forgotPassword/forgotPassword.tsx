import {Alert, Button, TextField} from "@mui/material";
import {useState} from "react";




export default function ForgotPassword(){
    const [email, setEmail] = useState<string>("")
    const [message, setMessage] = useState<string>("")
    const handleClick =  async ()=>{
        fetch("/api/forgotPassword"+ `?email=${email}`).then(response => {
            return response.json()
        }).then(data =>{
            setMessage(data.message)
            }
        )
    }

    return(
        <>
            no niewątpliwie zapomniane
            <TextField value={email} onChange={(e)=>{
                setEmail(e.target.value)
            }}
                onKeyDown={(e)=>{
                    if (e.key == "Enter"){
                        handleClick()}}}/>
            <Button onClick={handleClick}>zresetuj hasło</Button>
            <p></p>
            {message=="" ? <></> : <Alert>{message}</Alert>}
        </>
    )
}