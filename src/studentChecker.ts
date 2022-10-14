import { toAscii, toHex } from "@cosmjs/encoding"
import { Coin, StargateClient } from "@cosmjs/stargate"
import { assert } from "console"
import { Hash } from "fast-sha256"
import { StudentInfo } from "./studentGenerator"

export type NodeConfig = {
    rpc: string
    channelRange: {
        min: number
        max: number
    }
}

export type StudentChecker = (info: StudentInfo) => Promise<boolean>
export type StudentsChecker = (config: NodeConfig, infos: StudentInfo[]) => Promise<StudentInfo[]>

export const checkOnStudent = async (config: NodeConfig): Promise<StudentChecker> => {
    const client: StargateClient = await StargateClient.connect(config.rpc)
    return async (info: StudentInfo): Promise<boolean> => {
        if (info.received) return true
        const coins: readonly Coin[] = await client.getAllBalances(info.addressRecipient)
        const ibcDenoms: string[] = coins
            .filter((coin: Coin) => 0 < parseInt(coin.amount, 10))
            .map((coin: Coin) => coin.denom.toLowerCase())
            .filter((denom: string) => denom.startsWith("ibc/"))
        const result = ibcDenoms.some((denom: string) => {
            const hasher: Hash = new Hash()
            let channelId: number = config.channelRange.min
            do {
                hasher.reset()
                hasher.update(toAscii(`transfer/channel-${channelId}/${info.homeDenom}`))
                if (denom == `ibc/${toHex(hasher.digest())}`) return true
            } while (++channelId <= config.channelRange.max)
            return false
        })
        return result
    }
}

export const checkOnStudents = async (config: NodeConfig, infos: StudentInfo[]): Promise<StudentInfo[]> => {
    const checker: StudentChecker = await checkOnStudent(config)
    const result: StudentInfo[] = []
    let index = 0
    while (index < infos.length) {
        const received = await checker(infos[index]);
        result.push(
            Object.assign<StudentInfo, StudentInfo, Partial<StudentInfo>>({} as StudentInfo, infos[index], {
                received
            }),
        )
        index++
    }
    return result
}

export const checkOnStudentsInParallel = async (
    configs: NodeConfig[],
    infos: StudentInfo[],
): Promise<StudentInfo[]> => {
    const chunkSize = Math.ceil(infos.length / configs.length)
    const filedInfos: StudentInfo[][] = []
    for (let index = 0; index < infos.length; index += chunkSize) {
        filedInfos.push(infos.slice(index, index + chunkSize))
    }
    assert(filedInfos.length == configs.length)

    const checkers: Promise<StudentInfo[]>[] = configs.map((config: NodeConfig, index: number) =>
        checkOnStudents(config, filedInfos[index]),
    )
    const results: StudentInfo[][] = await Promise.all(checkers)
    return results.flat()
}
