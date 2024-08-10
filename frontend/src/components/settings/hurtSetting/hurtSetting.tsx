import {Accordion, AccordionDetails, AccordionSummary} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {hurtNames, hurtNamesIterable} from "../../../interfaces.ts";
import HurtComp from "./hurtComp.tsx";

interface IHurtSettings{
    fn : (username: string, pass : string, name : hurtNames) => void
}

export default function HurtSetting({fn} : IHurtSettings) {
    const availableHurtGetResult = localStorage.getItem("availableHurts")
    const availableHurt = availableHurtGetResult!==null ? +availableHurtGetResult : 0 // nie tylkać bo kompilator spadnie z rowerka
    return (
        <div>
            <p>{availableHurt}</p>
            {hurtNamesIterable.map(name =>
                {

                    return name === hurtNames.none ? <></> : <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}
                        aria-controls="panel1-content"
                        id="panel1-header"
                        sx={{backgroundColor:(availableHurt&name) > 0 ? "#81c784" : "" }}
                    >
                        {hurtNames[name] + ((availableHurt&name)>0 ? " - obecne dane są poprawne" : "")}
                    </AccordionSummary>
                    <AccordionDetails>
                        <HurtComp fn={(username, pass, name) => {
                            fn(username, pass, name)
                        }} name={name}
                        />
                    </AccordionDetails>
                </Accordion>}
                )
            }
        </div>
    )
}