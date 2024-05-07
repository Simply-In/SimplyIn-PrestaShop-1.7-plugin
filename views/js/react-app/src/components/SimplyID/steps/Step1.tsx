import { useContext, useEffect, useState } from 'react'
import { PopupTitle, PopupTextMain, PinInputContainer, PopupTextSecondary, PopupCountDownContainer, PopupCodeNotDelivered, PopupSendAgain, CounterSpan } from '../SimplyID.styled'
import { middlewareApi } from '../../../services/middlewareApi'
import { PopupTextError } from '../../PhoneField/PhoneField.styled'
import { removeDataSessionStorage, saveDataSessionStorage } from '../../../services/sessionStorageApi'
import { CounterContext, SelectedDataContext, TypedLoginType } from '../SimplyID'
import { OtpInput as OtpInputReactJS } from 'reactjs-otp-input'
import { Link } from '@mui/material'
import Countdown from 'react-countdown'
import { useTranslation } from "react-i18next";
// import { AndroidIcon } from '../../../assets/AndroidIcon'
// import { IosIcon } from '../../../assets/IosIcon'
import { predefinedFill } from './functions'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore

// const isUserLoggedIn = customer?.logged === true && customer?.is_guest !== "1";

export const getLangBrowser = () => {
	if (navigator.languages !== undefined) return navigator.languages[0];
	else return navigator.language;
};

const shortLang = (lang: string) => lang.substring(0, 2).toUpperCase();

const countdownRenderer = ({ formatted: { minutes, seconds } }: any) => {
	return <CounterSpan>{minutes}:{seconds}</CounterSpan>;
};
const countdownTimeSeconds = 30
interface IStep1 {
	handleClosePopup: () => void;
	phoneNumber: string;
	setModalStep: (arg: number) => void;
	setUserData: any
	setToken: any
	simplyInput: string
	loginType: TypedLoginType
	setLoginType: any
	setNotificationTokenId: any


}

