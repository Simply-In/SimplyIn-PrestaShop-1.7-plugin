import { useState, useEffect, ChangeEvent, createContext, useRef, useMemo } from "react";
import { z } from 'zod'
import { SimplyinSmsPopupOpenerIcon } from "../../assets/SimplyinSmsPopupOpenerIcon.tsx";
import { SimplyIn, SimplyinContainer, } from "./SimplyID.styled";
import { middlewareApi } from '../../services/middlewareApi.ts'
import { debounce } from 'lodash';
import PinCodeModal from "./PinCodeModal.tsx";
import { loadDataFromSessionStorage, saveDataSessionStorage } from "../../services/sessionStorageApi.ts";
import { useInsertFormData } from "../../hooks/useInsertFormData.ts";
import { isNumber, useSelectedSimplyData } from "../../hooks/useSelectedSimplyData.ts";

import { predefinedFill } from "./steps/functions.ts";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth.ts";
import { useCounterData } from "../../hooks/useCounterData.ts";
import { shortLang } from "./steps/Step1.tsx";
import { TabType } from "./steps/Step2.tsx";


export type TypedLoginType = "pinCode" | "app" | undefined
interface ISimplyID {
	listOfCountries: any
	isUserLoggedIn?: boolean
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const customerEmail = customer?.email

export const ApiContext = createContext<any>(null);
export const SelectedDataContext = createContext<any>(null);
export const CounterContext = createContext<any>({});
export const isValidEmail = (email: string) => z.string().email().safeParse(email).success

export const SimplyID = ({ listOfCountries, isUserLoggedIn }: ISimplyID) => {
	const [modalStep, setModalStep] = useState<1 | 2 | "rejected">(1)
	const [userData, setUserData] = useState({})
	const [simplyInput, setSimplyInput] = useState(isUserLoggedIn ? customerEmail : loadDataFromSessionStorage({ key: "UserData" })?.email || loadDataFromSessionStorage({ key: "customChanges" })?.customerForm?.fieldEmail || "");

	const [attributeObject, setAttributeObject] = useState({});
	const [visible, setVisible] = useState<boolean>(true)
	const [phoneNumber, setPhoneNumber] = useState("")
	const [downloadIconsAllowed, setDownloadIconsAllowed] = useState(true)

	// const [simplyinToken, setSimplyinToken] = useState("")
	const [isSimplyIdVisible, setIsSimplyIdVisible] = useState<boolean>(false)
	const [loginType, setLoginType] = useState<TypedLoginType>()
	const [notificationTokenId, setNotificationTokenId] = useState("")
	const [counter, setCounter] = useState(0)
	const { i18n } = useTranslation();


	const { authToken, setAuthToken } = useAuth()

	const {
		selectedBillingIndex,
		setSelectedBillingIndex,
		selectedShippingIndex,
		setSelectedShippingIndex,
		selectedDeliveryPointIndex,
		setSelectedDeliveryPointIndex,
		sameDeliveryAddress,
		setSameDeliveryAddress,
		pickupPointDelivery,
		setPickupPointDelivery,
		selectedTab,
		setSelectedTab,
		deliveryType,
		setDeliveryType
	} = useSelectedSimplyData();
	const {
		countdown,
		setCountdown,
		countdownError,
		setCountdownError,
		errorPinCode,
		setErrorPinCode,
		modalError,
		setModalError,
		countdownTime,
		setCountdownTime,
		countdownTimeError,
		setCountdownTimeError
	} = useCounterData();

	const myRef = useRef();

	const isSimplyModalSelected = loadDataFromSessionStorage({ key: "isSimplyDataSelected" }) === true ? true : false

	useEffect(() => {

		if (!myRef.current) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting === true) {
					setIsSimplyIdVisible(true)
				}
				else {
					setIsSimplyIdVisible(false)
				}
			},
			{ threshold: [0] }
		)
		observer?.observe(myRef?.current)

