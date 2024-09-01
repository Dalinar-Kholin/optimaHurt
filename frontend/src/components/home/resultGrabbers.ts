import {IHurtInfoForComp} from "./handleResult/handleResultInterfaces.ts";
import {handleResults} from "./handleResult/handleResults.ts";
import {hurtNames, IItemToSearch} from "../../interfaces.ts";
import fetchWithAuth from "../../typeScriptFunc/fetchWithAuth.ts";


export function getHurtResult(Ean: string): Promise<IHurtInfoForComp[] | string>  {
    const url = "/api/takePrice?" + new URLSearchParams({ean: Ean});


    let newData: IHurtInfoForComp[] = [];

    return fetchWithAuth(url, {
        credentials: "include",
        method: "GET",
    }).then(response => {
        if (!response.ok){
            throw response
        }

        return response.json();
    }).then(data => {

        if (data.error != undefined){
            return data.error
        }

        data.forEach((element: any) => {
            newData.push( handleResults({name: element.hurtName})(element.result));
        });


        return newData;
    }).catch(err => {
        if (err instanceof Response) {
            // Obsługa odpowiedzi z błędem
            return err.json().then(errorData => {
                return errorData.error
            }).catch(parseError => {
                return parseError
            });
        } else {
            // Inne typy błędów, np. brak połączenia z siecią
            return "błąd połączenia"
        }
    });
}

export interface IServerMultipleDataResult{
    Ean : string,
    Item : IHurtInfoForComp
    hurtName : hurtNames
}



export async function getMultipleHurtResult(Items: IItemToSearch[]):  Promise<Map<string, IServerMultipleDataResult[]> | string>{
    const map = new Map<string, IServerMultipleDataResult[]>();


    const data = await fetchWithAuth("/api/takePrices", {
        credentials: "include",
        method: "POST",
        body: JSON.stringify({Items: Items}),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => {
        if (!response.ok)
        return response.json();
    }).catch(err => {
        if (err instanceof Response) {
            // Obsługa odpowiedzi z błędem
            return err.json().then(errorData => {
                return errorData.error
            }).catch(parseError => {
                return parseError
            });
        } else {
            // Inne typy błędów, np. brak połączenia z siecią
            return "błąd połączenia"
        }
    });

    try {

        if (data.error!= undefined){
            return data.error
            //new Promise<string>(() => data.error)

        }

        data.map((i : any) => {
            i.Result.map((item : any) => {
                const itemArray = map.get(item.Ean);
                const newItem = {
                    Ean: item.Ean,
                    Item: handleResults({name: i.HurtName})(item.Item),
                    hurtName: i.HurtName
                };
                if (itemArray !== undefined) {
                    itemArray.push(newItem);
                } else {
                    map.set(item.Ean, [newItem]);
                }
            });
        });

        return map;
    } catch (err : any) {
        throw new Error(err.message);
    }
}
