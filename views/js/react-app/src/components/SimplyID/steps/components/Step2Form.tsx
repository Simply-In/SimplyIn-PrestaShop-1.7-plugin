import { Grid } from '@mui/material'
import { useState, useEffect, useContext, useRef } from 'react'

import { EditFormTitle } from '../../SimplyID.styled';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { ApiContext } from '../../SimplyID';

import { middlewareApi } from '../../../../services/middlewareApi';
import { saveDataSessionStorage } from '../../../../services/sessionStorageApi';
import { debounce } from 'lodash';
import { getInpostPointData } from '../../../../functions/selectDeliveryMethod';
import { EditFormMachine } from './EditFormMachine';
import { EditFormFooter } from './EditFormFooter';
import { EditFormAddress } from './EditFormAddress';
import { useTranslation } from "react-i18next";


declare global {
	interface Window {
		afterPointSelected: (point: any) => void;
		querySelector: any
	}
}

interface IStep2Form {
	setUserData: any
	editItem: { property: string, itemIndex: number, editData: any } | null
	setEditItemIndex: (arg: { property: string, itemIndex: number } | null) => void
	isNewData?: boolean
	userData: any
	setSelectedBillingIndex: any
	setSelectedShippingIndex: any
	setSelectedDeliveryPointIndex: any
	setSameDeliveryAddress: any
}

