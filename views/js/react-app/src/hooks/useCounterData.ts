import { useState } from 'react';

export const useCounterData = () => {

	const [countdown, setCountdown] = useState<boolean>(false)
	const [countdownError, setCountdownError] = useState<boolean>(false)
	const [errorPinCode, setErrorPinCode] = useState<string>("")
	const [modalError, setModalError] = useState("")
	const [countdownTime, setCountdownTime] = useState<number>(0)
	const [countdownTimeError, setCountdownTimeError] = useState<number>(0)

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
	};
} 