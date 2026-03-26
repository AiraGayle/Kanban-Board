/**
 * Kanban Board — API Test Suite
 * ==============================
 * A self-contained test runner using only Node.js built-ins (node:http, node:https).
 * No extra dependencies required — just Node 18+.
 *
 * Usage:
 *   node api-tests.js
 *   node api-tests.js http://localhost:3000          # custom base URL
 *
 * What it tests:
 *   POST /auth/register   — success, duplicate email, missing fields, short password, bad email format
 *   POST /auth/login      — success, wrong password, unknown email, missing fields
 *   GET  /tasks           — success, no token, invalid token
 *   POST /tasks           — create, update, soft-delete, missing id, missing title, stale timestamp
 *   GET  /health          — basic health check
 */

'use strict';

const http  = require('node:http');
const https = require('node:https');
const { randomUUID } = require('node:crypto');

// ─── Config ──────────────────────────────────────────────────────────────────
const BASE_URL   = process.argv[2] || 'http://localhost:3000';
const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASS  = 'testpassword123';

// ─── Minimal HTTP client ─────────────────────────────────────────────────────
function request(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url    = new URL(path, BASE_URL);
        const lib    = url.protocol === 'https:' ? https : http;
        const data   = body ? JSON.stringify(body) : null;

        const opts = {
            hostname: url.hostname,
            port:     url.port || (url.protocol === 'https:' ? 443 : 80),
            path:     url.pathname + url.search,
            method,
            headers: {
                'Content-Type':  'application/json',
                'Content-Length': data ? Buffer.byteLength(data) : 0,
                ...headers,
            },
        };

        const req = lib.request(opts, res => {
            let raw = '';
            res.on('data', chunk => raw += chunk);
            res.on('end', () => {
                let json;
                try { json = JSON.parse(raw); } catch { json = { _raw: raw }; }
                resolve({ status: res.statusCode, body: json });
            });
        });

        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

// ─── Assertion helpers ────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures = [];

function assert(name, condition, detail = '') {
    if (condition) {
        console.log(`  ✅  ${name}`);
        passed++;
    } else {
        console.log(`  ❌  ${name}${detail ? `  →  ${detail}` : ''}`);
        failed++;
        failures.push(`${name}${detail ? `: ${detail}` : ''}`);
    }
}

function suite(title) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`  ${title}`);
    console.log('─'.repeat(60));
}

// ─── Test state ───────────────────────────────────────────────────────────────
let authToken = '';
let taskId    = '';

// ─── Tests ────────────────────────────────────────────────────────────────────

async function testHealth() {
    suite('GET /health');
    const { status, body } = await request('GET', '/health');
    assert('Status 200',  status === 200, `got ${status}`);
    assert('status: ok',  body.status === 'ok', `got ${JSON.stringify(body)}`);
}

async function testRegisterSuccess() {
    suite('POST /auth/register — success');
    const { status, body } = await request('POST', '/auth/register', {
        email:    TEST_EMAIL,
        password: TEST_PASS,
    });
    assert('Status 201',               status === 201,               `got ${status}`);
    assert('Has user object',          typeof body.user === 'object');
    assert('Has token string',         typeof body.token === 'string' && body.token.length > 10);
    assert('user.email matches',       body.user?.email === TEST_EMAIL);
    assert('Password not exposed',     !('password' in (body.user ?? {})) && !('password_hash' in (body.user ?? {})));

    if (body.token) authToken = body.token;
}

async function testRegisterDuplicate() {
    suite('POST /auth/register — duplicate email');
    const { status, body } = await request('POST', '/auth/register', {
        email:    TEST_EMAIL,
        password: TEST_PASS,
    });
    assert('Status 400',            status === 400, `got ${status}`);
    assert('Correct error message', body.error === 'Email already in use', `got "${body.error}"`);
}

async function testRegisterMissingPassword() {
    suite('POST /auth/register — missing password');
    const { status, body } = await request('POST', '/auth/register', {
        email: `missing_pass_${Date.now()}@example.com`,
    });
    assert('Status 400',   status === 400, `got ${status}`);
    assert('Has error',    typeof body.error === 'string');
}

async function testRegisterShortPassword() {
    suite('POST /auth/register — password too short');
    const { status, body } = await request('POST', '/auth/register', {
        email:    `short_${Date.now()}@example.com`,
        password: 'abc',
    });
    assert('Status 400',            status === 400, `got ${status}`);
    assert('Correct error message', body.error === 'Password must be at least 8 characters', `got "${body.error}"`);
}

