import { useEffect } from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import fetchWithAuth from "../typeScriptFunc/fetchWithAuth.ts";
const useCheckCookie = () => {
    const navigate = useNavigate();
    const location = useLocation()
    useEffect(() => {
        if (location.pathname=="/login" || location.pathname=="/signIn"){
            return
        }

        const checkCookie = async () => {
            fetchWithAuth('/api/checkCookie', {
                method: 'POST',
                headers: {
                    credentials: 'include'
                }
            }).then(response => {
                return response.json()
            }).then(
                data => {
                    if (!data.response) {
                        navigate('/login');
                    }
                }
            ).catch(error => {
                console.error('Error checking cookie:', error);
                navigate('/login');
            })
        };

        checkCookie().then(()=>{});
    }, [navigate]);
};

export default useCheckCookie;