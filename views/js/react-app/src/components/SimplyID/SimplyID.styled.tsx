import styled from "styled-components";
import { Box } from "@mui/material";


export const SimplyIn = styled.div`
`

export const SimplyinContainer = styled.div`
display:flex;
justify-content: center;
align-items: center;
gap: 20px;
& svg{
	cursor: pointer;
}`


export const PopupContainer = styled.div`
padding: 8px 16px 8px 16px;
z-index:1000;
`;
export const CloseContainer = styled.div`
cursor: pointer;`

export const PopupHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: sticky;
  padding: 16px 16px 0;
  background: white;
  top:-1px;
  z-index:10;
  /* border-bottom: 1px solid #F1F7FF; */
`;

export const PopupTitle = styled.div`
  display: flex;
  justify-content: center;
  font-family: Inter, sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
  margin: 30px auto 12px;
`;
export const PopupSimplyinLogo = styled.label`
  color: #3167b9;
  font-family: Doppio One, sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 145%;
  letter-spacing: 0.2em;
`;
export const Step2Title = styled.label`
  color: #000;
  font-family: Inter, sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 24px;
  line-height: 125%;
  position:relative;

`;

export const SectionTitle = styled.div`
font-family: Inter, sans-serif;
font-weight: 600;
font-size: 18px;
`

export const PopupTextMain = styled.div`
  display: flex;
  justify-content: center;
  font-family: Inter, sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 23px;
  margin: 12px auto;
  text-align:center;

`;
export const PopupTextSecondary = styled.div`
  display: flex;
  justify-content: center;
  font-family: Inter, sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  color: #757575;
  margin-top: 24px;
`;
export const PopupCodeNotDelivered = styled(PopupTextSecondary) <{ color?: string, marginTop?: string }>`
  margin-bottom: 4px;
  color: ${props => props?.color || "#000"};
  margin-top: ${props => props?.marginTop || "16px"};
`;

export const PopupSendAgain = styled(PopupTextSecondary) <{ disabled?: boolean }>`
	color: #000;
	margin-top: 0;
		#send-again-btn, #send-again-email-btn{
		font-family: Inter, sans-serif;
		padding: 0;
		border-radius: 0;
		background-color: transparent;
		color: ${props => props?.disabled ? "#ADC2E3" : "rgb(25, 118, 210)"};
		text-transform: none;
		font-size: 14px;
		font-weight: 400;
		text-transform: none;
	}
`;

export const PinInputContainer = styled.div`
display: flex;
justify-content: center;
align-items: center;
margin: 24px 0px;
flex-direction:column;
& div > div {
	display: flex;
    justify-content: center;
    gap: 12px;
}
& > div {
	display: flex;
	flex-direction:row;
    justify-content: center;
    gap: 12px;
}
& form > div {
	display: flex;
	flex-direction:row;
    justify-content: center;
    gap: 12px;
}
`;
export const PopupCountDownContainer = styled.div<{ color?: string }>`
	display: flex;
	flex-direction:column;
	justify-content: center;
	align-items: center;
	color: ${props => props?.color || "inherit"};
`

export const MobileSystemsLinksContainer = styled.div`
display: flex;
flex-direction:row;
justify-content: center;
align-items: center;
gap:60px;
margin-top:14px;
`
export const SingleSystemLink = styled.a`
display: flex;
flex-direction:row;
justify-content: space-between;
align-items: center;
color:#3167B9;
gap:6px;
font-size:14px;
text-decoration:none;
cursor:pointer;`



export const ButtonsContainer = styled.div`
width: 100%;
display: flex;
flex-direction:row;
gap: 20px;
justify-content: center;
align-items: center;
`
export const RadioElementContainer = styled.div`
width: 100%;
gap: 12px;

display: flex;
flex-direction:row;
justify-content: space-between;
align-items: center;
margin-bottom:20px;`

export const DataValueContainer = styled.div`
display: flex;
flex-direction:column;
font-family: Inter, sans-serif;
align-items: flex-start;
`
export const DataValueTitle = styled.div`
text-align:left;
font-size: 16px;
font-weight: 700;
`
export const DataValueLabel = styled.div`

font-size: 16px;
font-weight: 400;
text-align:left;
`


export const AddNewData = styled.div`
font-family: Inter, sans-serif;
font-size: 16px;
font-weight: 700;
color:#3167B9;
cursor: pointer;
display: flex;
flex-direction: row;
gap: 6px;
margin-bottom: 14px;
`
export const AddNewDataText = styled.div`
align-items: center;
`
export const NoDataLabel = styled.div`
font-family: Inter, sans-serif;
font-size: 16px;
`

export const EditFormTitle = styled.div`
font-family: Inter, sans-serif;
font-size: 18px;
font-weight: 600;
margin-bottom: 20px;
`

export const EditFormLabel = styled.div`
font-family: Inter, sans-serif;
font-size: 18px;
font-weight: 600;
color: #3167B9;
text-decoration: underline;
margin-bottom: 16px
`
export const DeleteItemTitle = styled.div`
font-family: Inter, sans-serif;
font-size: 20px;
font-weight: 600;
`
export const DeleteItemText = styled.div`
font-family: Inter, sans-serif;
font-size: 16px;
font-weight: 400;
`

export const StyledBox = styled(Box)`
  overflow-y: auto;
  max-height: 90%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1); 
  border-radius: 12px;
  background-color: white;
  width:90vw;
  max-width: 650px;
  transition: max-width 0.3s ease, max-height 0.3s ease, height 0.3s ease;
  &:focus{
	outline:none;
  }
`;


export const HorizontalLine = styled.hr`
color: "#D9D9D9";
`

export const CounterSpan = styled.span`
	 font-family: Inter, sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
`