#!/usr/bin/env npx ts-node

import { toAscii, toHex } from "@cosmjs/encoding"
import { Hash } from "fast-sha256"

const hasher = new Hash()
let runCount = 10_000

const beforeMilliSec = new Date().getTime()

do {
    hasher.reset()
    hasher.update(toAscii(`transfer/channel-${runCount}/token`))
    const hash = toHex(hasher.digest())
    // console.log(hash)
} while (0 < --runCount)

const afterMilliSec = new Date().getTime()
const durationMilliSec = afterMilliSec - beforeMilliSec

console.log("Took", durationMilliSec / 1000, "seconds")
