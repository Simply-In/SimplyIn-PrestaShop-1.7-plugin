import { selectDeliveryMethod } from "../../../functions/selectDeliveryMethod"
import placeholder from '../../../../../../img/placeholder.png';
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
	} = indexContext;

	if (!userData || !userData.billingAddresses) return;

	const { billingAddresses, shippingAddresses, parcelLockers } = userData;

	const billingAddressCount = billingAddresses.length;
	const shippingAddressCount = shippingAddresses.length;
	const parcelLockerCount = parcelLockers.length;

	const resetIndicesAndDefaults = () => {
		setSelectedBillingIndex(0);
		setSelectedShippingIndex(null);
		setSelectedDeliveryPointIndex(null);
		setSameDeliveryAddress(true);
		sessionStorage.setItem("BillingIndex", `0`);
		sessionStorage.setItem("ShippingIndex", `null`);
		sessionStorage.setItem("ParcelIndex", `null`);
	};

	const handleSingleBillingAddress = () => {
		if (shippingAddressCount === 0 && parcelLockerCount === 0) {
			resetIndicesAndDefaults();
			createAddressesController({ userData, selectedBillingIndex: 0, selectedShippingIndex: null, sameDeliveryAddress: true, handleClosePopup, isUserLoggedIn });
			handleClosePopup();
			selectDeliveryMethod({ provider: "default" });
		} else if (shippingAddressCount === 1 && parcelLockerCount === 0) {
			setSelectedShippingIndex(0);
			sessionStorage.setItem("ShippingIndex", `0`);
			createAddressesController({ userData, selectedBillingIndex: 0, selectedShippingIndex: 0, sameDeliveryAddress: !isSameShippingAndBillingAddresses({ billingAddress: billingAddresses[0], shippingAddress: shippingAddresses[0] }), handleClosePopup, isUserLoggedIn });
		} else if (shippingAddressCount > 1 && parcelLockerCount === 0) {
			setSelectedShippingIndex(0);
			sessionStorage.setItem("ShippingIndex", `0`);
			createAddressesController({ userData, selectedBillingIndex: 0, selectedShippingIndex: 0, sameDeliveryAddress: false, handleClosePopup, isUserLoggedIn });
		} else if (parcelLockerCount === 1) {
			setSelectedDeliveryPointIndex(0);
			sessionStorage.setItem("ParcelIndex", `0`);
			selectDeliveryMethod({ deliveryPointID: parcelLockers[0].lockerId });
			createAddressesController({ userData, selectedBillingIndex: 0, selectedShippingIndex: null, sameDeliveryAddress: true, handleClosePopup, isUserLoggedIn });
			handleClosePopup();
		} else if (parcelLockerCount > 1) {
			setSelectedDeliveryPointIndex(0);
			setPickupPointDelivery(true);
			sessionStorage.setItem("ParcelIndex", `0`);
			createAddressesController({ userData, selectedBillingIndex: 0, selectedShippingIndex: null, sameDeliveryAddress: true, handleClosePopup, isUserLoggedIn });
		}
	};

	if (billingAddressCount === 1) {
		handleSingleBillingAddress();
	} else {
		resetIndicesAndDefaults();
		selectDeliveryMethod({ provider: "default" });
	}
};

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





