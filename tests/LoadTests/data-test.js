import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

const users = new SharedArray('login users', function () {
    return JSON.parse(open('./users.json'));
});

export const options = {
    vus: 10,
    iterations: 30,

    thresholds: {
        http_req_duration: ['p(95)<800'],
    },
};

export default function () {

    const url = 'http://localhost:5011/api/auth/login';


    const user = users[__ITER % users.length];

    const payload = JSON.stringify({
        username: user.username,
        password: user.password
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const res = http.post(url, payload, params);

  
    const isValidResponse =
        res.status === user.expectedStatus;

  
    check(res, {
        'status matches expected': () => isValidResponse,

        'valid users return token': (r) =>
            user.expectedStatus === 200
                ? r.body.includes('token')
                : true,

        'invalid users rejected properly': (r) =>
            user.expectedStatus === 401
                ? r.status === 401
                : true,

        'response is not empty': (r) =>
            r.body && r.body.length > 0,
    });

    sleep(1);
}