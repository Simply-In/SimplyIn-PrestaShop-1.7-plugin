import axios from "axios";
import { loadDataFromSessionStorage, saveDataSessionStorage } from "../services/sessionStorageApi";

type IselectIPickupPointInpost = {
	deliveryPointID?: string,
	provider?: "inpostshipping" | "default"
}

type data = {
	selector?: string;
	timeout?: any
}



const waitForElementToRender = ({ selector, timeout = 5000 }: data) => {

	const checkElement = (resolve: any, reject: any) => {
		const element = document.querySelector(selector ?? "");
		if (element) {
			resolve(element);
		} else if (timeout <= 0) {
			reject(new Error(`Could not find element with selector ${selector}`));
		} else {
			setTimeout(checkElement, 100, resolve, reject);
		}
		timeout -= 100;
	};
	return new Promise(checkElement);

};



export const selectDeliveryMethod = async ({ deliveryPointID, provider = "inpostshipping" }: IselectIPickupPointInpost) => {

	// const billingIndex = loadDataFromSessionStorage({ key: "BillingIndex" })
	// const parcelIndex = loadDataFromSessionStorage({ key: "ParcelIndex" })
	// const shippingIndex = loadDataFromSessionStorage({ key: "ShippingIndex" })

	if (deliveryPointID === undefined) {
		return

	}

	const isShippingMethodSelected = loadDataFromSessionStorage({ key: "selectedShippingMethod" })


	if (isShippingMethodSelected) {
		return
	}

	if (provider !== "default" && deliveryPointID === undefined) {

		return
	}

	if (provider === "default") {

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		const shippingMethodsWOProviders = shippingMethods.filter((el) => el.external_module_name !== "inpostshipping")

		const firstNotInpostShippingMethod = shippingMethodsWOProviders[0].id_carrier

		waitForElementToRender({ selector: `#delivery_option_${firstNotInpostShippingMethod}` }).then((shippingRadioButton: any) => {
			if (shippingRadioButton) {
				shippingRadioButton.checked = true;
				const event = new Event('change', { 'bubbles': true, 'cancelable': true });
				shippingRadioButton.dispatchEvent(event);
				saveDataSessionStorage({ key: 'selectedShippingMethod', data: true })

				}
			});

	}

	if (deliveryPointID !== undefined && provider === "inpostshipping") {

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		const shippingMethod = shippingMethods.find((el) => el.external_module_name === "inpostshipping")

		const shippingMethodId = shippingMethod?.id_carrier


		if (!deliveryPointID) return


		if (!document.querySelector('#checkout-delivery-step')) {
			return
		}
		if (!document.querySelector('#checkout-payment-step')?.classList.contains("-unreachable")) {
			return
		}


		if (document.querySelector('#checkout-delivery-step')?.classList.contains("-unreachable")) {
			return
		}

		const inpostPointData = await getInpostPointData({ deliveryPointID: deliveryPointID })
		if (!inpostPointData.name) {

			return;
		}


		let flag = false;

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		const selectDeliveryPoint = (status: string) => {

			return new Promise<boolean>((resolve, reject): void => {

				waitForElementToRender({ selector: `#delivery_option_${shippingMethodId}` }).then((shippingRadioButton: any) => {
					if (shippingRadioButton) {
						shippingRadioButton.checked = true;
						const event = new Event('change', { 'bubbles': true, 'cancelable': true });
						shippingRadioButton.dispatchEvent(event);
					}
					waitForElementToRender({ selector: `input[name="inpost_locker[${shippingMethodId}]"]` }).then(async (hiddenInput: any) => {
						const parentContainer = hiddenInput.parentNode;
						const selectedMachineID = parentContainer.querySelector('span.js-inpost-shipping-machine-name');
						const isMachineSelected = selectedMachineID.innerText.replace(" ", '').toUpperCase() === deliveryPointID.replace(" ", '').toUpperCase();



						if (isMachineSelected) {
							resolve(true);
							saveDataSessionStorage({ key: 'selectedShippingMethod', data: true })
							return;
						}

						if (!isMachineSelected) {
							hiddenInput.value = deliveryPointID;
							const form = document?.getElementById("js-delivery") as HTMLFormElement;
							form.addEventListener('submit', function (e) {
								e.preventDefault();
							});
							await form.submit();
							resolve(true);
							return
						}
						reject(false)

					});
				});
			});
		};

		const startSelectDeliveryPoint = () => {
			try {
			selectDeliveryPoint('first try').then((status) => {
				flag = status;
			});


			const interval = setTimeout(() => {
				if (!flag) {
					selectDeliveryPoint('second try').then((status) => {
						flag = status;

					});
				} else {
					clearInterval(interval);
				}
			}, 2000);
			} catch (e) {
				console.log(e)
			}
		};

		startSelectDeliveryPoint();
	}

}

export const getInpostPointData = async ({ deliveryPointID }: Omit<IselectIPickupPointInpost, "provider">) => {
	try {
		const res = await axios(`https://api-pl-points.easypack24.net/v1/points/${deliveryPointID}`);
		const pointData = res.data;

		return pointData

	} catch (error) {
		console.error('Error:', error);
		return false
	}
}