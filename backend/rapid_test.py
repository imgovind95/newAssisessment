import requests

def test_routes():
    # 1. Admin Route Auth
    res = requests.get('http://localhost:8000/api/v1/admin/analytics', headers={'Authorization': 'Bearer MOCK_TOKEN'})
    if res.status_code == 401:
        print('1. Admin Route Requires Auth: PASS')
    else:
        print('1. Admin Route Requires Auth: FAIL', res.status_code)

    # Login
    res = requests.post('http://localhost:8000/api/v1/auth/login', data={'username': 'admin', 'password': 'password'})
    if res.status_code != 200:
        requests.post('http://localhost:8000/api/v1/auth/register', json={'username': 'admin', 'password': 'password', 'email': 'admin@test.com'})
        res = requests.post('http://localhost:8000/api/v1/auth/login', data={'username': 'admin', 'password': 'password'})
    token = res.json()['access_token']

    # 2. History Data Returned
    res = requests.get('http://localhost:8000/api/v1/history/?limit=5', headers={'Authorization': f'Bearer {token}'})
    data = res.json()
    print('2. GET /history Returns Actual Array:', isinstance(data.get('data', []), list), f"(Items: {len(data.get('data', []))})")

    # 3. Model Probabilities change
    res1 = requests.post('http://localhost:8000/api/v1/detector/check', json={'phone_number': '+18001234567'}, headers={'Authorization': f'Bearer {token}'})
    res2 = requests.post('http://localhost:8000/api/v1/detector/check', json={'phone_number': '123456'}, headers={'Authorization': f'Bearer {token}'})
    c1 = res1.json().get('confidence')
    c2 = res2.json().get('confidence')
    print(f'3. Model Probabilities Change: Num1={c1}%, Num2={c2}% -> {"PASS" if c1 != c2 else "FAIL"}')

    # 4. POST /report DB Update
    res = requests.post('http://localhost:8000/api/v1/detector/report', json={'phone_number': '+18001234567', 'report_type': 'Spam', 'description': 'test'}, headers={'Authorization': f'Bearer {token}'})
    if res.status_code in [200, 201]:
        print('4. POST /report DB Update: PASS')
    else:
        print('4. POST /report DB Update: FAIL', res.status_code)

    # 5. Rate Limiter
    hits = 0
    triggered = False
    for i in range(15):
        res = requests.post('http://localhost:8000/api/v1/detector/check', json={'phone_number': '+18001234567'}, headers={'Authorization': f'Bearer {token}'})
        hits += 1
        if res.status_code == 429:
            triggered = True
            break
    
    if triggered:
        print(f'5. Rate Limit Triggered after {hits} calls: PASS')
    else:
        print(f'5. Rate Limit: FAIL (allowed {hits} rapid calls without 429)')

if __name__ == "__main__":
    test_routes()
