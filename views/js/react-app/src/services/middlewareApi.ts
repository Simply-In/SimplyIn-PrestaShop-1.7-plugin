import axios from "axios";



interface IRequestBoodyCoordinates {
	lat: string, lng: string
}
interface IMiddlewareApi {
	endpoint: "checkout/submitEmail" | "checkout/submitPhoneNumber" | "checkout/submitCheckoutCode" | "checkout/createUserData" | "userData" | "checkout/createOrder" | "checkout/resend-checkout-code-via-email" | "addresses/find" | "parcelLockers/getClosest" | "checkout/checkIfSubmitEmailPushNotificationWasConfirmed",
	method: "GET" | "POST" | "PATCH",
	requestBody: any
	token?: string
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const isUserLoggedIn = (customer?.logged === true && customer?.is_guest !== "1")

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const userEmail = isUserLoggedIn ? customer?.email : ""
export const middlewareApi = ({ endpoint, method, requestBody, token }: IMiddlewareApi) => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore
	const baseUrl = base_url || '.'
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore
	const extensionVersion = extension_version ?? ''
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore
	const prestashopVersion = prestashop_version ?? ''

	if (endpoint !== "parcelLockers/getClosest") {
		return axios.post(`${baseUrl}./modules/simplyin/api/submitData.php`, {			//dev

			endpoint,
			method,
			requestBody: {
				...requestBody,
				plugin_version: extensionVersion,
				shopVersion: prestashopVersion,
				shopUserEmail: userEmail || undefined
			},
			...(token ? { token } : {}),
		})
			.then((response) => {
				return response.data
			})
			.catch((error) => {
				console.log(error);
			})
	} else {
		return axios.post(`${baseUrl}./modules/simplyin/api/submitData.php`, {
			endpoint,
			method,
			requestBody: {
				"acceptedParcelLockerProviders": [
					"inpost",
					"ruch",
					"poczta",
					"ups",
					"dhl",
					"dpd",
					"meest",
					"fedex",
					"orlen"
				],
				"coordinates": {
					"lat": (requestBody as IRequestBoodyCoordinates).lat,
					"lng": (requestBody as IRequestBoodyCoordinates).lng
				},
				"searchRadiusInMeters": 20000,
				"numberOfItemsToFind": 50
			},
			token: token ?? "",
		})
			.then((response) => {
				return response.data
			})
			.catch((error) => {
				console.log(error);
			})

	}






}

