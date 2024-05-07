class YourPaymentModulePaymentModuleFrontController extends ModuleFrontController
{
    public function postProcess()
    {
        if (Tools::isSubmit('custom_field')) {
            $customFieldData = Tools::getValue('custom_field');
            // Perform validation and save data as needed
        }
    }
}