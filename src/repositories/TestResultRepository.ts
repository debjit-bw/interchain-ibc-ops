import { Knex } from "knex";
import db from "../database";
import TestResult from "../database/models/TestResult";

export default class TestResultRepository {
    testResults: () => Knex.QueryBuilder<TestResult>;

    constructor() {
        this.testResults = () => db('test_results');
    }

    getAll(): Promise<TestResult[]> {
        console.log('[TestResultRepository] get all users');
        return this.testResults();
    }

    getById(id: number): Promise<TestResult> {
        console.log('[TestResultRepository] get test result by id ' + id);
        return this.testResults()
            .where('test_result_id', id)
            .first()
            .then(data => new TestResult(data.test_result_id, data.user_id, data.test_id, data.test_result, data.date));;
    }

    getAllByTestId(id: number): Promise<TestResult[]> {
        console.log('[TestResultRepository] get all test results with test id ' + id);
        return this.testResults()
            .where('test_id', id)
            .then(data => data.map(item => new TestResult(item.test_result_id, item.user_id, item.test_id, item.test_result, item.date)));
    }
}
