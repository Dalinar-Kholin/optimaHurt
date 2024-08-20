import {TextField} from "@mui/material";
import Box from "@mui/material/Box";
interface IHurtResultForm {
    name: string,
    princeForOne: number,
    priceForPack: number,
    productsInPack: number
}

export default function HurtResultForm({name, princeForOne, priceForPack, productsInPack}: IHurtResultForm) {
    return (
        <>
            <Box sx={{display: "flex", gap: "10px", justifyContent: "space-around"}} >
                    <TextField
                        disabled
                        id="outlined-disabled"
                        label="nazwa Hurtowni"
                        value={name}
                    />
                    <TextField
                        disabled
                        id="outlined-disabled"
                        label="cena za sztukę"
                        value={princeForOne === -1 ? "Brak produktu" : princeForOne}
                    />
                    <TextField
                        disabled
                        id="outlined-disabled"
                        label={"Cena za " + (productsInPack === -1 ? "" : productsInPack)}
                        value={priceForPack === -1 ? "Brak produktu" : priceForPack.toFixed(2)}
                    />
            </Box>
        </>
    )
}