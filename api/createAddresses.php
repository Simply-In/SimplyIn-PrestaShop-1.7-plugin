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

define('_DB_PREFIX_', 'ps_');
$context = Context::getContext();
$data = json_decode(Tools::file_get_contents('php://input'), true);

$dataToSend = $data['dataToSend'];
$email = $dataToSend['email'];
$addressData = $dataToSend['addressData'];

$useSameAddress = $dataToSend['use_same_address'];

if ($dataToSend['use_same_address'] === 0) {
    $useSameAddress = false;
} else {
    $useSameAddress = true;
}

$id = (int) $context->cookie->id_customer;

function addNewAddress($customerId, $addressData)
{
    // Create a new Address object
    $address = new Address();
    $address->id_customer = $customerId;
    $address->alias = $addressData['addressName'];
    $address->firstname = $addressData['name'];
    $address->lastname = $addressData['surname'];
    $address->address1 = $addressData['street'];
    $address->address2 = $addressData['appartmentNumber'];
    $address->postcode = $addressData['postalCode'];
    $address->city = $addressData['city'];
    // $address->id_country = $addressData['id_country']; // Set the country ID
    $address->id_country = $addressData['country'];

    $address->vat_number = $addressData['taxId'];
    $address->company = $addressData['companyName'];
    $address->phone = $addressData['phoneNumber'];

    // Save the address
    if ($address->save()) {
        return $address->id; // Address added successfully
    } else {
        return false; // Address couldn't be added
    }
}

$customer = new Customer($id);
$customer->use_same_address = $useSameAddress;
$customer->update();

$newAddressId = addNewAddress($id, $addressData);

$data = [
    'newAddressId' => $newAddressId,
];

$json_data = json_encode($data);

echo $json_data;
