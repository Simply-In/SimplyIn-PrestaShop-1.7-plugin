<?php
/**
 * Copyright 2024-2027 Simply.IN Sp. z o.o.
 *
 * NOTICE OF LICENSE
 *
 * Licensed under the EUPL-1.2 or later.
 * You may not use this work except in compliance with the Licence.
 *
 * Copy of the Licence is available at:
 * https://joinup.ec.europa.eu/software/page/eupl
 * It is bundled with this package in the file LICENSE.txt
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the Licence is distributed on an as is basis,
 * without warranties or conditions of any kind, either express or implied.
 * Check the Licence for the specific language governing permissions
 * and limitations under the License.
 *
 * @author   Simply.IN Sp. z o.o.
 * @copyright 2024-2027 Simply.IN Sp. z o.o.
 * @license   https://joinup.ec.europa.eu/software/page/eupl
 */

require dirname(__FILE__) . '/../../../config/config.inc.php';
require dirname(__FILE__) . '/../../../init.php';

if (!defined('_PS_VERSION_')) {
    exit;
}

$data = json_decode(Tools::file_get_contents('php://input'), true);
$endpoint = $data['endpoint'];
$method = strtoupper($data['method']);
$body = $data['requestBody'];
$token = $data['token'];

$headersArray = getallheaders();
$origin = $headersArray['Origin'];

$apiKey = Configuration::get('SIMPLYIN_SECRET_KEY');

if (empty($apiKey)) {
    http_response_code(400);  // Bad Request
    echo 'Error: Simplyin API key is empty';

    return;
}

$body['apiKey'] = $apiKey;

$body['merchantApiKey'] = $apiKey;

if (!empty($token)) {
    // $url = 'https://prod.backend.simply.in/api/' . $endpoint . '?api_token=' . urlencode($token);
    $url = 'https://stage.backend.simplyin.app/api/' . $endpoint . '?api_token=' . urlencode($token);
} else {
    $url = 'https://stage.backend.simplyin.app/api/' . $endpoint;
}
// $headers = ['Content-Type: application/json'];
$headers = ['Content-Type: application/json', 'Origin: ' . $origin];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);

switch ($method) {
    case 'GET':
        curl_setopt($ch, CURLOPT_HTTPGET, 1);
        break;
    case 'POST':
        curl_setopt($ch, CURLOPT_POST, 1);
        break;
    case 'PATCH':
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
        break;
    default:
        break;
}

curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);

curl_close($ch);

echo $response;
