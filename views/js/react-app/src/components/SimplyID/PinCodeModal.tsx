import { useState, useEffect } from 'react'
import Modal from '@mui/material/Modal';
import Step1 from './steps/Step1'
import Step2 from './steps/Step2';
import { CloseContainer, PopupContainer, PopupHeader, StyledBox } from './SimplyID.styled';

import { CloseIcon } from '../../assets/CloseIcon';
import { SimplyinSmsPopupOpenerIcon } from '../../assets/SimplyinSmsPopupOpenerIcon';
import { saveDataSessionStorage } from '../../services/sessionStorageApi';
import { TypedLoginType } from './SimplyID';
import { StepRejected } from './steps/StepRejected';


interface IPinCodePopup {
	phoneNumber: string
	visible: boolean
	setVisible: (arg: boolean) => void
	setToken: any,
	simplyInput: string,
	userData: any,
	setUserData: any
	render?: boolean
	loginType: TypedLoginType,
	modalStep: any,
	setModalStep: any
	setLoginType: any
	setNotificationTokenId: any
}



export const PinCodeModal = ({ phoneNumber, visible, setVisible, setToken, simplyInput, userData, setUserData, render, loginType, modalStep, setModalStep, setLoginType, setNotificationTokenId }: IPinCodePopup) => {

	const [editItemIndex, setEditItemIndex] = useState<{ property: string, itemIndex: number, isNewData?: boolean } | null>(null)

	useEffect(() => {
		setToken("")
		setUserData({})
		setModalStep(1)
	}, [simplyInput])


	useEffect(() => {
		setModalStep(1)
	}, [phoneNumber])

	useEffect(() => {
		const UserDataFromStorage = sessionStorage.getItem("UserData") ? JSON.parse(sessionStorage.getItem("UserData") || "") : null
		setUserData(UserDataFromStorage)
		if (UserDataFromStorage) {
			setModalStep(2)
		}
		setToken(sessionStorage.getItem("simplyinToken"))
	}, [])

	const handleClosePopup = () => {
		setVisible(false)
		saveDataSessionStorage({ key: 'isSimplyDataSelected', data: true })
	}

	const emailInput = document.getElementById("field-email")

	function checkVisible(elm: any) {
		if (render) return true
		const rect = elm.getBoundingClientRect();
		const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
		return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
	}


	return (<>
		{checkVisible(emailInput) && <Modal
			open={visible}
			onClose={() => setVisible(false)}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
		>
			<StyledBox id="containerSimply"
				style={{ maxWidth: editItemIndex?.property === "parcelLockers" ? "650px" : "400px" }}
			>
					<PopupHeader>

						<SimplyinSmsPopupOpenerIcon style={{ marginBottom: "20px" }} />
						<CloseContainer onClick={handleClosePopup}>
							<CloseIcon />
						</CloseContainer>
					</PopupHeader>
				<PopupContainer style={{ margin: "8px 16px 16px" }}>
					{modalStep === 1 &&
						<Step1
							setToken={setToken}
							phoneNumber={phoneNumber}
							handleClosePopup={handleClosePopup}
							setModalStep={setModalStep}
						setUserData={setUserData}	
							simplyInput={simplyInput}
							loginType={loginType}
							setLoginType={setLoginType}
							setNotificationTokenId={setNotificationTokenId}
						/>}
					{modalStep === 2 &&
						<Step2
							handleClosePopup={handleClosePopup}
							userData={userData}
						setUserData={setUserData}
							editItemIndex={editItemIndex}
							setEditItemIndex={setEditItemIndex}

						/>}
					{modalStep === "rejected" &&
						<StepRejected							
						/>}
				</PopupContainer>
			</StyledBox>
		</Modal>
		}</>
	)
}

export default PinCodeModal
