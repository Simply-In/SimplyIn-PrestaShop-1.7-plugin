/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck

import { useEffect } from "react"
import { loadDataFromSessionStorage, removeDataSessionStorage, saveDataSessionStorage } from "../services/sessionStorageApi";
import caseparser from 'caseparser';
import { selectDeliveryMethod } from "../functions/selectDeliveryMethod";


const fillForm = (data, formId, listOfCountries, customChanges) => {

	const deliveryId = loadDataFromSessionStorage({ key: "shippingAddressesId" })
	const billingId = loadDataFromSessionStorage({ key: "billingAddressesId" })

	if (deliveryId !== billingId) {
		const linkElement = document.querySelector('a[data-link-action="different-invoice-address"]');
		if (linkElement) {
			linkElement.click();
		}
	}

	if (billingId) {

		const addressPin = document.querySelector(`input[type="radio"][name="id_address_invoice"][value="${billingId}"]`);
		const addressPinArticle = document.querySelector(`article[id="id_address_invoice-address-${billingId}"]`);

		const allPinsArticles = document.querySelectorAll(`article[id^="id_address_invoice-address-"]`);
		allPinsArticles.forEach((el) => { el.classList.remove("selected") })
		addressPinArticle?.classList.add("selected")

		if (addressPin && billingId && billingId !== "last") {
			addressPin.checked = true;
			const event = new Event('change', { 'bubbles': true, 'cancelable': true });
			addressPin?.dispatchEvent(event);


		}

		if (billingId === "last") {

			const allAddressPins = document.querySelectorAll(`input[type="radio"][name="id_address_invoice"]`);

			if (allAddressPins.length) {
				const pinWithHighestValue = [...allAddressPins]?.reduce((prev, current) => (prev.value > current.value) ? prev : current, [])


				pinWithHighestValue.checked = true;

				const event = new Event('change', { 'bubbles': true, 'cancelable': true });
				pinWithHighestValue?.dispatchEvent(event);

			}

		}
	}

	if (deliveryId) {
		const addressPin = document.querySelector(`input[type="radio"][name="id_address_delivery"][value="${deliveryId}"]`);


		const addressPinArticle = document.querySelector(`article[id="id_address_delivery-address-${deliveryId}"]`);

		const allPinsArticles = document.querySelectorAll(`article[id^="id_address_delivery-address-"]`);

		allPinsArticles.forEach((el) => { el.classList.remove("selected") })
		addressPinArticle?.classList.add("selected")

		if (addressPin && deliveryId) {
			addressPin.checked = true;
			const event = new Event('change', { 'bubbles': true, 'cancelable': true });
			addressPin?.dispatchEvent(event);

		}

	}

	if (data) {

		const formContainer = document?.getElementById(formId)



		if (!formContainer) return

		if ("name" in data && formContainer.querySelector('#field-firstname')) {
			formContainer.querySelector('#field-firstname').value = customChanges.fieldFirstname || data.name || ""
		}
		if ("surname" in data && formContainer.querySelector('#field-lastname')) {
			formContainer.querySelector('#field-lastname').value = customChanges.fieldLastname || data.surname || ""
		}
		if ("city" in data && formContainer.querySelector('#field-city')) { (formContainer.querySelector('#field-city') as HTMLInputElement).value = customChanges.fieldCity || data.city || "" }
		if ("companyName" in data && formContainer.querySelector('#field-company')) { (formContainer.querySelector('#field-company') as HTMLInputElement).value = customChanges.fieldCompany || data.companyName || "" }
		if ("taxId" in data && formContainer.querySelector('#field-vat_number')) { (formContainer.querySelector('#field-vat_number') as HTMLInputElement).value = customChanges.fieldVat_number || data.taxId || "" }
		if ("phoneNumber" in data && formContainer.querySelector('#field-phone')) {
			let normalizedNumberFromDB = data.phoneNumber
			if (data?.country?.toLowerCase() == "PL".toLowerCase()) {
				if (data.phoneNumber.startsWith("+48")) {
					normalizedNumberFromDB = normalizedNumberFromDB.substring(3)
				}
			}
			(formContainer.querySelector('#field-phone') as HTMLInputElement).value = customChanges.fieldPhone || normalizedNumberFromDB || data.phoneNumber || ""
		}
		if ("street" in data && formContainer.querySelector('#field-address1')) { (formContainer.querySelector('#field-address1') as HTMLInputElement).value = customChanges.fieldAddress1 || `${data.street}` || "" }
		if ("appartmentNumber" in data && formContainer.querySelector('#field-address2')) { (formContainer.querySelector('#field-address2') as HTMLInputElement).value = customChanges.fieldAddress2 || data.appartmentNumber || "" }
		if ("postalCode" in data && formContainer.querySelector('#field-postcode')) { (formContainer.querySelector('#field-postcode') as HTMLInputElement).value = customChanges.fieldPostcode || data.postalCode || "" }
		if ("country" in data && formContainer.querySelector('#field-id_country')) {


			const countrySubstitute = listOfCountries.find((el) => el.iso_code === data?.country)

			const options = Array.from(formContainer.querySelector('#field-id_country').options)

			const selectedCountry = options.find((el) => el.text === countrySubstitute.country)

			document.getElementById("field-id_country").value = selectedCountry?.value || ""


		}
	}
	saveDataSessionStorage({ key: formId, data: "true" })


	if (formId === "invoice-address") {
		saveDataSessionStorage({ key: "billingAddressesId", data: "last" })
	}
}

