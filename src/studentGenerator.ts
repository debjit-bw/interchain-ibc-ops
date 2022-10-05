import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing"

export type StudentId = {
    email: string
    uuid: string
}
export type StudentInfo = {
    studentId: StudentId
    mnemonic: string
    addressRecipient: string
    homeDenom: string
    received: boolean
}

export async function studentGenerator(studentIds: StudentId[]): Promise<StudentInfo[]> {
    let index = 0
    const result: StudentInfo[] = []
    while (index < studentIds.length) {
        const wallet: DirectSecp256k1HdWallet = await DirectSecp256k1HdWallet.generate(24)
        const accounts = await wallet.getAccounts()
        result.push({
            studentId: studentIds[index],
            mnemonic: wallet.mnemonic,
            addressRecipient: accounts[0].address,
            homeDenom: `stake${accounts[0].address.replace("cosmos", "")}`,
            received: false,
        })
        index++
    }
    return result
}
