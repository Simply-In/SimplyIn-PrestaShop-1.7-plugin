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

use Order;

class Simplyin extends Module
{



	protected $config_form = false;


	public function __construct()
	{

		$this->name = 'simplyin';
		$this->tab = 'shipping_logistics';
		$this->version = '1.0.0';
		$this->author = 'SimplyIn';
		$this->need_instance = 1;
		/**
		 * Set $this->bootstrap to true if your module is compliant with bootstrap (PrestaShop 1.6)
		 */
		$this->bootstrap = true;
		parent::__construct();

		$this->displayName = $this->l('SimplyIn');
		$this->description = $this->l('06.05.2024');

		$this->confirmUninstall = $this->l('');

		$this->ps_versions_compliancy = array('min' => '1.6', 'max' => _PS_VERSION_);

	}

	/**
	 * Don't forget to create update methods if needed:
	 * http://doc.prestashop.com/display/PS16/Enabling+the+Auto-Update
	 */
	public function install()
	{
		Configuration::updateValue('SIMPLYIN_LIVE_MODE', false);

		include(dirname(__FILE__) . '/sql/install.php');

		return parent::install() &&
			$this->registerHook('header') &&
			$this->registerHook('actionOrderStatusPostUpdate') &&
			$this->registerHook('displayBackOfficeHeader') &&
			$this->registerHook('displayOrderConfirmation') &&
			$this->registerHook('displayBeforeCarrier') &&
			$this->registerHook('actionCarrierProcess') &&
			$this->registerHook('updateOrderStatus') &&
			$this->registerHook('actionValidateOrder');

	}


	public function hookActionOrderStatusPostUpdate($params)
	{

		return;
		$newOrderStatus = $params['newOrderStatus']->template;
		$newOrderStatusID = $params['newOrderStatus']->id;
		$oldOrderStatus = $params['oldOrderStatus']->template;
		$oldOrderStatusID = $params['oldOrderStatus']->id;
		$id_order = $params['id_order'];
		$order = new Order($id_order);



		//statusy zamówień

		// $orderStatuses = OrderState::getOrderStates(Context::getContext()->language->id);
		// echo "[";
		// foreach ($orderStatuses as $status) {
		// 	echo " { \"template\":" . json_encode($status["template"]) . ", \"name\": " . json_encode($status["name"]) . ", \"id\":" . json_encode($status["id_order_state"]) . "},";
		// }
		// echo "]";




		//tracking 

		$shipping_data = $order->getShipping();

		foreach ($shipping_data as $carrier) {
			// Access the data for each carrier
			$trackingNumber = $carrier['tracking_number'];
			$carrier_name = $carrier['carrier_name'];
			$url = $carrier['url'];
			$date_add = $carrier['date_add'];

			// Render the data
			echo json_encode($carrier);
			echo "Tracking Number: " . $trackingNumber . "<br>";
			echo "Carrier name: " . $carrier_name . "<br>";
			echo "shipping link: " . $url . "<br><br>";
			echo "date_add: " . $date_add . "<br><br>";
		}
		echo json_encode($shipping_data);
		echo json_encode($order);


		// foreach ($orderStatuses as $status) {
		// echo $status['name'] . "\n";
		// }



		//DEBUGGER
		error_log($params);

		PrestaShopLogger::addLog("Order ipdated", 1, null, 'Order', 10, true);


		PrestaShopLogger::addLog("order id $id_order; old status: --- $oldOrderStatus $oldOrderStatusID-----; order new status: ----- $newOrderStatus $newOrderStatusID------;", 1, null, 'Order', $id_order, true);

	}





