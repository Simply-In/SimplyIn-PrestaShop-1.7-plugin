import { selectDeliveryMethod } from "../../../functions/selectDeliveryMethod"
import placeholder from '../../../assets/placeholder.png';
import { loadDataFromSessionStorage, saveDataSessionStorage } from "../../../services/sessionStorageApi";
import { handlePhpScript } from "./Step2";

export const getPlaceholder = () => {
	return placeholder
}

type addressType = { [key: string]: string }

type isSameShippingAndBillingAddressesType = {
	billingAddress: addressType,
	shippingAddress: addressType,
}

export const isSameShippingAndBillingAddresses = ({ billingAddress, shippingAddress }: isSameShippingAndBillingAddressesType): boolean => {


	if (!shippingAddress) {
		return false
	}
	const comparingKeys = Object.keys(shippingAddress).filter((key) => key !== "_id") || []

	for (const key of comparingKeys) {
		if (shippingAddress[key] !== billingAddress[key]) {
			return false
		}
	}
	return true
}


export const predefinedFill = (userData: any, handleClosePopup: any, indexContext: any) => {

	const {
		setSelectedBillingIndex,
		setSelectedShippingIndex,
		setSelectedDeliveryPointIndex,
		setSameDeliveryAddress,
		setPickupPointDelivery,
		isUserLoggedIn
	} = indexContext

	if (!userData) {
		return
	}
	const { billingAddresses, shippingAddresses, parcelLockers } = userData

	if (billingAddresses === undefined) {

		return
	}

	if (billingAddresses?.length === 0) {

		return
	}

	if (billingAddresses?.length === 1 && shippingAddresses?.length === 1 && parcelLockers?.length === 0) {



		if (isSameShippingAndBillingAddresses({ billingAddress: billingAddresses[0], shippingAddress: shippingAddresses[0] })) {

			setSelectedShippingIndex(null)
			setSelectedDeliveryPointIndex(null)
			setSameDeliveryAddress(true)
			sessionStorage.setItem("ShippingIndex", `null`)

			createAddressesController({ userData, selectedBillingIndex: 0, selectedShippingIndex: null, sameDeliveryAddress: true, handleClosePopup, isUserLoggedIn })

		} else {

			setSelectedShippingIndex(0)
			setSelectedDeliveryPointIndex(null)
			setSameDeliveryAddress(false)
			sessionStorage.setItem("ShippingIndex", `0`)
			createAddressesController({ userData, selectedBillingIndex: 0, selectedShippingIndex: 0, sameDeliveryAddress: false, handleClosePopup, isUserLoggedIn })
		}

		setSelectedBillingIndex(0)
		sessionStorage.setItem("BillingIndex", `0`)
		sessionStorage.setItem("ParcelIndex", `null`)
		handleClosePopup()
		selectDeliveryMethod({ provider: "default" })
		return
	}

	if (billingAddresses?.length === 1 && shippingAddresses?.length > 1 && parcelLockers?.length === 0) {

		setSelectedBillingIndex(0)
		setSelectedShippingIndex(0)
		sessionStorage.setItem("BillingIndex", `0`)
		sessionStorage.setItem("ShippingIndex", `0`)
		sessionStorage.setItem("ParcelIndex", `null`)
		setSameDeliveryAddress(false)
		setSelectedDeliveryPointIndex(null)
		selectDeliveryMethod({ provider: "default" })

		if (isSameShippingAndBillingAddresses({ billingAddress: billingAddresses[0], shippingAddress: shippingAddresses[0] })) {
			createAddressesController({ userData, selectedBillingIndex: 0, selectedShippingIndex: null, sameDeliveryAddress: true, handleClosePopup, isUserLoggedIn })
		} else {
			createAddressesController({ userData, selectedBillingIndex: 0, selectedShippingIndex: 0, sameDeliveryAddress: false, handleClosePopup, isUserLoggedIn })
		}

		return
	}

	if (billingAddresses?.length === 1 && shippingAddresses?.length === 0 && parcelLockers?.length === 0) {

		setSelectedBillingIndex(0)
		setSelectedShippingIndex(null)
		setSameDeliveryAddress(true)
		setSelectedDeliveryPointIndex(null)
		sessionStorage.setItem("BillingIndex", `0`)
		sessionStorage.setItem("ShippingIndex", `null`)
		sessionStorage.setItem("ParcelIndex", `null`)
		selectDeliveryMethod({ provider: "default" })

		createAddressesController({ userData, selectedBillingIndex: 0, selectedShippingIndex: null, sameDeliveryAddress: true, handleClosePopup, isUserLoggedIn })

		handleClosePopup()
		return
	}


	if (billingAddresses?.length === 1 && shippingAddresses?.length === 0 && parcelLockers?.length === 1) {

		setSelectedBillingIndex(0)
		setSelectedShippingIndex(null)
		setSelectedDeliveryPointIndex(0)
		setSameDeliveryAddress(true)

		sessionStorage.setItem("BillingIndex", `0`)
		sessionStorage.setItem("ShippingIndex", `null`)
		sessionStorage.setItem("ParcelIndex", `0`)


		selectDeliveryMethod({ deliveryPointID: parcelLockers[0].lockerId });

		createAddressesController({ userData, selectedBillingIndex: 0, selectedShippingIndex: null, sameDeliveryAddress: true, handleClosePopup, isUserLoggedIn })

		handleClosePopup()
		return
	}


	if (billingAddresses?.length === 1 && shippingAddresses?.length === 0 && parcelLockers?.length > 1) {

		setSelectedBillingIndex(0)
		setSelectedShippingIndex(null)

		setSelectedDeliveryPointIndex(0)
		setSameDeliveryAddress(true)
		setPickupPointDelivery(true)

		sessionStorage.setItem("BillingIndex", `0`)
		sessionStorage.setItem("ShippingIndex", `null`)
		sessionStorage.setItem("ParcelIndex", `0`)

		createAddressesController({ userData, selectedBillingIndex: 0, selectedShippingIndex: null, sameDeliveryAddress: true, handleClosePopup, isUserLoggedIn })
		return
	}



}

