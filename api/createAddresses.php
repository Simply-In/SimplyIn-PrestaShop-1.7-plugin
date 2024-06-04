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
