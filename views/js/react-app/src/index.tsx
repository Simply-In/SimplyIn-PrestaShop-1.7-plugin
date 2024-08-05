
import ReactDOM from "react-dom";
import { SimplyID } from "./components/SimplyID";

import { PhoneField } from "./components/PhoneField/PhoneField";

import { loadDataFromSessionStorage, removeDataSessionStorage, saveDataSessionStorage } from "./services/sessionStorageApi";


import SimplyBrandIcon from "./assets/SimplyBrandIcon";
import { selectDeliveryMethod } from "./functions/selectDeliveryMethod.ts";
import { middlewareApi } from "./services/middlewareApi";
import './i18n.ts'


const isCheckoutPage = document.getElementById('checkout')
const isOrderConfirmation = document.getElementById('order-confirmation')
if (!isCheckoutPage && !isOrderConfirmation) {
	saveDataSessionStorage({ key: "isSimplyDataSelected", data: false })
	removeDataSessionStorage({ key: "UserData" })
	removeDataSessionStorage({ key: "BillingIndex" })
	removeDataSessionStorage({ key: "ShippingIndex" })
	removeDataSessionStorage({ key: "ParcelIndex" })
	removeDataSessionStorage({ key: "simplyinToken" })
	removeDataSessionStorage({ key: "phoneNumber" })
	removeDataSessionStorage({ key: "selectedShippingMethod" })
	removeDataSessionStorage({ key: "SelectedTab" })
	removeDataSessionStorage({ key: "createSimplyAccount" })
}

if (isCheckoutPage) {
	removeDataSessionStorage({ key: "orderConfirmationExecuted" })
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const listOfCountries = Object.keys(countries_list).map((key) => countries_list[key]).sort((a, b) => a.name.localeCompare(b.name));

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const isUserLoggedIn = (customer?.logged === true && customer?.is_guest !== "1")
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
// console.log("isUserLoggedIn", isUserLoggedIn, customer);
document.addEventListener('DOMContentLoaded', async () => {
	console.log('init log presta 1.7');

	const isValid = await checkApiKey();
	if (!isValid) return;

	if ($('#checkout').length > 0) {
		handleCheckoutPage();
	}
});

const checkApiKey = async (): Promise<boolean> => {
	const testRequest = await middlewareApi({
		endpoint: "checkout/submitEmail",
		method: 'POST',
		requestBody: { "email": "" }
	});

	if (testRequest?.message === "Merchant api key not found" || testRequest?.code === "UNAUTHORIZED") {
		console.log("SIMPLYIN API KEY INVALID");
		removeSimplyContent();
		return false;
	}
	return true;
};

const removeSimplyContent = () => {
	document.querySelector("#simplyLogoContainer")?.remove();
	document.querySelector("#phoneAppContainer")?.remove();
};

const handleCheckoutPage = () => {
	const personalInformation = document.getElementById('checkout-personal-information-step');
	addSimplyLogoContainer(personalInformation);

	const isParcelAdded = loadDataFromSessionStorage({ key: "isParcelAdded" });
	const parcelIndex = loadDataFromSessionStorage({ key: "ParcelIndex" });
	const userData = loadDataFromSessionStorage({ key: "UserData" });
	const SelectedTab = sessionStorage.getItem("SelectedTab");
	const parcelId = getFilteredParcelId(userData, parcelIndex, SelectedTab);

	if (!isNaN(parcelIndex) && !isParcelAdded && parcelId) {
		selectDeliveryMethod({ deliveryPointID: parcelId });
	}

	rearrangeFormGroups();
	setupReactContainers();
};

const addSimplyLogoContainer = (personalInformation: HTMLElement | null) => {
	const simplyLogoContainer = document.createElement("div");
	simplyLogoContainer.setAttribute("id", "simplyLogoContainer");
	personalInformation?.prepend(simplyLogoContainer);

	ReactDOM.render(
		<SimplyBrandIcon />,
		document.getElementById("simplyLogoContainer")
	);
};

const getFilteredParcelId = (userData: any, parcelIndex: any, SelectedTab: string | null) => {
	const filteredParcelLockers = userData?.parcelLockers.filter((el: any) =>
		SelectedTab === "parcel_machine" ? el.service_type === "parcel_machine" : el.service_type !== "parcel_machine"
	);
	return filteredParcelLockers?.length ? filteredParcelLockers[parcelIndex]?.lockerId : undefined;
};

const rearrangeFormGroups = () => {
	const parent = document.querySelector('#customer-form>div');
	const divs = parent?.getElementsByClassName('form-group row');

	if (divs && divs.length >= 4) {
		const fourthDiv = divs[3];
		const secondDiv = divs[0];
		parent?.insertBefore(fourthDiv, secondDiv);
	}
};

const setupReactContainers = () => {
	const formContainer2 = document.getElementById("simplyLogoContainer")?.parentNode;
	createAndAppendReactContainer(formContainer2 as ParentNode, "reactAppContainer2");
	if (!isUserLoggedIn) {
		const formContainer = document.getElementById("field-email")?.parentNode;
		createAndAppendReactContainer(formContainer as ParentNode, "reactAppContainer");
		ReactDOM.render(
			<SimplyID listOfCountries={listOfCountries} />,
			document.getElementById("reactAppContainer")
		);
	}

	if (isUserLoggedIn) {
		ReactDOM.render(
			<SimplyID listOfCountries={listOfCountries} isUserLoggedIn={isUserLoggedIn} />,
			document.getElementById("reactAppContainer2")
		);
	}

	addPhoneField();
};

const createAndAppendReactContainer = (parent: Node | null, containerId: string) => {
	const reactAppContainer = document.createElement("div");
	reactAppContainer.setAttribute("id", containerId);
	parent?.appendChild(reactAppContainer);
	return reactAppContainer;
};

const addPhoneField = () => {
	const paymentSection = document.getElementById("checkout-payment-step");
	const paymentContentSection = paymentSection?.querySelector(".content");
	const phoneAppContainer = document.createElement("div");
	phoneAppContainer.setAttribute("id", "phoneAppContainer");

	paymentContentSection?.insertBefore(phoneAppContainer, paymentContentSection.childNodes[4]);

	ReactDOM.render(
		<PhoneField />,
		document.getElementById("phoneAppContainer")
	);
};