		// Clean up function
		return () => { observer?.unobserve((myRef as any)?.current) }
	}, []);



	useEffect(() => {

		if (!isUserLoggedIn) {
			const YodaInput = document.getElementById("field-email");
			YodaInput?.remove()

			const attributes: any = YodaInput?.attributes;
			const attributeKeeper: any = {};
			for (let i = 0; i < attributes.length; i++) {
				const attributeName = attributes[i].name;
				const attributeValue = attributes[i].value;
				attributeKeeper[attributeName] = attributeValue;
			}
			setAttributeObject(attributeKeeper);


		}
	}, []);




	useEffect(() => {

		const simplyinTokenFromStorage = sessionStorage.getItem("simplyinToken")

		setAuthToken(simplyinTokenFromStorage as string)

		const simplyinPhoneFromStorage = () => {

			if (sessionStorage.getItem("phoneNumber") === "undefined") {
				return undefined
			}
			return sessionStorage.getItem("phoneNumber")

		}


		setPhoneNumber(simplyinPhoneFromStorage() ?? "")
	}, [])

	useEffect(() => {
		if (visible === false) {
			const BillingIndex = (loadDataFromSessionStorage({ key: "BillingIndex" }) || 0) as number
			const ShippingIndex = loadDataFromSessionStorage({ key: "ShippingIndex" }) as number | null
			const ParcelIndex = loadDataFromSessionStorage({ key: "ParcelIndex" }) as number | null
			// const SelectedTab = loadDataFromSessionStorage({ key: "SelectedTab" }) ?? "parcel_machine" as TabType
			const SelectedTab = sessionStorage.getItem("SelectedTab") as TabType


			if ((isNumber(ShippingIndex))) {
				setDeliveryType("address")
			} else if (isNumber(ParcelIndex)) {
				setDeliveryType("machine")
			}

			setSelectedBillingIndex(BillingIndex)
			setSelectedShippingIndex(ShippingIndex)
			setSelectedDeliveryPointIndex(ParcelIndex)
			setSelectedTab(SelectedTab || "parcel_machine")



		}

	}, [visible])
	const handleOpenSmsPopup = () => {
		setVisible((prev) => !prev)
	};

	const handleSimplyInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSimplyInput(e.target.value)
		sessionStorage.removeItem("simplyinToken")
		sessionStorage.removeItem("UserData")
		sessionStorage.removeItem("phoneNumber")
		sessionStorage.removeItem("BillingIndex")
		sessionStorage.removeItem("ShippingIndex")
		sessionStorage.removeItem("shippingAddressesId")
		sessionStorage.removeItem("billingAddressesId")
		setAuthToken("")
		setUserData({})
	}

	const handleClosePopup = () => {
		setVisible(false)
		saveDataSessionStorage({ key: 'isSimplyDataSelected', data: true })
	}

	const maxAttempts = 180 * 1000 / 500; // 30 seconds divided by 500ms

	useEffect(() => {
		const handleApiResponse = ({ ok, rejected, authToken, userData }: any) => {
			if (authToken) {
				setAuthToken(authToken);
				sessionStorage.setItem("simplyinToken", authToken);
			}

			if (ok) {
				handleSuccessfulResponse(userData);
			} else if (ok === false && rejected === true) {
				handleRejectedResponse();
			} else if (counter < maxAttempts && notificationTokenId) {
				handleRetry();
			} else {
				console.log('Login not accepted within 180 seconds');
			}
		};

		const handleSuccessfulResponse = (userData: any) => {
			if (userData?.language) {
				i18n.changeLanguage(userData.language.toLowerCase());
			}

			const newData = { ...userData };
			delete newData.createdAt;
			delete newData.updatedAt;

			setUserData(newData);
			setVisible(true);
			setModalStep(2);
			saveDataSessionStorage({ key: 'UserData', data: newData });

			predefinedFill(newData, handleClosePopup, {
				setSelectedBillingIndex,
				setSelectedShippingIndex,
				setSelectedDeliveryPointIndex,
				setSameDeliveryAddress,
				setPickupPointDelivery,
				isUserLoggedIn
			});
		};

		const handleRejectedResponse = () => {
			setVisible(true);
			setModalStep("rejected");
		};

		const handleRetry = () => {
			setTimeout(() => setCounter((prev) => prev + 1), 1000);
		};

		middlewareApi({
			endpoint: "checkout/checkIfSubmitEmailPushNotificationWasConfirmed",
			method: 'POST',
			requestBody: { "email": simplyInput.trim().toLowerCase(), "notificationTokenId": notificationTokenId }
		})
			.then(handleApiResponse)
			.catch(error => {
				console.error('Error checking login status:', error);
			});
	}, [notificationTokenId, counter]);


	useEffect(() => {
		setVisible(false)
		setSelectedBillingIndex(0)
		setSelectedShippingIndex(null)
		setSelectedDeliveryPointIndex(null)
		setNotificationTokenId("")

		if (!authToken && isSimplyIdVisible) {

			const debouncedRequest = debounce(() => {
				if (isValidEmail(simplyInput.trim().toLowerCase())) {
				middlewareApi({
					endpoint: "checkout/submitEmail",
					method: 'POST',
					requestBody: { "email": simplyInput?.trim().toLowerCase() || "", language: shortLang(i18n.language) }
				}).then(({ data: phoneNumber, userUsedPushNotifications, notificationTokenId }) => {

					if (userUsedPushNotifications) {
						setDownloadIconsAllowed(false)
					}
					setPhoneNumber(phoneNumber)
					saveDataSessionStorage({ key: 'phoneNumber', data: phoneNumber })
					setVisible(true)
					setLoginType(userUsedPushNotifications ? "app" : "pinCode")
					if (userUsedPushNotifications) {
						setNotificationTokenId(notificationTokenId)
					}
				}).catch((err) => {
					console.log(err);
				})
				}
			}, 500);

			debouncedRequest();
			return () => {
				debouncedRequest.cancel();
			};

		}

	}, [simplyInput, isSimplyIdVisible, isUserLoggedIn]);
	// }, [simplyInput, isSimplyIdVisible, isSimplyModalSelected, isUserLoggedIn]);


	useEffect(() => {

		setVisible(false)
		setSelectedBillingIndex(0)
		setSelectedShippingIndex(null)
		setSelectedDeliveryPointIndex(null)


		if (!isSimplyModalSelected && !authToken && !isSimplyIdVisible) {

			const debouncedRequest = debounce(() => {
				if (isValidEmail(simplyInput.trim().toLowerCase())) {
				middlewareApi({
					endpoint: "checkout/submitEmail",
					method: 'POST',
					requestBody: { "email": simplyInput?.trim().toLowerCase() || "", language: shortLang(i18n.language) }
				}).then(({ data: phoneNumber, userUsedPushNotifications, notificationTokenId }) => {

					setPhoneNumber(phoneNumber)
					saveDataSessionStorage({ key: 'phoneNumber', data: phoneNumber })
					setVisible(true)
					setLoginType(userUsedPushNotifications ? "app" : "pinCode")
					if (userUsedPushNotifications) {
						setNotificationTokenId(notificationTokenId)
					}

				}).catch((err) => {
					console.log(err);
				})
				}
			}, 500);

			debouncedRequest();
			return () => {
				debouncedRequest.cancel();
			};

		}

	}, []);

	useInsertFormData(userData, listOfCountries)

	useEffect(() => {
		setUserData(JSON.parse(sessionStorage.getItem("UserData") as string))
	}, [])


	const providerProps = useMemo(() => {
		return {
			selectedBillingIndex,
			setSelectedBillingIndex,
			selectedShippingIndex,
			setSelectedShippingIndex,
			sameDeliveryAddress,
			setSameDeliveryAddress,
			selectedDeliveryPointIndex,
			setSelectedDeliveryPointIndex,
			pickupPointDelivery,
			setPickupPointDelivery,
			selectedTab,
			setSelectedTab,
			deliveryType,
			setDeliveryType,
			downloadIconsAllowed
		}
	}, [selectedBillingIndex,
		setSelectedBillingIndex,
		selectedShippingIndex,
		setSelectedShippingIndex,
		sameDeliveryAddress,
		setSameDeliveryAddress,
		selectedDeliveryPointIndex,
		setSelectedDeliveryPointIndex,
		pickupPointDelivery,
		setPickupPointDelivery,
		selectedTab,
		setSelectedTab,
		deliveryType,
		setDeliveryType,
		downloadIconsAllowed])

	const counterProps = useMemo(() => {
		return {
			countdown,
			setCountdown,
			countdownError,
			setCountdownError,
			errorPinCode,
			setErrorPinCode,
			modalError,
			setModalError,
			countdownTime,
			setCountdownTime,
			countdownTimeError,
			setCountdownTimeError
		}
	}, [countdown,
		setCountdown,
		countdownError,
		setCountdownError,
		errorPinCode,
		setErrorPinCode,
		modalError,
		setModalError,
		countdownTime,
		setCountdownTime,
		countdownTimeError,
		setCountdownTimeError])
	return (

		<ApiContext.Provider value={{ authToken, setAuthToken }}>
			<SelectedDataContext.Provider value={providerProps}>
				<CounterContext.Provider value={counterProps}>
				<SimplyIn className="REACT_APP">

					{!isUserLoggedIn && <SimplyinContainer>
						<input 
							{...attributeObject}
							value={simplyInput}
							onChange={handleSimplyInputChange}
							ref={myRef as any}
							type="email"

						></input>


						{phoneNumber && <SimplyinSmsPopupOpenerIcon onClick={handleOpenSmsPopup} simplyinToken={authToken} />}
					</SimplyinContainer>}

					{!isUserLoggedIn && phoneNumber && isSimplyIdVisible && <PinCodeModal
						simplyInput={simplyInput}
						setToken={setAuthToken}
						phoneNumber={phoneNumber}
						visible={visible}
						setVisible={setVisible}
						userData={userData}
						setUserData={setUserData}
						loginType={loginType}
						modalStep={modalStep}
						setModalStep={setModalStep}
							setLoginType={setLoginType}
							setNotificationTokenId={setNotificationTokenId}
					/>}

					{!isSimplyModalSelected && isUserLoggedIn && phoneNumber && <PinCodeModal
						modalStep={modalStep}
						setModalStep={setModalStep}
						render={true}
						simplyInput={simplyInput}
						setToken={setAuthToken}
						phoneNumber={phoneNumber}
						visible={visible}
						setVisible={setVisible}
						userData={userData}
						setUserData={setUserData}
						loginType={loginType}
							setLoginType={setLoginType}
							setNotificationTokenId={setNotificationTokenId}
					/>}

				</SimplyIn >
				</CounterContext.Provider>
			</SelectedDataContext.Provider>
		</ApiContext.Provider>
	);
};


export default SimplyID