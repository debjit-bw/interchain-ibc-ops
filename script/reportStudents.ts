#!/usr/bin/env npx ts-node

import getStdin from "../src/stdIn"
import { StudentInfo } from "../src/studentGenerator"

// Example
// ./script/reportStudents.ts < ./samples/student-info.json
async function runAll() {
    const infos: StudentInfo[] = JSON.parse(await getStdin())
    infos.forEach((info: StudentInfo) =>
        console.log(
            `${info.studentId.uuid},${info.studentId.email},${info.homeDenom},${info.addressRecipient},${info.received}`,
        ),
    )
}

runAll()