export const Step2Form = ({
	userData,
	setUserData,
	editItem,
	setEditItemIndex,
	isNewData,
	setSelectedBillingIndex,
	setSelectedShippingIndex,
	setSelectedDeliveryPointIndex,
	setSameDeliveryAddress
}: IStep2Form) => {
	const { t } = useTranslation();



	const SignupSchema = Yup.object().shape(editItem?.property === "parcelLockers" ? {
		addressName: Yup.string().notRequired(),
		address: Yup.string().required(t('modal-form.parcelAddressError')),
		lockerId: Yup.string().required(t('modal-form.lockerIdError')),
		_id: Yup.string().notRequired(),
		label: Yup.string().notRequired(),

	} : {
		addressName: Yup.string().notRequired(),
			name: Yup.string().required(t('modal-form.nameError')),
			surname: Yup.string().required(t('modal-form.surnameError')),
		companyName: Yup.string().notRequired(),
		taxId: Yup.string().notRequired(),
			street: Yup.string().required(t('modal-form.streetError')),
		appartmentNumber: Yup.string().notRequired(),
			postalCode: Yup.string().required(t('modal-form.postalCodeError')),
			city: Yup.string().required(t('modal-form.cityError')),
			country: Yup.string().required(t('modal-form.countryError')),
		_id: Yup.string().notRequired(),


	});


	const { authToken } = useContext(ApiContext);

	const { editData }: any = editItem

	const { control, handleSubmit, formState: { errors }, setError, clearErrors, setValue, watch, getValues } = useForm({
		resolver: yupResolver(SignupSchema),
		defaultValues: editItem?.property === "parcelLockers" ? {
			addressName: editData?.addressName || null,
			address: editData?.address,
			lockerId: editData?.lockerId,
			_id: editData?._id || undefined,
			label: editData?.label || "",
			logoUrl: editData?.logoUrl || ""
		} : {
				_id: editData?._id || undefined,
			addressName: editData?.addressName || null,
				name: editItem?.property === "billingAddresses" && isNewData ? userData?.name : editData?.name,
				surname: editItem?.property === "billingAddresses" && isNewData ? userData?.surname : editData?.surname,
			companyName: editData?.companyName,
			taxId: editData?.taxId,
			street: editData?.street,
			appartmentNumber: editData?.appartmentNumber,
			postalCode: editData?.postalCode,
			city: editData?.city,
			country: editData?.country || "PL",

		}
	});





	const onSubmit = (data: any) => {

		Object.keys(data).forEach(key => {
			if (typeof data[key] === 'string') {
				data[key] = data[key].trim();
			}
		})
		handleSave(data)
	}

	const [countryListSelect, setCountryListSelect] = useState<any>([])

	const addressNameRef = useRef<HTMLLabelElement>(null)

	useEffect(() => {
		const countryList: any = [];

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		const countrySelect: any = Object.values(countries_list).sort((a: any, b: any) => {
			const nameA = a?.name.toUpperCase() || ""; // Convert names to uppercase for case-insensitive sorting
			const nameB = b?.name.toUpperCase() || "";

			if (nameA < nameB) {
				return -1;
			}
			if (nameA > nameB) {
				return 1;
			}
			return 0;
		}) || [];

		if (!countrySelect) {
			console.error(t('modal-form.countryNotFound'));
			return;
		}

		// eslint-disable-next-line prefer-const
		for (let option of countrySelect) {
			const country = {
				code: option?.iso_code || "",
				name: option?.name || option?.country || option?.iso_code || ""
			};

			if (country.code !== "") {
				countryList.push(country);
			}
		}

		setCountryListSelect(countryList)

	}, [])



	const [lockerIdValue, setLockerIdValue] = useState<string>("")
	const [additionalInfo, setAdditionalInfo] = useState<string>("")

	const manuallyChangeLockerId = watch("lockerId")
	const label = watch("label")
	const addressChange = watch("address")

	useEffect(() => {


		if ((manuallyChangeLockerId && label === "INPOST")) {
			const debouncedRequest = debounce(async () => {
				try {
					const inpostPointData = await getInpostPointData({ deliveryPointID: manuallyChangeLockerId as string })

					if (inpostPointData?.status === 404) {
						setValue('address', "")
						setError('lockerId', { message: t('modal-form.shippingPointError') })

						throw new Error(t('modal-form.shippingPointError'))
					}
					clearErrors('lockerId')
					clearErrors('address')
					setValue('address', `${inpostPointData?.address?.line1 || ""}, ${inpostPointData?.address?.line2 || ""}`)

				}
				catch (err) {
					console.log(err);
				}
			}, 1000);

			debouncedRequest();
			return () => {
				debouncedRequest.cancel();
			};
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [lockerIdValue, manuallyChangeLockerId, addressChange])

	const handleCancel = () => { setEditItemIndex(null) }

	const handleSave = (editedData: any) => {

		if (editItem && 'property' in editItem && 'itemIndex' in editItem) {

			const clonnedArray = [...userData[editItem.property]]
			clonnedArray[editItem?.itemIndex] = {
				...editedData
			}
			const requestData = { userData: { ...userData, [editItem.property]: clonnedArray } }
			middlewareApi({
				endpoint: "userData",
				method: 'PATCH',
				token: authToken,
				requestBody: requestData
			}).then(res => {
				if (res.error) {
					throw new Error(res.error)
				} else if (res.data) {
					setUserData(res.data)
					saveDataSessionStorage({ key: 'UserData', data: res.data })

					//created to select newly created item
					if (isNewData) {
						if (editItem.property === "billingAddresses") {
							setSelectedBillingIndex(res.data.billingAddresses.length - 1 || 0)
						}
						if (editItem.property === "shippingAddresses") {
							setSelectedShippingIndex(res.data.shippingAddresses.length - 1 || 0)
							//unselect same address
							setSameDeliveryAddress(false)
						}
						if (editItem.property === "parcelLockers") {
							setSelectedDeliveryPointIndex(res.data.parcelLockers.length - 1 || 0)

						}
					}
				}
			})
		}

		setEditItemIndex(null)


	}

	const editItemTitle = () => {
		if (editItem?.property === "billingAddresses") { return t('modal-form.billingData') }
		if (editItem?.property === "shippingAddresses") { return t('modal-form.shippingData') }
		if (editItem?.property === "parcelLockers") { return t('modal-form.parcelData') }
	}



	const isBillingAddress = editItem?.property === "billingAddresses"

	const isDeliveryPoint = editItem?.property === "parcelLockers"



	const setPointValues = (point: any) => {
		setLockerIdValue(point.name);
		setValue('lockerId', point.name);
		setValue('label', "INPOST");
		setValue('address', `${point?.line1 || ""} ${point?.line2 || ""}`);
		setAdditionalInfo(point?.location_description);
	}

	const handleInputElementFocus = (inputElement: any) => {
		if (inputElement) {
			inputElement.focus();
			const containerElement = document.getElementById('containerSimply');
			if (containerElement) {
				setTimeout(() => containerElement.scrollTo({
					top: document.body.scrollHeight,
					behavior: 'smooth',
				}), 50);
			}
		}
	}

	const handlePointSelection = (point: any) => {
		if (manuallyChangeLockerId !== point.name) {
			setPointValues(point);
			if (addressNameRef?.current) {
				const inputElement = addressNameRef.current?.querySelector('input');
				handleInputElementFocus(inputElement);
			}
		}
	}

	useEffect(() => {
		const script = document.createElement('script');
		script.src = 'https://geowidget.inpost.pl/inpost-geowidget.js';
		script.async = true;
		document.head.appendChild(script);

		if (window) {
			window.afterPointSelected = handlePointSelection;
		}

		const containerElement = document.getElementById('containerSimply');
		if (containerElement) {
			containerElement?.scrollTo({
				top: 0,
				behavior: 'instant',
			});
		}

		return () => {
			// Cleanup on component unmount
			document.head.removeChild(script);
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);




	return (
		<div >
			<EditFormTitle>{editItemTitle()}</EditFormTitle>

			<form onSubmit={handleSubmit(onSubmit)}>
				<Grid container spacing={2}>
					{!isDeliveryPoint &&
						<EditFormAddress
							control={control}
							errors={errors}
							isBillingAddress={isBillingAddress}
							countryListSelect={countryListSelect}
						/>
					}

					{isDeliveryPoint &&
						<EditFormMachine
							control={control}
							errors={errors}
							addressNameRef={addressNameRef}
							getValues={getValues}
							additionalInfo={additionalInfo}
							setLockerIdValue={setLockerIdValue}
							setValue={setValue}
							setAdditionalInfo={setAdditionalInfo}
					/>
					}


				</Grid>
				<EditFormFooter
					isNewData={isNewData}
					handleCancel={handleCancel} />

			</form >
		</div >
	)
}

