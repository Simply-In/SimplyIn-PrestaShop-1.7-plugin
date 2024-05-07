import { useContext, useEffect, useState } from 'react'
import { PopupHeader, Step2Title, SectionTitle, RadioElementContainer, DataValueContainer, DataValueLabel, DataValueTitle, AddNewData, AddNewDataText, NoDataLabel } from '../SimplyID.styled'
import { IconButton, CardContent, CardActions, Collapse, Button, FormControl, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IconButtonProps } from '@mui/material/IconButton';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import RadioGroup from '@mui/material/RadioGroup';
import { Step2Form } from './components/Step2Form';
import { styled } from '@mui/material/styles';
import { PlusIcon } from '../../../assets/PlusIcon';
import ContextMenu from '../ContextMenu';
import { SelectedDataContext } from '../SimplyID';
import { loadDataFromSessionStorage, removeDataSessionStorage, saveDataSessionStorage } from '../../../services/sessionStorageApi';
import axios from 'axios';
import { selectDeliveryMethod } from '../../../functions/selectDeliveryMethod';
import { getPlaceholder, isSameShippingAndBillingAddresses } from './functions';
import FormGroup from '@mui/material/FormGroup';
import Checkbox from '@mui/material/Checkbox';
import { useTranslation } from 'react-i18next';



// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const isUserLoggedIn = (customer?.logged === true && customer?.is_guest !== "1")

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const listOfCountries = Object.keys(countries_list).map((key) => countries_list[key]).sort((a, b) => a.name.localeCompare(b.name));



interface IAddress {
	addressName: string,
	name: string,
	surname: string,
	street: string,
	appartmentNumber?: string,
	city: string,
	postalCode: string,
	country: string,
	state?: string,
	companyName?: string,
	taxId?: string
}


export const handlePhpScript = (
	data: IAddress,
	addresNameId: "billingAddressesId" | "shippingAddressesId",
	isSameShippingAndBillingAddress: any,
	{
		selectedShippingIndex,
		userData,
		selectedBillingIndex,
		simplyInput
	}: any) => {

	console.log("handlePHPSCRIPT INSIDE", data);

	const shippingData = (selectedShippingIndex !== null && userData?.shippingAddresses?.length) ? userData?.shippingAddresses[selectedShippingIndex || 0] : null

	data.country = listOfCountries?.find((el: any) => el.iso_code === data?.country)?.id_country ?? 1

	if (!data.addressName) {
		data.addressName = `Adres ${addresNameId === "billingAddressesId" ? selectedBillingIndex + 1 : selectedShippingIndex + 1}`
	}

	const dataToSend = {
		email: simplyInput,
		addressData: data,
		use_same_address: addresNameId === "shippingAddressesId" ? 0 : 1
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore
	const baseUrl = base_url || '.'

	// return
	// axios.post('../modules/simplyin/api/createAddresses.php', { //stage
	axios.post(`${baseUrl}./modules/simplyin/api/createAddresses.php`, {	//dev
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		dataToSend
	})
		.then((response) => {
			saveDataSessionStorage({ key: addresNameId, data: response.data?.newAddressId })
			if (isSameShippingAndBillingAddress) {
				saveDataSessionStorage({ key: "shippingAddressesId", data: response.data?.newAddressId })
			}

			if (!shippingData) {
				saveDataSessionStorage({ key: "shippingAddressesId", data: response.data?.newAddressId })
			}
			if (response.data.status === 'success') {
				// Handle the success response
			} else {
				// Handle any errors
				console.error(response.data.message);
			}
		})
		.catch(error => {
			console.error('An error occurred:', error);
		});

}





interface IStep2 {
	handleClosePopup: () => void;
	userData: any
	setUserData: any,
	editItemIndex: any,
	setEditItemIndex: any,
}

interface ExpandMoreProps extends IconButtonProps {
	expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
	const { ...other } = props;
	return <IconButton {...other} />;
})(({ theme, expand }) => ({
	transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
	marginLeft: 'auto',
	transition: theme.transitions.create('transform', {
		duration: theme.transitions.duration.shortest,
	}),
}));



