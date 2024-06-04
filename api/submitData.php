<?php
/**
 * 2007-2023 PrestaShop
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Academic Free License (AFL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/afl-3.0.php
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to http://www.prestashop.com for more information.
 *
 *  @author    PrestaShop SA <contact@prestashop.com>
 *  @copyright 2007-2023 PrestaShop SA
 *  @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
 *  International Registered Trademark & Property of PrestaShop SA
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
// $headers = array('Content-Type: application/json');
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