export const useInsertFormData = (userData: any, listOfCountries: any) => {

	const dataFromSesisonStorage = loadDataFromSessionStorage({ key: "customChanges" })

	const customChanges = {
		customerForm: {},
		deliveryAddress: {},
		invoiceAddress: {},
		...dataFromSesisonStorage
	}


	useEffect((): void => {

		document.getElementById("customer-form")?.addEventListener("input", (e) => {
			customChanges.customerForm[caseparser.dashToCamel(e.target.id)] = e.target.value
			saveDataSessionStorage({ key: "customChanges", data: customChanges })
		})


		const deliveryAddressDiv = document.getElementById("delivery-address")
		const invoiceAddressDiv = document.getElementById("invoice-address")
		if (deliveryAddressDiv) {
			const inputs = deliveryAddressDiv.querySelectorAll('input[id^="field"]')
			inputs.forEach((el) => {
				el.addEventListener("input", (e) => {
					customChanges.deliveryAddress[caseparser.dashToCamel(e.target.id)] = e.target.value
					saveDataSessionStorage({ key: "customChanges", data: customChanges })
				})
			})
		}

		if (invoiceAddressDiv) {
			const inputs = invoiceAddressDiv.querySelectorAll('input[id^="field"]')
			inputs.forEach((el) => {
				el.addEventListener("input", (e) => {
					customChanges.invoiceAddress[caseparser.dashToCamel(e.target.id)] = e.target.value
					saveDataSessionStorage({ key: "customChanges", data: customChanges })
				})
			})
		}


		if (!userData) return

		if (!Object.keys(userData).length) {
			return
		}


		if (document?.getElementById("customer-form")) {
			if ("fieldEmail" in userData && document?.getElementById("customer-form")?.querySelector('#field-email')) {
				(document.getElementById("customer-form").querySelector('#field-email') as HTMLInputElement).value = customChanges?.customerForm?.fieldEmail || userData.email || ""
			}
			if ("name" in userData && document?.getElementById("customer-form")?.querySelector('#field-firstname')) {
				(document.getElementById("customer-form").querySelector('#field-firstname') as HTMLInputElement).value = customChanges?.customerForm?.fieldFirstname || userData.name || ""
			}
			if ("surname" in userData && document?.getElementById("customer-form")?.querySelector('#field-lastname')) {
				(document.getElementById("customer-form").querySelector('#field-lastname') as HTMLInputElement).value = customChanges?.customerForm?.fieldLastname || userData.surname || ""
			}
		}


		const BillingIndex = sessionStorage.getItem("BillingIndex")
		const ShippingIndex = sessionStorage.getItem("ShippingIndex")
		const ParcelIndex = sessionStorage.getItem("ParcelIndex")

		const ShippingAddressesId = sessionStorage.getItem("shippingAddressesId")
		const BillingAddressesId = sessionStorage.getItem("billingAddressesId")

		const useSameAddressCheckbox = document.getElementById('use_same_address')

		if (ShippingIndex === "null" || (ShippingIndex === "null" && BillingAddressesId !== ShippingAddressesId)) {

			//Same address
			if (useSameAddressCheckbox) {
				useSameAddressCheckbox.checked = true
			}

			if (userData?.billingAddresses?.length) {
				fillForm({ ...userData?.billingAddresses[BillingIndex ?? 0], phoneNumber: userData?.phoneNumber }, "delivery-address", listOfCountries, customChanges.invoiceAddress)
				fillForm({ ...userData?.billingAddresses[BillingIndex ?? 0], phoneNumber: userData?.phoneNumber }, "invoice-address", listOfCountries, customChanges.invoiceAddress)
			}

		} else {

			//Different address
			if (useSameAddressCheckbox) {
				useSameAddressCheckbox.checked = false
			}

			if (userData?.shippingAddresses?.length) {
				fillForm({ ...userData?.shippingAddresses[ShippingIndex ?? 0], phoneNumber: userData?.phoneNumber }, "delivery-address", listOfCountries, customChanges.deliveryAddress)
			}

			if (userData?.billingAddresses?.length) {
				fillForm({ ...userData?.billingAddresses[BillingIndex ?? 0], phoneNumber: userData?.phoneNumber }, "invoice-address", listOfCountries, customChanges.invoiceAddress)
			}







		}

		const isDeliverySelected = loadDataFromSessionStorage({ key: "isDeliverySelected" })
		const isBillingSelected = loadDataFromSessionStorage({ key: "isBillingSelected" })

		if ((!isDeliverySelected || !isBillingSelected) && document.getElementById("not-valid-addresses")) {
			const checkoutStep2 = document.getElementById("checkout-addresses-step")
			if (checkoutStep2) {
				try {
					const continueBtn = checkoutStep2?.querySelector('button[type="submit"][class*="continue"]')
					saveDataSessionStorage({ key: "isDeliverySelected", data: true })
					saveDataSessionStorage({ key: "isBillingSelected", data: true })
					continueBtn?.click()
				} catch (err) { console.log(err); }
			}

		}

		if (ParcelIndex === "null") {
			selectDeliveryMethod({ provider: "default" })
		} else if (userData?.parcelLockers?.lockerId) {
			selectDeliveryMethod({ deliveryPointID: userData?.parcelLockers?.lockerId })
		}




	}, [userData])

} 