async function testRegisterBadEmail() {
    suite('POST /auth/register — invalid email format');
    const { status, body } = await request('POST', '/auth/register', {
        email:    'not-an-email',
        password: 'validpassword',
    });
    assert('Status 400',            status === 400, `got ${status}`);
    assert('Correct error message', body.error === 'Invalid email format', `got "${body.error}"`);
}

async function testLoginSuccess() {
    suite('POST /auth/login — success');
    const { status, body } = await request('POST', '/auth/login', {
        email:    TEST_EMAIL,
        password: TEST_PASS,
    });
    assert('Status 200',       status === 200, `got ${status}`);
    assert('Has user object',  typeof body.user === 'object');
    assert('Has token string', typeof body.token === 'string' && body.token.length > 10);

    if (body.token) authToken = body.token; // refresh token
}

async function testLoginWrongPassword() {
    suite('POST /auth/login — wrong password');
    const { status, body } = await request('POST', '/auth/login', {
        email:    TEST_EMAIL,
        password: 'wrongpassword',
    });
    assert('Status 400',            status === 400, `got ${status}`);
    assert('Correct error message', body.error === 'Invalid email or password', `got "${body.error}"`);
}

async function testLoginUnknownEmail() {
    suite('POST /auth/login — unknown email');
    const { status, body } = await request('POST', '/auth/login', {
        email:    'nobody_at_all@example.com',
        password: TEST_PASS,
    });
    assert('Status 400',            status === 400, `got ${status}`);
    assert('Correct error message', body.error === 'Invalid email or password', `got "${body.error}"`);
}

async function testLoginMissingFields() {
    suite('POST /auth/login — missing fields');
    const { status, body } = await request('POST', '/auth/login', {});
    assert('Status 400', status === 400, `got ${status}`);
    assert('Has error',  typeof body.error === 'string');
}

async function testGetTasksSuccess() {
    suite('GET /tasks — success');
    const { status, body } = await request('GET', '/tasks', null, {
        Authorization: `Bearer ${authToken}`,
    });
    assert('Status 200',         status === 200, `got ${status}`);
    assert('Has tasks array',    Array.isArray(body.tasks));
    assert('No deleted tasks',   (body.tasks ?? []).every(t => t.deleted === false));
}

async function testGetTasksNoToken() {
    suite('GET /tasks — no Authorization header');
    const { status } = await request('GET', '/tasks');
    assert('Status 401', status === 401, `got ${status}`);
}

async function testGetTasksInvalidToken() {
    suite('GET /tasks — invalid token');
    const { status } = await request('GET', '/tasks', null, {
        Authorization: 'Bearer this.is.not.a.valid.jwt',
    });
    assert('Status 401', status === 401, `got ${status}`);
}

async function testCreateTask() {
    suite('POST /tasks — create task');
    taskId = randomUUID();
    const { status, body } = await request('POST', '/tasks', {
        id:          taskId,
        title:       'API test task',
        note:        'Created by api-tests.js',
        column_name: 'to-do',
        priority:    'Low',
        task_order:  0,
        deleted:     false,
        updated_at:  new Date().toISOString(),
    }, {
        Authorization: `Bearer ${authToken}`,
    });
    assert('Status 200',             status === 200, `got ${status}`);
    assert('Has task object',        typeof body.task === 'object' && body.task !== null);
    assert('task.id matches',        body.task?.id === taskId, `got ${body.task?.id}`);
    assert('task.deleted is false',  body.task?.deleted === false);
    assert('task.title correct',     body.task?.title === 'API test task');
    assert('task.column_name set',   body.task?.column_name === 'to-do');
}

async function testUpdateTask() {
    suite('POST /tasks — update (move to doing)');
    const { status, body } = await request('POST', '/tasks', {
        id:          taskId,
        title:       'Updated title',
        note:        'Moved to doing',
        column_name: 'doing',
        priority:    'High',
        task_order:  0,
        deleted:     false,
        updated_at:  new Date().toISOString(),
    }, {
        Authorization: `Bearer ${authToken}`,
    });
    assert('Status 200',               status === 200, `got ${status}`);
    assert('column_name is doing',     body.task?.column_name === 'doing', `got ${body.task?.column_name}`);
    assert('title updated',            body.task?.title === 'Updated title');
    assert('priority updated',         body.task?.priority === 'High');
}

async function testSoftDeleteTask() {
    suite('POST /tasks — soft-delete');
    const { status, body } = await request('POST', '/tasks', {
        id:          taskId,
        title:       'Updated title',
        note:        '',
        column_name: 'doing',
        priority:    'High',
        task_order:  0,
        deleted:     true,
        updated_at:  new Date().toISOString(),
    }, {
        Authorization: `Bearer ${authToken}`,
    });
    assert('Status 200',           status === 200, `got ${status}`);
    assert('task.deleted is true', body.task?.deleted === true, `got ${body.task?.deleted}`);
    assert('task.id still exists', body.task?.id === taskId);
}

