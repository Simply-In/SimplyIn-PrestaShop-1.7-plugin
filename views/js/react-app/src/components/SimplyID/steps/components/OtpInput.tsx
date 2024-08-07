import { OtpInput as OtpInputReactJS } from 'reactjs-otp-input'

export const OtpInput = ({
	pinCode,
	setPinCode,
	countdownError,
	modalError }: any) => {
	return (
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
	)
}
