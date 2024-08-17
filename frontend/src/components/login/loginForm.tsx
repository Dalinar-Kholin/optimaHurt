import {useState} from "react";
import {Alert, AlertTitle, Button, TextField} from "@mui/material";
import "./login.css"
import {useNavigate} from "react-router-dom";


export default function LoginForm(){


    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isProperData, setIsProperData] = useState<boolean>(true)
    const [errorMessage, setErrorMessage] = useState<string>("")

    const navigate = useNavigate()

    return (
        <>
            <h1>Logowanie</h1>
            <form onSubmit={e => {
                e.preventDefault()
                // logowanie sie
                const LoginData = {
                    username: username,
                    password: password,
                }
                fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(LoginData),
                }).then(response => {
                    if (!response.ok) {
                        // Próbujemy pobrać dane błędu jako JSON
                        return response.json().then(errorData => {
                            setErrorMessage(errorData.error || "błąd sieci")
                            setIsProperData(false)
                            throw new Error('Error: ' + errorData.error);
                        });
                    }
                    return response.json();
                }).then(data => {

                    if (data.error != undefined){
                        setErrorMessage(data.error)
                        setIsProperData(false)
                        return
                    }

                    localStorage.setItem("accessToken", data.token)
                    localStorage.setItem("availableHurts", "" + data.availableHurts)
                    localStorage.setItem("accountStatus", "" + data.accountStatus)

                    setIsProperData(true)
                    setUsername("")
                    setPassword("")
                    navigate("/main")
                    // dodać ciasteczka
                    // przenieść na stronę główną
                    console.log(data)
                }).catch(error => {
                    console.error('There has been a problem with your fetch operation:', error);
                })

            }}>
                <TextField
                    autoComplete={"off"}
                    id="filled"
                    label="nazaw użytkownia"
                    placeholder="nazaw użytkownia"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                <p></p>
                <TextField
                    id="outlined-password-input"
                    label="hasło"
                    type="hasło"
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <p></p>
                {isProperData ? <div></div> : <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {errorMessage}
                </Alert>}
                <p></p>
                <Button variant="contained" type={"submit"}>
                    zaloguj
                </Button>
                <p></p>
                <Button variant="contained" onClick={() => {
                    navigate("/signIn")
                }}>
                    załóż konto
                </Button>
                <p></p>
                <Button variant="outlined" onClick={() => {
                    navigate("/forgotPassword")
                }}>zapomniałem hasła</Button>

            </form>
        </>
    )

}