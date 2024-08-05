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
	if (deliveryPointID === undefined) return;

	if (isShippingMethodAlreadySelected()) return;

	if (provider === "default") {
		await handleDefaultProvider();
	} else if (provider === "inpostshipping") {
		if (deliveryPointID) {
			await handleInpostProvider(deliveryPointID);
		}
	}
};

// Helper Functions

const isShippingMethodAlreadySelected = () => {
	return loadDataFromSessionStorage({ key: "selectedShippingMethod" });
};

const handleDefaultProvider = async () => {
	const shippingMethodId = getDefaultShippingMethodId();
	if (shippingMethodId) {
		await selectAndSaveShippingMethod(shippingMethodId);
	}
};

const handleInpostProvider = async (deliveryPointID: string) => {
	const shippingMethodId = getInpostShippingMethodId();
	if (shippingMethodId && isDeliveryStepAccessible()) {
		const inpostPointData = await getInpostPointData({ deliveryPointID });
		if (inpostPointData.name) {
			await selectDeliveryPointWithRetry(shippingMethodId, deliveryPointID);
		}
	}
};

const getDefaultShippingMethodId = () => {
// Filter out inpostshipping and get the ID of the first available method
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
	const shippingMethodsWOProviders = shippingMethods.filter(el => el.external_module_name !== "inpostshipping");
	return shippingMethodsWOProviders[0]?.id_carrier;
};

const getInpostShippingMethodId = () => {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
	const shippingMethod = shippingMethods.find(el => el.external_module_name === "inpostshipping");
	return shippingMethod?.id_carrier;
};

const isDeliveryStepAccessible = () => {
	return document.querySelector('#checkout-delivery-step') &&
		document.querySelector('#checkout-payment-step')?.classList.contains("-unreachable");
};

const selectAndSaveShippingMethod = async (shippingMethodId: string) => {
	await waitForElementAndCheck(`#delivery_option_${shippingMethodId}`);
	saveDataSessionStorage({ key: 'selectedShippingMethod', data: true });
};

const waitForElementAndCheck = async (selector: string) => {
	const element = await waitForElementToRender({ selector });
	if (element) {
		(element as HTMLInputElement).checked = true;
		const event = new Event('change', { bubbles: true, cancelable: true });
		(element as HTMLInputElement).dispatchEvent(event);
	}
};

const selectDeliveryPointWithRetry = async (shippingMethodId: string, deliveryPointID: string) => {
	try {
		const success = await trySelectDeliveryPoint(shippingMethodId, deliveryPointID);
		if (!success) {
			setTimeout(async () => {
				await trySelectDeliveryPoint(shippingMethodId, deliveryPointID);
			}, 2000);
		}
	} catch (error) {
		console.error(error);
	}
};

const trySelectDeliveryPoint = async (shippingMethodId: string, deliveryPointID: string): Promise<boolean> => {
	return new Promise(async (resolve) => {
		const shippingRadioButton = await waitForElementToRender({ selector: `#delivery_option_${shippingMethodId}` });
		if (shippingRadioButton) {
			(shippingRadioButton as HTMLInputElement).checked = true;
			const event = new Event('change', { bubbles: true, cancelable: true });
			(shippingRadioButton as HTMLInputElement).dispatchEvent(event);
		}

		const hiddenInput = await waitForElementToRender({ selector: `input[name="inpost_locker[${shippingMethodId}]"]` });
		const isMachineSelected = await checkIfMachineSelected(hiddenInput as any, deliveryPointID);

		if (isMachineSelected) {
			resolve(true);
			saveDataSessionStorage({ key: 'selectedShippingMethod', data: true });
		} else {
			await updateHiddenInput(hiddenInput as any, deliveryPointID);
			resolve(true);
		}
	});
};

const checkIfMachineSelected = async (hiddenInput: HTMLElement, deliveryPointID: string) => {
	const parentContainer = hiddenInput.parentNode;
	const selectedMachineID = parentContainer?.querySelector('span.js-inpost-shipping-machine-name');
	return (selectedMachineID as any)?.innerText?.replace(" ", '').toUpperCase() === deliveryPointID.replace(" ", '').toUpperCase();
};

const updateHiddenInput = (hiddenInput: HTMLInputElement, deliveryPointID: string) => {
	hiddenInput.value = deliveryPointID;
	const form = document.getElementById("js-delivery") as HTMLFormElement;
	form.addEventListener('submit', e => e.preventDefault());
	form.submit();
};

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