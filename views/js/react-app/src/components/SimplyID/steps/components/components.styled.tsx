import Autocomplete from '@material-ui/lab/Autocomplete';
import { RadioGroup, TextField } from '@mui/material';
import styled from 'styled-components';



export const StyledSearchField = styled(Autocomplete)`
	display: flex;
	margin-bottom: 16px;

	fieldset {
		border-color: rgb(217, 217, 217)
	}

`


export const StyledAddressSearchContainer = styled.div`
	padding: 12px 16px;

`
export const StyledRadioContainer = styled.div`


`


export const StyledTextField = styled(TextField)`
	fieldset {
		border-color: rgb(217, 217, 217)
	}
`

export const RadioElementContainerSelectMachine = styled.div`
	width: 100%;
	gap: 12px;
	display: flex;
	flex-direction:row;
	justify-content: space-between;
	align-items: center;
	label {
		display: flex;
		gap: 20px;
		margin-left: 10px;
	}
`

export const StyledRadioGroupSelectMachine = styled(RadioGroup)`
	display:flex;
	flex-direction: column;
	gap:12px;

`