import HackerrankTest from "../database/models/HackerrankTest";
import HackerrankTestRepository from "../repositories/HackerrankTestRepository";
import TestResultRepository from "../repositories/TestResultRepository";
import UserRepository from "../repositories/UserRepository";

type Config = {
    examExercise: {
        id: string,
        name: string,
        dueDate?: string
    }
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

    async checkExamExerciseState() {
        console.log('[ExamExerciseHandler] check exam exercise state');

        const users = await this.userRepository.getAll();
        console.log(users);

        const examExercise: HackerrankTest = await this.getExamExercise();
        console.log(examExercise);
        const testResults = await this.testResultRepository.getAllByTestId(examExercise.testId);
        console.log(JSON.stringify(testResults));

        // load config

        // run functions

        // update db
    }

    async getExamExercise(): Promise<HackerrankTest> {
        console.log('[ExamExerciseHandler] get hackerrank test');

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
