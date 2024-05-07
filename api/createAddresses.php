<?php
require(dirname(__FILE__) . '/../../../config/config.inc.php');
require(dirname(__FILE__) . '/../../../init.php');

define("_DB_PREFIX_", "ps_");
$context = Context::getContext();
$data = json_decode(file_get_contents("php://input"), true);

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

$data = array(
	'newAddressId' => $newAddressId
);

$json_data = json_encode($data);


echo $json_data;