	public function hookDisplayOrderConfirmation($params)
	{
		$orderId = $params['order']->id;
		$customerId = $params['customer']->id;
		PrestaShopLogger::addLog("Order $orderId created for customer $customerId", 1, null, 'Order', $orderId, true);

		$context = Context::getContext();
		$shopName = Configuration::get('PS_SHOP_NAME');
		// Get the order object from the params
		$order = $params['order'];
		// $currency = $order->getCurrency();
		// Get the customer's delivery and billing address id from the order
		$deliveryAddressId = $order->id_address_delivery;
		$billingAddressId = $order->id_address_invoice;


		// Create an Address object from the address id
		$deliveryAddress = new Address($deliveryAddressId);
		$billingAddress = new Address($billingAddressId);

		// Fetch details of delivery and billing address
		$deliveryCountry = new Country($deliveryAddress->id_country);
		$deliveryState = new State($deliveryAddress->id_state);

		$billingCountry = new Country($billingAddress->id_country);
		$billingState = new State($billingAddress->id_state);

		$customer = new Customer($order->id_customer);
		$currencyId = $order->id_currency;
		$currency = Currency::getCurrencyInstance((int) ($currencyId));
		$currencyISO = $currency->iso_code;

		$customer_info = array(
			'id_order' => (int) $order->id,
			'reference' => $order->reference,
			'total_paid' => $order->total_paid,
			'quantity' => intval($order->quantity),
			'id_customer' => $this->context->customer->id,
			'data-order' => $params->order,
		);

		$customer_info['products'] = array();

		$orderProducts = $order->getProducts();
		foreach ($orderProducts as $product) {
			$productId = $product['product_id'];

			$productName = $product['product_name'];

			$productImage = Image::getCover($productId);
			if ($productImage) {
				$productImageUrl = _PS_BASE_URL_ . _THEME_PROD_DIR_ . $productImage['id_image'] . '-large_default/' . $productName . '.jpg';
			} else {
				// If no image is available, you can use a default image or handle it as needed
				$productImageUrl = _PS_IMG_ . 'p/' . (int) $productId . '-' . (int) $product['id_image'] . '.jpg';
			}

			$productThumbnailId = Product::getCover($productId)['id_image'];

			$productObj = new Product($productId, false, $context->language->id);

			$productDescription = strip_tags($productObj->description);

			$productLink = $context->link->getProductLink($product);
			$thumbnailUrl = $context->link->getImageLink($productName, $productThumbnailId, 'small_default');


			$customer_info['products'][] = array(
				'name' => $product['product_name'],
				'quantity' => intval($product['product_quantity']),
				'price' => $product['product_price'],
				'productDescription' => $productDescription,
				'url' => $productLink,
				'thumbnailUrl' => $thumbnailUrl,
				'currency' => $currencyISO
			);
		}


		$context = Context::getContext();
		$id_lang = $context->language->id; // this will give you the id of the current language
		$language_code = $context->language->language_code; // this will give you the language code i.e 'en' for English
		$language_name = $context->language->name; // this will give you the name of the language i.e 'English'

		$carrier = new Carrier((int) ($order->id_carrier));

		$delivery_method = array(
			'id_reference' => $carrier->id_reference,
			'id_tax_rules_group' => $carrier->id_tax_rules_group,
			'id_carrier' => $carrier->id_carrier,
			'deleted' => $carrier->deleted,
			'shipping_handling' => $carrier->shipping_handling,
			'range_behavior' => $carrier->range_behavior,
			'is_module' => $carrier->is_module,
			'is_free' => $carrier->is_free,
			'shipping_external' => $carrier->shipping_external,
			'need_range' => $carrier->need_range,
			'external_module_name' => $carrier->external_module_name,
			'shipping_method' => $carrier->shipping_method,
			'position' => $carrier->position,
			'win_distance' => $carrier->win_distance,
			'max_delivery_delay' => $carrier->max_delivery_delay,
			'grade' => $carrier->grade,
			'url' => $carrier->url,
			'active' => $carrier->active,
			'delay' => $carrier->delay,
			'name' => $carrier->name,
			'all' => $carrier

		);

		$order_carrier = new OrderCarrier((int) $order->getIdOrderCarrier());

		$order_id = $order_carrier->id_order;


		//getting delivery point from inpost module
		if (Module::isInstalled('inpostshipping') && Module::isEnabled('inpostshipping')) {
			$module = Module::getInstanceByName('inpostshipping');
			$context = $module->getContext();
			$customerChoiceDataProvider = $module->getService('inpost.shipping.data_provider.customer_choice');
			$deliveryPoint = $customerChoiceDataProvider->getDataByCartId($order->id_cart)->point;
		}

		$order_number = $order->getUniqReference();

		Media::addJsDef(
			array(
				'customer_data' => $customer_info,
				'customer' => $customer,
				'delivery_address' => $deliveryAddress,
				'billing_address' => $billingAddress,
				'delivery_State' => $deliveryState,
				'billing_State' => $billingState,
				'billing_country' => $billingCountry,
				'delivery_country' => $deliveryCountry,
				'carrier' => $delivery_method,
				'order_carrier' => $order_carrier,
				'params' => $params,
				'totalPaid' => $order->total_paid,
				'currency' => $currencyISO,
				'language_code' => $language_code,
				'language_name' => $language_name,
				"orderProducts" => $order->getProducts(),
				'deliveryPoint' => $deliveryPoint,
				'shopName' => $shopName,
				'order_number' => $order_number

			)
		);


		$this->context->controller->registerJavascript(
			'simplyin',
			// Unique id
			'modules/' . $this->name . '/views/js/orderConfirmation.js',
			// JS file location
			['position' => 'bottom', 'priority' => 150] // Position and priority
		);

		return $this->display(__FILE__, 'orderConfirmation.tpl');
		// }
	}




	public function uninstall()
	{
		Configuration::deleteByName('SIMPLYIN_LIVE_MODE');

		include(dirname(__FILE__) . '/sql/uninstall.php');

		return parent::uninstall();
	}