export const Step1 = ({ handleClosePopup, phoneNumber, setModalStep, setUserData, setToken, simplyInput, loginType, setLoginType, setNotificationTokenId }: IStep1) => {
	const { t, i18n } = useTranslation();



	const [pinCode, setPinCode] = useState('');
	const [codeByEmail, setCodeByEmail] = useState(false)
	const [isCodeResended, setIsCodeResended] = useState(false)
	const {
		setSelectedBillingIndex,
		setSelectedShippingIndex,
		setSelectedDeliveryPointIndex,
		setSameDeliveryAddress,
		setPickupPointDelivery,
		isUserLoggedIn,
		sameDeliveryAddress
	} = useContext(SelectedDataContext)
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
	} = useContext(CounterContext)


	const handlePinComplete = (value: string) => {
		middlewareApi({
			endpoint: "checkout/submitCheckoutCode",
			method: 'POST',
			requestBody: {
				"code": value,
				email: simplyInput,
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-ignore
				lng: shortLang(getLangBrowser()) ?? currentLanguage?.iso_code.toUpperCase(),

			}
		}).then(res => {
			removeDataSessionStorage({ key: 'customChanges' })
			setModalError("")
			setErrorPinCode("")

			if (res?.code === "TOO_MANY_REQUESTS") {
				const match = res?.message.match(/\d+/);

				// Check if a number is found
				if (match) {
					const number = match[0] || undefined;


					if (number && typeof (+number) === "number") {
						setCountdownTimeError(Date.now() + +number * 1000)
						setCountdownError(true)
						setErrorPinCode(res?.message.replace(match[0], "").trim(""))
					}
					return
				}
			}
			if (res?.isCodeValid === false) {
				setModalError(t('modal-step-1.codeInvalid'))
				throw new Error(res?.message)

			} else if (res?.data) {
				if (res.data?.language) {
					i18n.changeLanguage(res.data?.language.toLowerCase())
				}


				removeDataSessionStorage({ key: 'delivery-address' })
				removeDataSessionStorage({ key: 'invoice-address' })
				removeDataSessionStorage({ key: "selectedShippingMethod" })

				setModalStep(2)

				setUserData({ ...res.data })

				saveDataSessionStorage({ key: 'UserData', data: res.data })

				sessionStorage.setItem("simplyinToken", res.authToken);

				setToken(res?.authToken)

				predefinedFill(res?.data, handleClosePopup, {
					setSelectedBillingIndex,
					setSelectedShippingIndex,
					setSelectedDeliveryPointIndex,
					setSameDeliveryAddress,
					setPickupPointDelivery,
					isUserLoggedIn,
					sameDeliveryAddress
				},
				)


			}
		});
	};


	useEffect(() => {
		if (pinCode?.length > 3) {
			handlePinComplete(pinCode)
		}
		setModalError("")

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pinCode])


	useEffect(() => {

		const inputElement = document.querySelectorAll('#OTPForm input') as NodeListOf<HTMLInputElement>

		if (inputElement[0]) {
			inputElement[0].blur();
			setTimeout(() => {
				inputElement[0].focus()
			}, 300)
		}

		inputElement.forEach((el) => {
			el.pattern = "\\d*"
			el.inputMode = "numeric"
			el.type = "text"
			el.ariaRequired = "false"
		})


	}, [phoneNumber])

	type sendPinAgainMethodType = "sms" | "email"


	const handleSendPinAgain = ({ method }: { method: sendPinAgainMethodType }) => {
		setLoginType("pinCode")
		setNotificationTokenId("")
		setCountdown(true)
		setCountdownTime(Date.now() + countdownTimeSeconds * 1000)
		setPinCode("")
		setIsCodeResended(true)
		if (method === "email") {
			setCodeByEmail(true)
		middlewareApi({
			endpoint: "checkout/resend-checkout-code-via-email",
			method: 'POST',
			requestBody: { "email": simplyInput }
		}).catch((err) => {
			console.log(err);
		})
		}
		if (method === "sms") {
			setCodeByEmail(false)
			middlewareApi({
				endpoint: "checkout/submitEmail",
				method: 'POST',
				requestBody: { "email": simplyInput.trim().toLowerCase(), forceSms: true }

			}).catch((err) => {

			console.log(err);

		})
		}
	}
	const handleCountdownCompleted = () => {
		setCountdown(false)
	}

	const handleCountdownErrorCompleted = () => {
		setCountdownError(false)
		setErrorPinCode("")
	}
	return (
		<>
			<PopupTitle style={{ margin: loginType === "pinCode" ? "inherit" : "4px auto 12px" }}>	{t('modal-step-1.confirm')}</PopupTitle>
			{loginType === "pinCode" &&
				<>
				<PopupTextMain> {codeByEmail ? t('modal-step-1.insertCodeEmail') : t('modal-step-1.insertCode')} </PopupTextMain>
				<PopupTextMain> {codeByEmail ? simplyInput : phoneNumber} </PopupTextMain>

				<PinInputContainer  >


					<div>
						<form id="OTPForm">
							<OtpInputReactJS
								value={pinCode}
								onChange={setPinCode}
								numInputs={4}
								isDisabled={countdownError ? true : false}
								inputStyle={{
									width: "40px",
									height: "56px",
									border: modalError ? "1px solid red" : countdownError ? "1px solid #FFD3D3" : "1px solid #D9D9D9",
									borderRadius: "8px",
									fontSize: "30px",
									textAlign: "center",
									padding: 0,
									outlineWidth: "0px",

								}}
								isInputNum={true}
								shouldAutoFocus={true}
								renderInput={
									(props: any, id: any) =>
										<input
											{...props}
											type="number"
											pattern="\d*"
											autoComplete='one-time-code'
											id={`otp-input-${id + 1}`}
											inputMode='numeric' />}
								inputType='numeric'
								inputMode='numeric'
								pattern="\d*"
							/>
						</form>
					</div>

					</PinInputContainer>
				{countdownError ?
					<PopupCountDownContainer color={"#E52424"}>
						<PopupCodeNotDelivered color={"#E52424"} marginTop='0px'>
							{errorPinCode}
						</PopupCodeNotDelivered>
						<Countdown
							daysInHours={false}
							renderer={countdownRenderer}
							zeroPadTime={2}
							zeroPadDays={2}
							date={countdownTimeError}
							onComplete={handleCountdownErrorCompleted}
						/>
					</PopupCountDownContainer>
					:
					null}


				</>
			}


			{loginType === "app" &&

				<PopupTextMain>
					{t('modal-step-1.checkInApp')}
				</PopupTextMain>

			}
			{modalError &&
				<PopupTextError >
					{modalError}
				</PopupTextError>
			}
			<PopupTextSecondary style={{ paddingBottom: loginType === "app" ? '24px' : "inherit" }}>
				{t('modal-step-1.editAfterLogin')}
			</PopupTextSecondary>

			<> {
				(countdown) ?

					<PopupCountDownContainer color={"#E52424"}>
						<PopupCodeNotDelivered color={"#E52424"} marginTop='0px'>
							{loginType === "app" ? t('modal-step-1.codeHasBeenSent') : t('modal-step-1.codeHasBeenSentAgain')}
						</PopupCodeNotDelivered>

						<Countdown daysInHours={false} renderer={countdownRenderer} zeroPadTime={2} zeroPadDays={2}
							date={countdownTime} onComplete={handleCountdownCompleted} /></PopupCountDownContainer>

					:
					<div>
						<PopupCodeNotDelivered>
							{loginType === "app" ? t('modal-step-1.noAccessToMobile') : t('modal-step-1.codeNotArrived')}
						</PopupCodeNotDelivered>

						{!isCodeResended ?
							<PopupSendAgain disabled={!!countdownError}>
								<Link
									disabled={!!countdownError}
									component="button"
									id="send-again-btn"
									underline={countdownError ? "none" : "hover"}
									onClick={() => handleSendPinAgain({ method: "sms" })}
								>
									{loginType === "app" ? t('modal-step-1.sendViaSMS') : t('modal-step-1.sendAgain')}
								</Link>
								&nbsp; {t('modal-step-1.or')} &nbsp;
								<Link
									disabled={!!countdownError}
									component="button"
									id="send-again-email-btn"
									value="mail"
									onClick={() => handleSendPinAgain({ method: "email" })}
									underline={countdownError ? "none" : "hover"}
								>
									{t('modal-step-1.sendViaEmail')}
								</Link>
							</PopupSendAgain>
							:

							<>
								{
									codeByEmail
										?

										<PopupSendAgain disabled={!!countdownError}>
											<Link
												disabled={!!countdownError}
												component="button"
												id="send-again-btn"
												underline={countdownError ? "none" : "hover"}
												onClick={() => handleSendPinAgain({ method: "email" })}
											>
												{t('modal-step-1.sendAgain')}
											</Link>
											&nbsp; {t('modal-step-1.or')} &nbsp;
											<Link
												disabled={!!countdownError}
												component="button"
												id="send-again-email-btn"
												value="mail"
												onClick={() => handleSendPinAgain({ method: "sms" })}
												underline={countdownError ? "none" : "hover"}
											>
												{t('modal-step-1.sendViaSMS')}
											</Link>
										</PopupSendAgain>
										:
										<PopupSendAgain disabled={!!countdownError}>
											<Link
												disabled={!!countdownError}
												component="button"
												id="send-again-btn"
												underline={countdownError ? "none" : "hover"}
												onClick={() => handleSendPinAgain({ method: "sms" })}
											>
												{t('modal-step-1.sendAgain')}
											</Link>
											&nbsp; {t('modal-step-1.or')} &nbsp;
											<Link
												disabled={!!countdownError}
												component="button"
												id="send-again-email-btn"
												value="mail"
												onClick={() => handleSendPinAgain({ method: "email" })}
												underline={countdownError ? "none" : "hover"}
											>
												{t('modal-step-1.sendViaEmail')}
											</Link>
										</PopupSendAgain>	


								}





							</>
						}



					</div>
			}</>
			{/* {loginType === "pinCode" &&
				<>
					<Divider style={{ marginTop: 24, marginBottom: 12 }} />
					<PopupTextSecondary>
						Loguj się za pomocą aplikacji. Pobierz teraz.
					</PopupTextSecondary>
					<MobileSystemsLinksContainer>
						<SingleSystemLink href='#'><AndroidIcon />Android</SingleSystemLink>
						<SingleSystemLink href='#'><IosIcon />iOS</SingleSystemLink>
					</MobileSystemsLinksContainer>
				</>} */}
		</>
	)
}

export default Step1