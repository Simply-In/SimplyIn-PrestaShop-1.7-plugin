<!-- <?php
class DeliveryAddressesController extends ModuleFrontController
{
	public function addField()
	{
		$context = Context::getContext();
		$addressesForm = $context->getAddressesForm();

		$addressesForm->addField('custom_field', 'text', [
			'label' => 'Custom field',
			'required' => false,
		]);

		$addressesForm->save();
	}
}
// -->



$form = new Form();
$form->add('new_field', 'text', array(
	'label' => 'New field',
)
);

$response = $form->handleRequest();

if ($response->isSubmitted() && $response->isValid()) {
	// Save the new field
}