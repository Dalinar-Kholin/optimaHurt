import {IHurtInfoForComp} from "./components/home/handleResult/handleResultInterfaces.ts";
import {IServerMultipleDataResult} from "./components/home/resultGrabbers.ts";

export type PATH= "main" | "cennik" | "ustawienia" | "login" | "płatności"

export const freeBarAndCookiePath = ["/login" , "/signIn", "/forgotPassword", "/resetPassword"]

export enum hurtNames{
    "none" = 0,
    "eurocash"= 1,
    "special"= 2,
    "sot"= 4,
    "tedi"= 8,
}


export enum AccountStatus{
    "Inactive" =0,
    "New"=1,
    "Active"=2,
}


export const hurtNamesIterable: hurtNames[] = [hurtNames.none, hurtNames.eurocash, hurtNames.special, hurtNames.sot, hurtNames.tedi]

export interface IAllResult {
    ean: string,
    result: IServerMultipleDataResult[]
}

export interface IItemToSearch {
    Name : string,
    Ean : string,
    Amount: number
}

export interface IItemInstance {
    item : IHurtInfoForComp
    name : string // brane z pliku tekstowego
    ean: string,
    count: number,
}