type CreateAddressesControllerArgumentsType = {
	userData: any,
	selectedBillingIndex: number,
	selectedShippingIndex: number | null,
	sameDeliveryAddress: boolean,
	handleClosePopup: any,
	isUserLoggedIn: boolean
}
const createAddressesController = ({ userData, selectedBillingIndex, selectedShippingIndex, sameDeliveryAddress, handleClosePopup, isUserLoggedIn }: CreateAddressesControllerArgumentsType) => {

	if (!isUserLoggedIn) {
		return
	}

	const billingData = userData?.billingAddresses[selectedBillingIndex]
	const shippingData = (selectedShippingIndex !== null && userData?.shippingAddresses?.length) ? userData?.shippingAddresses[selectedShippingIndex] : null
	const isSameBillingAndShippingAddresses = sameDeliveryAddress || isSameShippingAndBillingAddresses({ billingAddress: billingData, shippingAddress: shippingData })

	let normalizedNumberFromDB = userData?.phoneNumber

	if (billingData?.country?.toLowerCase() == "PL".toLowerCase()) {
		if (userData?.phoneNumber?.startsWith("+48")) {
			normalizedNumberFromDB = normalizedNumberFromDB.substring(3)
		}
	}

	if (billingData && typeof selectedBillingIndex === 'number') {
		handlePhpScript(
			{
				...billingData,
				phoneNumber: normalizedNumberFromDB || userData?.phoneNumber || ""
			},
			'billingAddressesId',
			isSameBillingAndShippingAddresses,
			{
				selectedBillingIndex: selectedBillingIndex ?? 0,
				selectedShippingIndex: selectedShippingIndex ?? 0,
				userData,
				simplyInput: userData.email || ""
			})
	}
	if (shippingData && !isSameBillingAndShippingAddresses && typeof selectedShippingIndex === 'number') {

		handlePhpScript(
			{
				...shippingData,
				phoneNumber: normalizedNumberFromDB || userData?.phoneNumber || ""
			},
			'shippingAddressesId',
			false,
			{
				selectedBillingIndex: selectedBillingIndex,
				selectedShippingIndex: selectedShippingIndex,
				userData,
				simplyInput: userData.email || ""
			})
	} else {
		const billingAddressId = loadDataFromSessionStorage({ key: "billingAddressesId" })
		saveDataSessionStorage({ key: "shippingAddressesId", data: billingAddressId })
	}
	saveDataSessionStorage({ key: 'isSimplyDataSelected', data: true })

		handleClosePopup()

	location.reload();
}