	/**
	 * Load the configuration form
	 */
	public function getContent()
	{
		/**
		 * If values have been submitted in the form, process.
		 */
		if (((bool) Tools::isSubmit('submitSimplyinModule')) == true) {
			$this->postProcess();
		}

		$this->context->smarty->assign('module_dir', $this->_path);

		$output = $this->context->smarty->fetch($this->local_path . 'views/templates/admin/configure.tpl');

		return $output . $this->renderForm();
	}

	/**
	 * Create the form that will be displayed in the configuration of your module.
	 */
	protected function renderForm()
	{
		$helper = new HelperForm();

		$helper->show_toolbar = false;
		$helper->table = $this->table;
		$helper->module = $this;
		$helper->default_form_language = $this->context->language->id;
		$helper->allow_employee_form_lang = Configuration::get('PS_BO_ALLOW_EMPLOYEE_FORM_LANG', 0);

		$helper->identifier = $this->identifier;
		$helper->submit_action = 'submitSimplyinModule';
		$helper->currentIndex = $this->context->link->getAdminLink('AdminModules', false)
			. '&configure=' . $this->name . '&tab_module=' . $this->tab . '&module_name=' . $this->name;
		$helper->token = Tools::getAdminTokenLite('AdminModules');

		$helper->tpl_vars = array(
			'fields_value' => $this->getConfigFormValues(),
			/* Add values for your inputs */
			'languages' => $this->context->controller->getLanguages(),
			'id_language' => $this->context->language->id,
		);

		return $helper->generateForm(array($this->getConfigForm()));
	}

	/**
	 * Create the structure of your form.
	 */
	protected function getConfigForm()
	{
		return array(
			'form' => array(
				'legend' => array(
					'title' => $this->l('Settings'),
					'icon' => 'icon-cogs',
				),
				'input' => array(
					array(
						'type' => 'password',
						'name' => 'SIMPLYIN_SECRET_KEY',
						'label' => $this->l('Secret Key SimplyIn'),
					),
					array(
						'type' => 'password',
						'name' => 'INPOST_SECRET_KEY',
						'label' => $this->l('Secret Key Inpost'),
					),
				),
				'submit' => array(
					'title' => $this->l('Save'),
				),
			),
		);
	}

	/**
	 * Set values for the inputs.
	 */
	protected function getConfigFormValues()
	{
		return array(
			'SIMPLYIN_LIVE_MODE' => Configuration::get('SIMPLYIN_LIVE_MODE', true),
			'SIMPLYIN_ACCOUNT_EMAIL' => Configuration::get('SIMPLYIN_ACCOUNT_EMAIL', 'contact@prestashop.com'),
			'SIMPLYIN_ACCOUNT_PASSWORD' => Configuration::get('SIMPLYIN_ACCOUNT_PASSWORD', null),
			'SIMPLYIN_SECRET_KEY' => Configuration::get('SIMPLYIN_SECRET_KEY'),
			'INPOST_SECRET_KEY' => Configuration::get('INPOST_SECRET_KEY'),
		);
	}

	/**
	 * Save form data.
	 */
	protected function postProcess()
	{
		$form_values = $this->getConfigFormValues();

		foreach (array_keys($form_values) as $key) {
			Configuration::updateValue($key, Tools::getValue($key));
		}
	}

	/**
	 * Add the CSS & JavaScript files you want to be loaded in the BO.
	 */
	public function hookDisplayBackOfficeHeader()
	{
		if (Tools::getValue('configure') == $this->name) {
			// $this->context->controller->addJS($this->_path . 'views/js/back.js');
			$this->context->controller->addCSS($this->_path . 'views/css/back.css');
		}
	}

	public function fetchAllAvailableShippingMethods()
	{
		$carriers = Carrier::getCarriers(
			$this->context->language->id,
			true,
			false,
			false,
			null,
			Carrier::ALL_CARRIERS
		);
		return $carriers;
	}
	public function hookHeader($params)
	{
		$base_url = __PS_BASE_URI__;
		$shippingMethods = $this->fetchAllAvailableShippingMethods();
		$countries_list = Country::getCountries($this->context->language->id);

		$context = Context::getContext();

		// Get the current language object
		$currentLanguage = $context->language;
		$customer = $context->customer;

		$prestashop_version = Configuration::get('PS_VERSION_DB');


		Media::addJsDef([
			'extension_version' => $this->version,
			'prestashop_version' => $prestashop_version,
			'countries_list' => $countries_list,
			'shippingMethods' => $shippingMethods,
			'base_url' => $base_url,
			'files_url' => $this->_path,
			'inpost_api_key' => Configuration::get('INPOST_SECRET_KEY'),
			'shop_url' => $base_url,
			'full_shop_url' => Tools::getShopDomain() . $base_url,
			'currentLanguage' => $currentLanguage,
			'customer' => $customer



		]);

		$this->context->controller->addJS($this->_path . '/views/js/react-app/dist/bundle.js');
		$this->context->controller->addCSS($this->_path . '/views/css/front.css');



	}




}


