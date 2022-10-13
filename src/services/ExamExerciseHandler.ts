import HackerrankTest from "../database/models/HackerrankTest";
import HackerrankTestRepository from "../repositories/HackerrankTestRepository";
import TestResultRepository from "../repositories/TestResultRepository";
import UserRepository from "../repositories/UserRepository";
import studentInfos from "../../samples/student-infos.json";
import { StudentInfo } from "../studentGenerator";
import { checkOnStudentsInParallel, NodeConfig } from "../studentChecker";

type Config = {
    examExercise: {
        id: string,
        name: string,
        dueDate?: string
    },
    nodeConfig: NodeConfig
}

export default class ExamExerciseHandler {
    config: Config
    userRepository: UserRepository;
    hackerrankTestRepository: HackerrankTestRepository;
    testResultRepository: TestResultRepository;

    constructor(
        config: Config,
        userRepository: UserRepository,
        hackerrankTestRepository: HackerrankTestRepository,
        testResultRepository: TestResultRepository
    ) {
        this.config = config;
        this.userRepository = userRepository;
        this.hackerrankTestRepository = hackerrankTestRepository;
        this.testResultRepository = testResultRepository;
    }

    async updateExamExerciseState() {
        console.log('[ExamExerciseHandler] update exam exercise state');

        const students = await checkOnStudentsInParallel([this.config.nodeConfig], studentInfos);

        return await this.compareAndUpdateResults(students);
    }

    async compareAndUpdateResults(students: StudentInfo[]) {
        console.log('[ExamExerciseHandler] compare and update students results');

        const users = await this.userRepository.getAll();
        const examExercise: HackerrankTest = await this.getExamExercise();
        const testResults = await this.testResultRepository.getAllByTestId(examExercise.testId);

        for (let student of students) {
            if (!student.received) continue;

            console.log(`[ExamExerciseHandler] exam exercise result received for user ${student.studentId.uuid}`);

            const user = users.find(user => user.token === student.studentId.uuid);
            const examExerciseResult = testResults.find(result => result.userId === user.id);

            if (!examExerciseResult || examExerciseResult.testResult != 1) {
                this.testResultRepository.create(user.id, examExercise.testId, 1, new Date());
            }
        }
    }

    async getExamExercise(): Promise<HackerrankTest> {
        console.log('[ExamExerciseHandler] get exam exercise test');

        let hackerrankTest = await this.hackerrankTestRepository.getByHackerrankId(this.config.examExercise.id);

        if (!hackerrankTest) {
            await this.hackerrankTestRepository.create(
                this.config.examExercise.name,
                this.config.examExercise.id,
                this.config.examExercise.dueDate
            );
            hackerrankTest = await this.hackerrankTestRepository.getByHackerrankId(this.config.examExercise.id);
        }

        return hackerrankTest;
    }
}
