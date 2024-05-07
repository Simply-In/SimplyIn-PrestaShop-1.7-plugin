type ISessionStorageData = {
	key:
	'UserData' |
	"simplyinToken" |
	"phoneToken" |
	"phoneNumber" |
	"inpost-delivery-point" |
	"ShippingIndex" |
	"BillingIndex" |
	"delivery-address" |
	"invoice-address" |
	"customChanges" |
	"billingAddressesId" |
	"shippingAddressesId" |
	"useParcel" |
	"ParcelIndex" |
	"isParcelAdded" |
	"isInpostKeyValid" |
	"hasSimplyAlreadyBeenCalled" |
	"isSimplyDataSelected" |
	"selectedShippingMethod" |
	"isDeliverySelected" |
	"isBillingSelected" 
	data: any
} | {
	key: "createSimplyAccount"
	data: boolean
}


export const saveDataSessionStorage = ({ key, data }: ISessionStorageData) => {
	try {
		sessionStorage.setItem(key, JSON.stringify(data));
	} catch (error) {
		console.error("Error saving data", error);
	}
}


export const removeDataSessionStorage = ({ key }: loadFunctionArgsType) => {
	try {
		sessionStorage.removeItem(key);
	} catch (error) {
		console.error("Error removing data", error);
	}
}


type loadFunctionArgsType = Pick<ISessionStorageData, 'key'>

export const loadDataFromSessionStorage = ({ key }: loadFunctionArgsType) => {
	try {
		const serializedData = sessionStorage.getItem(key);
		if (serializedData === null) {
			return undefined;
		}
		return JSON.parse(serializedData);
	} catch (error) {
		console.error("Error loading data", error);
		return undefined;
	}
}