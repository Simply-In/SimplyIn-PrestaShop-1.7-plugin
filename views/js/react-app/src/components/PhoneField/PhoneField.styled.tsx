import styled from "styled-components";

export const CheckboxContainer = styled.div`
	display:flex;
	margin-bottom:12px;`

export const CheckboxLabel = styled.div`
cursor: pointer;
	font-size: 20px;
	font-family: Inter, sans-serif;
	& span{
		font-weight:700;
		font-family: Inter, sans-serif;
	}
`
export const PhoneInputDescription = styled.div`
	font-size: 16px;
	font-family: Inter, sans-serif;
	color: #000000;
	margin-bottom: 12px;
	margin-top: 12px;
`
export const PhoneInputDescriptionLink = styled.a`
	text-decoration:none;
	color: #3167B9 !important;
`
export const PhoneInputDescriptionSecondary = styled.div`
font-size: 14px;
font-family: Inter, sans-serif;
color: #707070 !important;
`
export const StyledInput = styled.input`
border-radius: 20px;
border: 1px solid #2d9fd9;
padding-top:12px;
padding-bottom:12px;
`
export const PopupTextError = styled.div`
display: flex;
justify-content: center;
font-family: Inter, sans-serif;
font-style: normal;
font-weight: 400;
font-size: 14px;
line-height: 20px;
text-align: center;
color: red;
margin-top: 24px;`