async function testDeletedTaskExcludedFromGet() {
    suite('GET /tasks — deleted task not returned');
    const { status, body } = await request('GET', '/tasks', null, {
        Authorization: `Bearer ${authToken}`,
    });
    const found = (body.tasks ?? []).find(t => t.id === taskId);
    assert('Status 200',                       status === 200, `got ${status}`);
    assert('Soft-deleted task not in results', found === undefined, `found task with id ${taskId}`);
}

async function testCreateTaskMissingId() {
    suite('POST /tasks — missing id (expect 400)');
    const { status, body } = await request('POST', '/tasks', {
        title:       'No ID',
        column_name: 'to-do',
        priority:    'Low',
        task_order:  0,
        deleted:     false,
    }, {
        Authorization: `Bearer ${authToken}`,
    });
    assert('Status 400',            status === 400, `got ${status}`);
    assert('Correct error message', body.error === 'Task id is required', `got "${body.error}"`);
}

async function testCreateTaskMissingTitle() {
    suite('POST /tasks — missing title (expect 400)');
    const { status, body } = await request('POST', '/tasks', {
        id:          randomUUID(),
        column_name: 'to-do',
        priority:    'Low',
        task_order:  0,
        deleted:     false,
    }, {
        Authorization: `Bearer ${authToken}`,
    });
    assert('Status 400',            status === 400, `got ${status}`);
    assert('Correct error message', body.error === 'Task title is required', `got "${body.error}"`);
}

async function testConflictResolution() {
    suite('POST /tasks — conflict resolution (stale update rejected)');

    const id  = randomUUID();
    const now = new Date().toISOString();

    // Create a fresh task with current timestamp
    await request('POST', '/tasks', {
        id, title: 'Conflict base', column_name: 'to-do',
        priority: 'Low', task_order: 0, deleted: false, updated_at: now,
    }, { Authorization: `Bearer ${authToken}` });

    // Send an update with a very old timestamp — server should keep its version
    const staleDate = '2020-01-01T00:00:00.000Z';
    const { status, body } = await request('POST', '/tasks', {
        id, title: 'Stale title', column_name: 'done',
        priority: 'High', task_order: 0, deleted: false, updated_at: staleDate,
    }, { Authorization: `Bearer ${authToken}` });

    assert('Status 200',                    status === 200, `got ${status}`);
    assert('Task returned',                 body.task !== null && body.task !== undefined);
    assert('Server version title kept',     body.task?.title === 'Conflict base', `got "${body.task?.title}"`);
    assert('Server version column kept',    body.task?.column_name === 'to-do', `got "${body.task?.column_name}"`);
}

async function testUnknownRoute() {
    suite('GET /unknown — 404 fallback');
    const { status, body } = await request('GET', '/no-such-route');
    assert('Status 404',   status === 404, `got ${status}`);
    assert('Has error',    typeof body.error === 'string');
}

// ─── Runner ───────────────────────────────────────────────────────────────────
async function run() {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  Kanban Board API Tests`);
    console.log(`  Base URL: ${BASE_URL}`);
    console.log(`  Test account: ${TEST_EMAIL}`);
    console.log('═'.repeat(60));

    const tests = [
        testHealth,
        testRegisterSuccess,
        testRegisterDuplicate,
        testRegisterMissingPassword,
        testRegisterShortPassword,
        testRegisterBadEmail,
        testLoginSuccess,
        testLoginWrongPassword,
        testLoginUnknownEmail,
        testLoginMissingFields,
        testGetTasksSuccess,
        testGetTasksNoToken,
        testGetTasksInvalidToken,
        testCreateTask,
        testUpdateTask,
        testSoftDeleteTask,
        testDeletedTaskExcludedFromGet,
        testCreateTaskMissingId,
        testCreateTaskMissingTitle,
        testConflictResolution,
        testUnknownRoute,
    ];

    for (const test of tests) {
        try {
            await test();
        } catch (err) {
            const name = test.name;
            console.log(`  💥  ${name} threw: ${err.message}`);
            failed++;
            failures.push(`${name}: threw ${err.message}`);
        }
    }

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  Results: ${passed} passed, ${failed} failed`);
    if (failures.length > 0) {
        console.log('\n  Failed tests:');
        failures.forEach(f => console.log(`    • ${f}`));
    }
    console.log('═'.repeat(60));

    process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});