export const Step2 = ({ handleClosePopup, userData, setUserData, editItemIndex, setEditItemIndex }: IStep2) => {
	const { t } = useTranslation();


	const [expanded, setExpanded] = useState({
		billing: true,
		shipping: false,
		deliveryPoint: true
	});

	const {
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
		simplyInput
	} = useContext(SelectedDataContext)


	console.log({ selectedBillingIndex, selectedShippingIndex, sameDeliveryAddress });

	useEffect(() => {
		if (loadDataFromSessionStorage({ key: "ShippingIndex" })) {
			setSelectedShippingIndex(loadDataFromSessionStorage({ key: "ShippingIndex" }))
		}
		if (loadDataFromSessionStorage({ key: "BillingIndex" })) {
			setSelectedBillingIndex(loadDataFromSessionStorage({ key: "BillingIndex" }))
			setSameDeliveryAddress(false)
		}
		if (loadDataFromSessionStorage({ key: 'ParcelIndex' })) {
			setSelectedDeliveryPointIndex(loadDataFromSessionStorage({ key: 'ParcelIndex' }))
		}
	}, [])


	const handleExpandClick = (property: "billing" | "shipping" | "deliveryPoint", value?: boolean) => {


		setExpanded((prev) => {
			return ({ ...prev, [property]: value || !prev[property] })
		});
	};
	type DeliveryType = "address" | "machine"
	const [deliveryType, setDeliveryType] = useState<DeliveryType>("address");

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>, type: "billing" | "shipping" | "parcelLockers") => {
		if (type === "billing") {
			setSelectedBillingIndex(+(event.target as HTMLInputElement).value);
		}
		else if (type === "shipping") {

			setSelectedShippingIndex(+(event.target as HTMLInputElement).value);
			setSameDeliveryAddress(false)
		}
		else if (type === "parcelLockers") {
			setSelectedDeliveryPointIndex(+(event.target as HTMLInputElement).value);
			setPickupPointDelivery(true)
		}

	}



	const handleAddNewData = (property: "billingAddresses" | "shippingAddresses" | "parcelLockers") => {
		setEditItemIndex({ property: property, itemIndex: userData[property]?.length ? userData[property]?.length : 0, isNewData: true })
	}



	const handleSelectData = () => {

		removeDataSessionStorage({ key: "isBillingSelected" })
		removeDataSessionStorage({ key: "isDeliverySelected" })


		removeDataSessionStorage({ key: "selectedShippingMethod" })

		if (!userData?.billingAddresses[selectedBillingIndex]) {
			return
		}

		if (deliveryType === "address") {


			// resetDeliveryMethod()
			sessionStorage.setItem("BillingIndex", `${selectedBillingIndex}`)
			sessionStorage.setItem("ShippingIndex", `${selectedShippingIndex}`)
			sessionStorage.setItem("ParcelIndex", `null`)
			selectDeliveryMethod({ provider: "default" })
		} else {
			sessionStorage.setItem("BillingIndex", `${selectedBillingIndex}`)
			sessionStorage.setItem("ShippingIndex", `null`)
			sessionStorage.setItem("ParcelIndex", `${selectedDeliveryPointIndex}`)
			if (selectedDeliveryPointIndex !== undefined && userData?.parcelLockers[selectedDeliveryPointIndex]?.lockerId) {
				removeDataSessionStorage({ key: 'isParcelAdded' })
				selectDeliveryMethod({ deliveryPointID: userData?.parcelLockers[selectedDeliveryPointIndex]?.lockerId });
			}


		}

		saveDataSessionStorage({ key: 'isParcelAdded', data: false })
		removeDataSessionStorage({ key: 'delivery-address' })
		removeDataSessionStorage({ key: 'invoice-address' })
		removeDataSessionStorage({ key: 'inpost-delivery-point' })



		const billingData = userData?.billingAddresses[selectedBillingIndex || 0]
		const shippingData = (selectedShippingIndex !== null && userData?.shippingAddresses?.length) ? userData?.shippingAddresses[selectedShippingIndex || 0] : null

		let normalizedNumberFromDB = userData?.phoneNumber

		if (billingData?.country?.toLowerCase() == "PL".toLowerCase()) {
			if (userData?.phoneNumber?.startsWith("+48")) {
				normalizedNumberFromDB = normalizedNumberFromDB.substring(3)
			}
		}



		//if shipping and billing records are simillar then we don't need to generate by php shipping address
		const isSameBillingAndShippingAddresses = sameDeliveryAddress || isSameShippingAndBillingAddresses({ billingAddress: billingData, shippingAddress: shippingData })
		if (billingData) {
			handlePhpScript(
				{ ...billingData, phoneNumber: normalizedNumberFromDB || userData?.phoneNumber || "" },
				'billingAddressesId',
				isSameBillingAndShippingAddresses,
				{
					selectedShippingIndex,
					userData,
					selectedBillingIndex,
					simplyInput
				})
		}
		if (shippingData && !isSameBillingAndShippingAddresses) {
			handlePhpScript(
				{ ...shippingData, phoneNumber: normalizedNumberFromDB || userData?.phoneNumber || "" },
				'shippingAddressesId',
				false,
				{
					selectedShippingIndex,
					userData,
					selectedBillingIndex,
					simplyInput
				})
		} else {
			const billingAddressId = loadDataFromSessionStorage({ key: "billingAddressesId" })
			saveDataSessionStorage({ key: "shippingAddressesId", data: billingAddressId })
		}
		saveDataSessionStorage({ key: 'isSimplyDataSelected', data: true })

		handleClosePopup()

		if (isUserLoggedIn) {
			location.reload();
		}
	}


	const handleChangeShippingCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSameDeliveryAddress(() => {
			handleExpandClick("shipping", !event.target.checked)
			if (event.target.checked) {
				setSelectedShippingIndex(null)
				handleExpandClick("shipping", false)
			} else {
				setSelectedShippingIndex(0)
			}
			return (event.target.checked)
		});
	};





	const handleChangeDelivery = (event: React.ChangeEvent<HTMLInputElement>) => {
		setDeliveryType((event.target as HTMLInputElement).value as DeliveryType);

		if ((event.target as HTMLInputElement).value === "machine") {
			if (userData?.parcelLockers?.length && !selectedDeliveryPointIndex) {
				setSelectedDeliveryPointIndex(0)
				setPickupPointDelivery(true)
			}
		}
	};

	useEffect(() => {

		if (selectedDeliveryPointIndex !== null && selectedShippingIndex == null) {
			return setDeliveryType("machine")
		}
		setDeliveryType("address")
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])


	return (
		<>
			{!editItemIndex?.property &&
				<PopupHeader style={{ position: "relative", zIndex: 1, padding: 0, borderBottom: "none" }}>

					<Step2Title >
						{t('modal-step-2.selectData')}
					</Step2Title>
				</PopupHeader>
			}


			{!editItemIndex?.property && <>
				<CardActions disableSpacing sx={{ padding: 0 }}>
					<SectionTitle>{t('modal-step-2.billingData')}</SectionTitle>

					<ExpandMore
						expand={expanded.billing}
						onClick={() => handleExpandClick('billing')}
						aria-expanded={expanded.billing}
						aria-label="show more"
					>
						<ExpandMoreIcon />
					</ExpandMore>
				</CardActions>

				<Collapse in={!expanded.billing} timeout="auto" unmountOnExit>
					{userData?.billingAddresses?.length
						?
						<DataValueContainer style={{ padding: 8 }}>
							<DataValueTitle>
								{userData?.billingAddresses[selectedBillingIndex || 0]?.addressName ?? <>{t('modal-step-2.address')}{" "}{(+selectedBillingIndex || 0) + 1}</>}
							</DataValueTitle>
							{userData?.billingAddresses &&
								<DataValueLabel>
									{userData?.billingAddresses[selectedBillingIndex || 0]?.street || ""}
									{userData?.billingAddresses[selectedBillingIndex || 0]?.appartmentNumber.length ? "/" + userData?.billingAddresses[selectedBillingIndex || 0]?.appartmentNumber : ""}
									{", " + userData?.billingAddresses[selectedBillingIndex || 0]?.city || ""}
								</DataValueLabel>
							}
						</DataValueContainer>
						:
						<CardContent>
							<NoDataLabel>{t('modal-step-2.noData')}</NoDataLabel>
						</CardContent>
					}
				</Collapse>
				<Collapse in={expanded.billing} timeout="auto" unmountOnExit>
					<CardContent sx={{ padding: '8px', paddingBottom: '0px !important' }}>
						<RadioGroup
							value={selectedBillingIndex}
							aria-labelledby="demo-radio-buttons-group-label"
							name="radio-buttons-group"
							onChange={(e) => handleChange(e, "billing")}
						>
							{userData?.billingAddresses?.length
								?
								userData?.billingAddresses.map((el: any, index: number) => {
									return (
										<RadioElementContainer key={index}>
											<FormControlLabel value={index} control={<Radio />}
												label={
													<DataValueContainer>
														<DataValueTitle>{el?.addressName ? el.addressName : <>{t('modal-step-2.address')}{" "}{index + 1}</>}</DataValueTitle>
														<DataValueLabel>{el?.street || ""}
															{el?.appartmentNumber.length ? "/" + el?.appartmentNumber : ""}
															{", " + el?.city || ""}</DataValueLabel>
													</DataValueContainer>
												} style={{ marginBottom: 0 }} />
											<ContextMenu userData={userData} setUserData={setUserData} item={index} setEditItemIndex={setEditItemIndex} property={'billingAddresses'}
												selectedPropertyIndex={selectedBillingIndex}
												setSelectedPropertyIndex={setSelectedBillingIndex}

											/>
										</RadioElementContainer>)

								})
								:

								<NoDataLabel>{t('modal-step-2.noData')}</NoDataLabel>
							}
						</RadioGroup>


					</CardContent>

				</Collapse>
				<AddNewData onClick={() => handleAddNewData("billingAddresses")} style={{ paddingBottom: 12, borderBottom: " 1px solid #D9D9D9" }}>

					<PlusIcon />
					<AddNewDataText>{t('modal-step-2.addNewBillingData')}</AddNewDataText>
				</AddNewData>





				{/* <HorizontalLine /> */}
				<FormControl style={{ fontFamily: "font-family: Inter, sans-serif;", borderBottom: " 1px solid #D9D9D9", marginBottom: 12, width: "100%" }}>
					<SectionTitle>{t('modal-step-2.delivery')}</SectionTitle>
					<RadioGroup
						aria-labelledby="radioDeliveryType"
						name="radioDeliveryType"
						value={deliveryType}
						onChange={handleChangeDelivery}
						style={{ padding: "8px 8px 0 8px" }}
					>
						<FormControlLabel value="address" control={<Radio />} label={<Typography style={{ textAlign: 'left', fontFamily: 'Inter, sans-serif', fontWeight: 'bold', fontSize: "16px", color: "rgb(35,35,35)" }}>{t('modal-step-2.doorDelivery')}</Typography>} />
						<FormControlLabel value="machine" control={<Radio />} label={<Typography style={{ textAlign: 'left', fontFamily: 'Inter, sans-serif', fontWeight: 'bold', fontSize: "16px", color: "rgb(35,35,35)" }}>{t('modal-step-2.parcelDelivery')}</Typography>} />

					</RadioGroup>
				</FormControl>

				{deliveryType === "address" && <>
					<CardActions disableSpacing sx={{ padding: 0 }}>
						<SectionTitle>{t('modal-step-2.shippingData')}</SectionTitle>
						<ExpandMore
							expand={expanded.shipping}
							onClick={() => handleExpandClick("shipping")}
							aria-expanded={expanded.shipping}
							aria-label="show more"
						>
							<ExpandMoreIcon />
						</ExpandMore>
					</CardActions>
					<FormGroup>
						<FormControlLabel sx={{
							textAlign: 'left',
							fontFamily: 'Inter, sans-serif',
							'& .MuiTypography-root': {
								fontFamily: 'Inter, sans-serif'
							}
						}} style={{ textAlign: 'left', fontFamily: "Inter, sans-serif" }} control={<Checkbox checked={sameDeliveryAddress} onChange={handleChangeShippingCheckbox} />} label={t('modal-step-2.sameData')} />

					</FormGroup>
					<Collapse in={!expanded.shipping} timeout="auto" unmountOnExit>
						{userData?.shippingAddresses?.length
							?
							<DataValueContainer style={{ padding: 8 }}>
								{!sameDeliveryAddress && (selectedShippingIndex !== null && !isNaN(selectedShippingIndex)) &&
									<>
										<DataValueTitle>
										{userData?.shippingAddresses[selectedShippingIndex]?.addressName ?? <>{t('modal-step-2.address')} {+selectedShippingIndex + 1}</>}
										</DataValueTitle>
										{userData?.shippingAddresses &&
										<DataValueLabel>
											{userData?.shippingAddresses[selectedShippingIndex]?.street || ""}
											{userData?.shippingAddresses[selectedShippingIndex]?.appartmentNumber.length ? "/" + userData?.shippingAddresses[selectedShippingIndex]?.appartmentNumber : ""}
											{", " + userData?.shippingAddresses[selectedShippingIndex]?.city || ""}
											</DataValueLabel>
										}
									</>


								}
							</DataValueContainer>
							:
							null
						}

					</Collapse>
					<Collapse in={expanded.shipping} timeout="auto" unmountOnExit sx={{ padding: '0px !important' }}>
						<CardContent sx={{ padding: '8px', paddingBottom: '0px !important' }}>
							<RadioGroup
								value={selectedShippingIndex}
								aria-labelledby="demo-radio-buttons-group-label"
								name="radio-buttons-group"
								onChange={(e) => handleChange(e, "shipping")}

							>
								{userData?.shippingAddresses?.length
									?
									userData?.shippingAddresses.map((el: any, index: number) => {
										return (
											<RadioElementContainer key={index}>
												<FormControlLabel value={index} control={<Radio />}
													label={
														<DataValueContainer>
															<DataValueTitle>{el?.addressName ? el?.addressName : <>{t('modal-step-2.address')}{" "}{index + 1}</>}</DataValueTitle>
															<DataValueLabel>
																{el?.street || ""}
																{el?.appartmentNumber.length ? "/" + el?.appartmentNumber : ""}
																{", " + el?.city || ""}
															</DataValueLabel>
														</DataValueContainer>
													} style={{ marginBottom: 0 }} />
												<ContextMenu setUserData={setUserData} item={index} setEditItemIndex={setEditItemIndex} property={"shippingAddresses"} userData={userData}
													selectedPropertyIndex={selectedShippingIndex}
													setSelectedPropertyIndex={setSelectedShippingIndex} />
											</RadioElementContainer>)

									})
									:

									<NoDataLabel>{t('modal-step-2.noData')}</NoDataLabel>

								}

							</RadioGroup>


						</CardContent>

					</Collapse>
					<AddNewData onClick={() => handleAddNewData("shippingAddresses")}>
						<PlusIcon />
						<AddNewDataText>{t('modal-step-2.addNewShippingData')}</AddNewDataText>
					</AddNewData>
				</>}

				{deliveryType === "machine" &&
					<>
						<CardActions disableSpacing sx={{ padding: 0 }}>
						<SectionTitle>{t('modal-step-2.parcelMachines')}</SectionTitle>
						<ExpandMore
							expand={expanded.deliveryPoint}
							onClick={() => handleExpandClick("deliveryPoint")}
							aria-expanded={expanded.deliveryPoint}
							aria-label="show more"
						>
							<ExpandMoreIcon />
						</ExpandMore>
					</CardActions>
					{/* <FormGroup>
						<FormControlLabel sx={{
							textAlign: 'left',
							fontFamily: 'Inter, sans-serif',
							'& .MuiTypography-root': {
								fontFamily: 'Inter, sans-serif'
							}
						}} style={{ textAlign: 'left', fontFamily: "Inter, sans-serif" }} control={<Checkbox checked={pickupPointDelivery} onChange={handleChangeDeliveryCheckbox} />} label="Dostawa do paczkomatu" />

					</FormGroup> */}
					<Collapse in={!expanded.deliveryPoint} timeout="auto" unmountOnExit>
						{userData?.parcelLockers.length
							?
							<DataValueContainer style={{ padding: 8 }}>

								{pickupPointDelivery && (selectedDeliveryPointIndex !== null && !isNaN(selectedDeliveryPointIndex)) ?

									<>
										<DataValueTitle>
											{userData?.parcelLockers[selectedDeliveryPointIndex]?.addressName || t('modal-step-2.address') + +selectedDeliveryPointIndex + 1}

										</DataValueTitle>
										{userData?.deliveryPoints &&
											<DataValueLabel>
												{userData?.parcelLockers[selectedDeliveryPointIndex]?.address || ""}

											</DataValueLabel>
										}
									</>
									:
									<div style={{ padding: "8px" }}>
										<NoDataLabel>{t('modal-step-2.notSelectedDeliveryPoint')}</NoDataLabel>
									</div>

								}
							</DataValueContainer>
							:

							<CardContent>
								<NoDataLabel>{t('modal-step-2.noData')}</NoDataLabel>
							</CardContent>

						}

					</Collapse>
					<Collapse in={expanded.deliveryPoint} timeout="auto" unmountOnExit>
						<CardContent sx={{ padding: '8px', paddingBottom: '0px !important' }}>
							<RadioGroup
								value={selectedDeliveryPointIndex}
								aria-labelledby="demo-radio-buttons-group-label"
								name="radio-buttons-group"
								onChange={(e) => handleChange(e, "parcelLockers")}

							>
								{userData?.parcelLockers.length
									?
									userData?.parcelLockers.map((el: any, index: number) => {
										return (
											<RadioElementContainer key={el?._parcelLocker ?? index}>
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
																<img src={el?.logoUrl || getPlaceholder()} alt={el.label || "supplier logo"} style={{

																	width: '42px',
																	height: '42px'
																}} />
															</div>
															<DataValueContainer>
																<DataValueTitle>{el?.addressName ?? el?.lockerId ?? <>{t('modal-step-2.point')}{" "}{index + 1}</>}</DataValueTitle>
																<DataValueLabel>{el?.address ?? ""}</DataValueLabel>
															</DataValueContainer>
														</div>
													} style={{ marginBottom: 0 }} />
												<ContextMenu
													setUserData={setUserData}
													item={index}
													setEditItemIndex={setEditItemIndex}
													property={"parcelLockers"}
													userData={userData}
													selectedPropertyIndex={selectedDeliveryPointIndex}
													setSelectedPropertyIndex={setSelectedDeliveryPointIndex} />
											</RadioElementContainer>)

									})
									:

									<NoDataLabel>{t('modal-step-2.noData')}</NoDataLabel>
								}
							</RadioGroup>
						</CardContent>

						</Collapse>
						<AddNewData onClick={() => handleAddNewData("parcelLockers")}>
							<PlusIcon />
						<AddNewDataText>{t('modal-step-2.addNewParcelData')}</AddNewDataText>
						</AddNewData></>}


				<div style={{
					position: "sticky",
					margin: "0 -16px",
					padding: "16px 16px 8px",
					background: "white",
					bottom: "0px",
					zIndex: "10",
					borderTop: "1px solid #F1F7FF"
				}}>
					<Button type="button" variant="contained" color="primary" fullWidth onClick={handleSelectData}
						sx={{
							fontFamily: 'Inter, sans-serif'
						}}>
						{t('modal-step-2.selectData')}
					</Button>
				</div>

			</>}

			{editItemIndex?.property &&
				<Step2Form
					userData={userData}
					isNewData={editItemIndex?.isNewData}
					setUserData={setUserData}
					editItem={{ ...(editItemIndex), editData: (userData[editItemIndex?.property])[editItemIndex?.itemIndex] }}
					setEditItemIndex={setEditItemIndex}
					setSelectedBillingIndex={setSelectedBillingIndex}
					setSelectedShippingIndex={setSelectedShippingIndex}
					setSelectedDeliveryPointIndex={setSelectedDeliveryPointIndex}
					setSameDeliveryAddress={setSameDeliveryAddress}
				/>
			}

			{/* <button onClick={handlePhpScript}> call php script</button> */}
		</>
	)
}

export default Step2