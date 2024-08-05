/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck

import { useEffect } from "react"
import { loadDataFromSessionStorage, saveDataSessionStorage } from "../services/sessionStorageApi";
import caseparser from 'caseparser';
import { selectDeliveryMethod } from "../functions/selectDeliveryMethod";


// Helper function to get an element by selector
const getElement = (selector: string) => document.querySelector(selector);

// Helper function to set a form field value
const setFieldValue = (selector: string, value: string) => {
	const field = getElement(selector) as HTMLInputElement;
	if (field) field.value = value;
};

// Helper function to trigger a change event
const triggerChangeEvent = (element: Element) => {
	const event = new Event('change', { bubbles: true, cancelable: true });
	element.dispatchEvent(event);
};

// Helper function to select and highlight an address
const selectAddress = (addressType: string, addressId: string | null) => {
	if (addressId) {
		const addressPin = getElement(`input[type="radio"][name="id_address_${addressType}"][value="${addressId}"]`);
		const addressPinArticle = getElement(`article[id="id_address_${addressType}-address-${addressId}"]`);
		const allPinsArticles = document.querySelectorAll(`article[id^="id_address_${addressType}-address-"]`);
		allPinsArticles.forEach(el => el.classList.remove("selected"));
		if (addressPinArticle) addressPinArticle.classList.add("selected");
		if (addressPin) {
			addressPin.checked = true;
			triggerChangeEvent(addressPin);
		}
	}
};

// Helper function to handle session storage interactions
const getSessionData = (key: string) => loadDataFromSessionStorage({ key });
const setSessionData = (key: string, data: any) => saveDataSessionStorage({ key, data });


const fillFormFields = (data: any, formId: string, listOfCountries: any[], customChanges: any) => {
	const formContainer = document?.getElementById(formId);
	if (!formContainer) return;

	setFieldValue('#field-firstname', customChanges.fieldFirstname || data.name || "");
	setFieldValue('#field-lastname', customChanges.fieldLastname || data.surname || "");
	setFieldValue('#field-city', customChanges.fieldCity || data.city || "");
	setFieldValue('#field-company', customChanges.fieldCompany || data.companyName || "");
	setFieldValue('#field-vat_number', customChanges.fieldVat_number || data.taxId || "");

	let normalizedNumberFromDB = data.phoneNumber;
	if (data?.country?.toLowerCase() === "pl" && data.phoneNumber.startsWith("+48")) {
		normalizedNumberFromDB = normalizedNumberFromDB.substring(3);
	}
	setFieldValue('#field-phone', customChanges.fieldPhone || normalizedNumberFromDB || "");

	setFieldValue('#field-address1', customChanges.fieldAddress1 || `${data.street}` || "");
	setFieldValue('#field-address2', customChanges.fieldAddress2 || data.appartmentNumber || "");
	setFieldValue('#field-postcode', customChanges.fieldPostcode || data.postalCode || "");

	if ("country" in data) {
		const countrySubstitute = listOfCountries.find(el => el.iso_code === data?.country);
		const options = Array.from(formContainer.querySelector('#field-id_country').options);
		const selectedCountry = options.find(el => el.text === countrySubstitute.country);
		getElement("#field-id_country").value = selectedCountry?.value || "";
	}

	setSessionData(formId, "true");
	if (formId === "invoice-address") {
		setSessionData("billingAddressesId", "last");
	}
};

export const useInsertFormData = (userData: any, listOfCountries: any[]) => {
	const customChanges = {
		customerForm: {},
		deliveryAddress: {},
		invoiceAddress: {},
		...getSessionData("customChanges")
	};

	useEffect(() => {
		// Add event listeners for form input fields
		const addInputListeners = (formId: string, customChangeKey: string) => {
			const formDiv = document.getElementById(formId);
			if (formDiv) {
				const inputs = formDiv.querySelectorAll('input[id^="field"]');
				inputs.forEach(el => {
					el.addEventListener("input", (e: Event) => {
						customChanges[customChangeKey][caseparser.dashToCamel((e.target as HTMLInputElement).id)] = (e.target as HTMLInputElement).value;
						setSessionData("customChanges", customChanges);
					});
				});
			}
		};

		addInputListeners("customer-form", "customerForm");
		addInputListeners("delivery-address", "deliveryAddress");
		addInputListeners("invoice-address", "invoiceAddress");

		if (!userData || !Object.keys(userData).length) return;

		// Populate customer form
		if (getElement("#customer-form")) {
			setFieldValue('#field-email', customChanges?.customerForm?.fieldEmail || userData.email || "");
			setFieldValue('#field-firstname', customChanges?.customerForm?.fieldFirstname || userData.name || "");
			setFieldValue('#field-lastname', customChanges?.customerForm?.fieldLastname || userData.surname || "");
		}

		// Handle address selections
		const BillingIndex = getSessionData("BillingIndex");
		const ShippingIndex = getSessionData("ShippingIndex");
		const ParcelIndex = getSessionData("ParcelIndex");
		const ShippingAddressesId = getSessionData("shippingAddressesId");
		const BillingAddressesId = getSessionData("billingAddressesId");
		const useSameAddressCheckbox = getElement('#use_same_address') as HTMLInputElement;

		if (ShippingIndex === "null" || (ShippingIndex === "null" && BillingAddressesId !== ShippingAddressesId)) {
			if (useSameAddressCheckbox) useSameAddressCheckbox.checked = true;

			if (userData?.billingAddresses?.length) {
				fillFormFields({ ...userData?.billingAddresses[BillingIndex ?? 0], phoneNumber: userData?.phoneNumber }, "delivery-address", listOfCountries, customChanges.invoiceAddress);
				fillFormFields({ ...userData?.billingAddresses[BillingIndex ?? 0], phoneNumber: userData?.phoneNumber }, "invoice-address", listOfCountries, customChanges.invoiceAddress);
			}
		} else {
			if (useSameAddressCheckbox) useSameAddressCheckbox.checked = false;

			if (userData?.shippingAddresses?.length) {
				fillFormFields({ ...userData?.shippingAddresses[ShippingIndex ?? 0], phoneNumber: userData?.phoneNumber }, "delivery-address", listOfCountries, customChanges.deliveryAddress);
			}

			if (userData?.billingAddresses?.length) {
				fillFormFields({ ...userData?.billingAddresses[BillingIndex ?? 0], phoneNumber: userData?.phoneNumber }, "invoice-address", listOfCountries, customChanges.invoiceAddress);
			}
		}

		const isDeliverySelected = getSessionData("isDeliverySelected");
		const isBillingSelected = getSessionData("isBillingSelected");

		if ((!isDeliverySelected || !isBillingSelected) && getElement("#not-valid-addresses")) {
			const checkoutStep2 = getElement("#checkout-addresses-step");
			if (checkoutStep2) {
				try {
					const continueBtn = checkoutStep2.querySelector('button[type="submit"][class*="continue"]');
					setSessionData("isDeliverySelected", true);
					setSessionData("isBillingSelected", true);
					continueBtn?.click();
				} catch (err) {
					console.log(err);
				}
			}
		}

		if (ParcelIndex === "null") {
			selectDeliveryMethod({ provider: "default" });
		} else if (userData?.parcelLockers?.lockerId) {
			const filteredParcelLockers = userData?.parcelLockers.filter((el: any) => selectedTab === "parcel_machine" ? el.service_type === "parcel_machine" : el.service_type !== "parcel_machine");
			const parcelId = filteredParcelLockers[selectedDeliveryPointIndex]?.lockerId;
			selectDeliveryMethod({ deliveryPointID: parcelId });
		}

	}, [userData]);
};

