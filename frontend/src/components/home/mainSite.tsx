import {ReactNode, useCallback, useEffect, useState} from "react";
import {
    Alert,
    AlertTitle, Avatar,
    Button,
    CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    List, ListItemAvatar,
    ListItemButton,
    ListItemText,
    Snackbar,
    TextField,
    Typography
} from "@mui/material";
import HurtResultForm from "../hurtResult/HurtResultForm.tsx";
import {hurtNames, IAllResult, IItemInstance, IItemToSearch} from "../../interfaces.ts";
import InputComp from "./inputField/InputField.tsx";
import stratchInputType from "./inputField/handleInputTypes/stracher.ts";
import Box from '@mui/material/Box';
import {getHurtResult, getMultipleHurtResult} from "./resultGrabbers.ts";
import fetchWithAuth from "../../typeScriptFunc/fetchWithAuth.ts";

// niebieska obwódka -- najtańszy pakiet
// zielona obwódka -- najtanicej za produkt
// czerwona obwódka -- najdrożej za produkt


export default function MainSite() {
    // region zmienne
    const [Ean, setEan] = useState<string>("")
    const [prodName, setProdName] = useState<string>("")
    const [selectedEan, setSelectedEan] = useState<string>("")

    const [componentHashTable, setComponentHashTable] = useState<Map<hurtNames, ReactNode>>(new Map<hurtNames, ReactNode>())


    const [errorMessage, setErrorMessage] = useState<string>("")

    const [isLoadingProduct, setIsLoadingProduct] = useState<boolean>(false)


    const [prodToSearch, setProdToSearch] = useState<IItemToSearch[]>([])

    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false)
    const [messageFromBackend, setMessageFromBackend] = useState<string>("")

    const [optItems, setOptItems] = useState<IItemInstance[]>([])
    const [allResult, setAllResult] = useState<IAllResult[]>([])

    const [open, setOpen] = useState<boolean>(false);
    const [agreement, setAgreement] = useState<boolean>(false)




    const [fileName, setFileName] = useState<string>("")

    // endregion

    // region pozwala na przeciąganie plików
    const onDrop = useCallback((event: DragEvent) => {
        event.preventDefault();
        const file = event.dataTransfer?.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                const result = e.target?.result;
                if (result && typeof result === 'string') {
                    setFileName(file.name);
                    setProdToSearch(stratchInputType(result, file.name)(result));
                }
            };

            reader.readAsText(file);
        }
    }, []);

    const onDragOver = useCallback((event: DragEvent) => {
        event.preventDefault();
    }, []);

    useEffect(() => {

        window.addEventListener('dragover', onDragOver);
        window.addEventListener('drop', onDrop);

        return () => {
            window.removeEventListener('dragover', onDragOver);
            window.removeEventListener('drop', onDrop);
        };
    }, [onDrop, onDragOver]);
    // endregion

    const changeResultComp = (ean: string, name: string) => {
        const newComponentHashTable = new Map<hurtNames, ReactNode>()
        setSelectedEan(ean)
        setEan(ean)
        if (allResult.filter((item) => item.ean === ean).length === 0) {
            newComponentHashTable.set(hurtNames.none,
                <HurtResultForm
                    name={hurtNames[hurtNames.none]}
                    priceForPack={-1}
                    princeForOne={-1}
                    productsInPack={-1}/>
            )
        } else {
            allResult.filter((item) => item.ean === ean).map((newItem) => {

                newItem.result.filter(i => i.Item.priceForOne !== -1).map((newItem) => {
                    newComponentHashTable.set(newItem.hurtName,
                        <HurtResultForm
                            name={hurtNames[newItem.hurtName]}
                            priceForPack={newItem.Item.priceForPack}
                            princeForOne={newItem.Item.priceForOne}
                            productsInPack={newItem.Item.productsInPack}/>
                    )
                })
            })
        }
        setProdName(name)
        setComponentHashTable(newComponentHashTable)
    }


    useEffect(() => {
        if (prodToSearch.length === 0) {
            return;
        }

        setIsLoadingProduct(true)
        try {
            getMultipleHurtResult(prodToSearch).then(data => {

                if (typeof (data) == "string") {
                    setErrorMessage(data)
                    setIsLoadingProduct(false)
                    return
                }

                const newOptItems: IItemInstance[] = []
                const newAllResult: IAllResult[] = []
                prodToSearch.map((item) => {
                    const ItemsMatchEan = data.get(item.Ean)
                    if (ItemsMatchEan) {
                        const newMin = ItemsMatchEan.filter((element) => {
                            return element.Item.priceForOne !== -1
                        })
                        if (!newMin || newMin.length === 0) {
                            return;
                        }

                        const xd = newMin.reduce((prev, current) => {
                            return prev.Item.priceForOne < current.Item.priceForOne ? prev : current
                        })
                        newOptItems.push({
                            name: item.Name,
                            ean: item.Ean,
                            item: xd.Item,
                            count: item.Amount,
                        })
                        newAllResult.push({
                            ean: item.Ean,
                            result: ItemsMatchEan
                        })
                    } else {
                        newOptItems.push({
                            name: item.Name,
                            ean: item.Ean,
                            item: {
                                name: item.Name,
                                hurtName: hurtNames.none,
                                priceForPack: -1,
                                priceForOne: -1,
                                productsInPack: -1,
                            },
                            count: item.Amount,
                        })
                    }
                })
                setOptItems(newOptItems)
                setAllResult(newAllResult)
                setIsLoadingProduct(false)
                changeResultComp(prodToSearch[0].Ean,prodToSearch[0].Name)
            })
        } catch (e: any) {
            setErrorMessage(e.message)
            setIsLoadingProduct(false)
        }
        // zapisanie ich w optItems
    }, [prodToSearch])

    useEffect(() => {
        if (agreement){

        }
    }, [agreement]);

    useEffect(() => {
        fetchWithAuth("/api/messages").then(response => {
            return response.json()
        }).then(data => {
            if (data.message == "") {
                return
            }
            setMessageFromBackend(data.message)
            setOpenSnackbar(true)
        })
    }, []) //pobieranie wiadomości


    {/*sx={{
                width: '100%',
                typography: 'body1',
                padding: "30px 10px",
                margin: "30px auto",
                borderRadius: "20px",
                backgroundColor: "#363636"
            }}}*/}

    return (
        <>
            <Box>
            <h1>Witaj {localStorage.getItem("companyName")}!</h1>
            <p></p>
            <Box sx={{display: "flex", justifyContent: "space-around"}}>
                <TextField sx={{width: "45%"}} autoComplete={"off"} id="filled" label="skanuj pojedynczo"
                           placeholder="kod Ean" value={Ean}
                           onChange={e => setEan(e.target.value)} onKeyDown={e => {
                    if (e.key === "Enter") {
                        setIsLoadingProduct(true)
                        try {
                            getHurtResult(Ean).then(data => {

                                if (typeof (data) === "string") {
                                    setProdName("brak Produktu")
                                    setErrorMessage(data)
                                    setIsLoadingProduct(false)
                                    return
                                }

                                const newMap = new Map<hurtNames, ReactNode>()
                                let i = 0
                                data.map((item) => {
                                    if (item.priceForOne !== -1) {
                                        setProdName(item.name)
                                        i += 1
                                        newMap.set(item.hurtName, (
                                            <HurtResultForm
                                                name={hurtNames[item.hurtName]}
                                                priceForPack={item.priceForPack}
                                                princeForOne={item.priceForOne}
                                                productsInPack={item.productsInPack}
                                            />
                                        ))
                                    }
                                })
                                if (i === 0) {
                                    setProdName("brak produktu")
                                    newMap.set(hurtNames.none, (
                                        <HurtResultForm
                                            name={hurtNames[hurtNames.none]}
                                            priceForPack={-1}
                                            princeForOne={-1}
                                            productsInPack={-1}
                                        />
                                    ))
                                } else {
                                    setComponentHashTable(newMap)
                                }

                                setIsLoadingProduct(false)
                            });
                        } catch (e: any) {
                            setErrorMessage(e.message)
                            setIsLoadingProduct(false)
                        }
                    }
                }}
                />

                <TextField sx={{width: "45%"}} disabled autoComplete={"off"} id="filled-disabled"
                           label="nazwa produktu" value={prodName}/>

            </Box>
            <p></p>
            <Box style={{display: "flex", alignItems: "flex-start",justifyContent: "space-around"}}>
                {!isLoadingProduct ? (
                    <div className={"hurtResults"}
                         style={{width: "45%", display: "grid", gap: "10px"}}>
                        {
                            Array.from(componentHashTable.values()).map((element) => {
                                return element
                            })

                        }
                    </div>
                ) : <Box sx={{display: 'flex', padding: "20px"}}>
                    <CircularProgress/>
                </Box>
                }
                {
                    prodToSearch.length === 0 || isLoadingProduct ?
                        <></>
                        :
                        <List component="nav"
                              sx={{width: "45%", overflow: "scroll", maxHeight: "600px", overflowX: "hidden"}}>
                            {prodToSearch.map((item,index ) => {
                                return (
                                    <ListItemButton
                                        selected={item.Ean === selectedEan}
                                        onClick={() => {
                                            changeResultComp(item.Ean, item.Name)
                                        }}>
                                        <ListItemAvatar>
                                            <Avatar>{index + 1}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={item.Name}/>
                                    </ListItemButton>
                                )
                            })}
                        </List>
                }


            </Box>
            <Button sx={{margin: "20px", padding: "5px"}}
                    variant="outlined" color="error" onClick={() => {
                setProdToSearch([])
            }}>Wyczyść Listę</Button>
            {optItems.length !== 0 ?
                <Button variant="contained" color="success" sx={{margin: "20px", padding: "5px"}} onClick={() => {
                    setOpen(true)
                }}>
                    dodaj produkty do koszyków w hurtowniach
                </Button> : <></>}
            {errorMessage !== "" ?
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {errorMessage}
                </Alert>
                : null}

            {fileName && <Box marginTop="1rem" width="100%">
                <Typography variant="h6" component="h2" gutterBottom>
                    {"przetwarzany plik := " + fileName}
                </Typography>
            </Box>}

            <InputComp setItem={prod => setProdToSearch(prod)} setName={name => setFileName(name)}/>



                <Dialog
                    open={open}
                    onClose={()=>{setOpen(false)}}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Use Google's location service?"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            czy wyrażasz zgodę na dodanie produktów do koszyka, spowoduje to usunięcie aktualnego koszyka
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={()=> {setOpen(false);setAgreement(false)}}
                        >nie zgadzam się</Button>
                        <Button onClick={()=>{setOpen(false); setAgreement(true)}} autoFocus>
                            Zgoda
                        </Button>
                    </DialogActions>
                </Dialog>



            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                open={openSnackbar}
                onClose={() => {
                    setOpenSnackbar(false)
                    setMessageFromBackend("")
                }}
                message={messageFromBackend}
            />
            </Box>
        </>
    )
}



