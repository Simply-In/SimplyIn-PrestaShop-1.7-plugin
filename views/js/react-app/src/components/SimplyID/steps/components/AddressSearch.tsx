import TextField from '@material-ui/core/TextField';
import { debounce } from 'lodash';
import { useContext, useEffect, useState } from 'react';

import { RadioElementContainerSelectMachine, StyledAddressSearchContainer, StyledRadioContainer, StyledRadioGroupSelectMachine, StyledSearchField } from './components.styled';
import { FormControlLabel, Radio } from '@mui/material';

import { DataValueContainer, DataValueTitle, DataValueLabel, NoDataLabel } from '../../SimplyID.styled';

import NoData from '../../../../assets/NoData.svg';

import { useTranslation } from 'react-i18next';
import { ApiContext } from '../../SimplyID';
import { getPlaceholder } from '../functions';
import { middlewareApi } from '../../../../services/middlewareApi';



interface IAddressSearch {
	setLockerIdValue: any
	setValue: any
	setAdditionalInfo: any
	addressNameRef: any
}

export const AddressSearch = ({
	setLockerIdValue,
	setValue,
	setAdditionalInfo,
	addressNameRef }:
	IAddressSearch) => {
	const { authToken } = useContext(ApiContext);

	const { t } = useTranslation();
	const [searchInput, setSearchInput] = useState<string>('');
	const [addressOptions, setAddressOptions] = useState<any[]>([]);
	const [selectedValue, setSelectedValue] = useState<any>(null);
	const [machineData, setMachineData] = useState<any[]>([])

	const handleChangeSearchInput = (_: any, val: string) => {
		setSearchInput(val)
	}

	const getAddress = debounce(() => {
		middlewareApi({
			endpoint: "addresses/find",
			method: 'POST',
			requestBody: {
				"searchAddressBy": searchInput,
				token: authToken
			},
			token: authToken
		}).then((res) => {
			setAddressOptions(res?.data || []);
		})
			.catch((error) => {
				console.error("Error fetching address:", error);
			});

	}, 300);


	useEffect(() => {
		setMachineData([])
		getAddress();
		return () => getAddress.cancel();
	}, [searchInput]);


	const handleAutocompleteChange = (_: any, val: any) => {
		setSelectedValue(val)

		middlewareApi({
			endpoint: "parcelLockers/getClosest",
			method: 'POST',
			requestBody: {
				lng: val?.geometry?.location?.lng,
				lat: val?.geometry?.location?.lat,
				token: authToken

			},
			token: authToken
		}).then((res) => {

			setMachineData(res.data)
		})
	}

	const handleChangeMachine = (e: any) => {

		const selectedPoint = machineData[e.target.value]
		setLockerIdValue(selectedPoint?.locker?.lockerId || "")
		setValue("lockerId", selectedPoint.locker?.lockerId || "")
		setValue('address', selectedPoint?.locker?.address || "")
		setValue('label', selectedPoint?.info?.provider?.name || "")
		setValue('logoUrl', selectedPoint?.info?.provider?.logoUrl || "")
		setAdditionalInfo(selectedPoint?.locker?.desc || "")

		if (addressNameRef?.current) {

			const inputElement = addressNameRef.current?.querySelector('input');

			if (inputElement) {
				inputElement.focus();
				const containerElement = document.getElementById('containerSimply');
				if (containerElement) {


					setTimeout(() => containerElement.scrollTo({
						top: document.body.scrollHeight,
						behavior: 'smooth',
					}), 50)
				}
			}
		}



	}

	return (
		<StyledAddressSearchContainer>
			{/* mui v4 on purpose, v5 is not working */}
			<StyledSearchField
				freeSolo
				id="addressSearchInput"
				value={selectedValue}
				onChange={handleAutocompleteChange}
				inputValue={searchInput}
				//filterOptions is a fix for not refreshing results bug
				filterOptions={x => x}
				onInputChange={handleChangeSearchInput}
				options={addressOptions}
				getOptionLabel={(option: any) => option?.formatted_address}
				renderInput={(params) => <TextField {...params} label={t('modal-form.searchAddress')} variant="outlined" />}
			/>

			<StyledRadioContainer >
				<StyledRadioGroupSelectMachine
					aria-labelledby="demo-radio-buttons-group-label"
					name="radio-buttons-group"
					onChange={handleChangeMachine}
				>
					{machineData?.filter(Boolean)?.slice(0, 5).length
						?
						machineData?.filter(Boolean)?.slice(0, 5)?.map((machine: any, index: number) => {
							return (
								<RadioElementContainerSelectMachine key={index}>
									<FormControlLabel value={index} control={<Radio />}
										label={
											<div style={{ display: "flex" }}>

												<div className="logo"
													style={{
														display: "flex",
														justifyContent: "center",
														alignItems: "center",
														minWidth: "50px",
														width: "50px",
														marginRight: "8px"
													}}>
													<img src={machine?.info?.provider?.logoUrl || getPlaceholder()} alt={machine?.info?.provider?.name || ""} style={{
														width: '42px',
														height: '42px'
													}} />
												</div>
												<DataValueContainer>
													<DataValueTitle>{machine?.locker?.lockerId || ""}</DataValueTitle>
													<DataValueLabel>{machine?.locker?.address || ""}</DataValueLabel>
													<DataValueLabel>{t('modal-form.distance')}: {Math.floor(machine?.info.distance * 1000) + "m" || "-"}</DataValueLabel>
												</DataValueContainer>
											</div>
										} style={{ marginBottom: 0 }} />

								</RadioElementContainerSelectMachine>)

						})
						:
						<div style={{
							width: "100%",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							flexDirection: "column"
						}}>
							<div className="logo"
								style={{
									display: "flex",
									flexDirection: "column",
									justifyContent: "center",

									marginRight: "8px",
									alignItems: "center"
								}}>
								{/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
								//@ts-ignore */}
								<img src={`${files_url}/views/js/react-app/dist/${NoData}`} alt="Brak danych" style={{
									width: '90%',
									height: 'auto'
								}} />
								<NoDataLabel style={{ color: "#707070", fontSize: 14, fontWeight: 600 }}>{t('modal-form.noPointFound')}</NoDataLabel>
							</div>
						</div>
					}
				</StyledRadioGroupSelectMachine>
			</StyledRadioContainer>
		</StyledAddressSearchContainer>
	)
}
