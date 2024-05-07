import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material'
import { Controller } from 'react-hook-form'
import { useTranslation } from "react-i18next";

interface IEditFormAddress {
	control: any
	errors: any
	isBillingAddress: any
	countryListSelect: any
}

export const EditFormAddress = ({ control, errors, isBillingAddress, countryListSelect }: IEditFormAddress) => {
	const { t } = useTranslation();

	return (
		<>
			<Grid item xs={12}>
				<Controller
					name="addressName"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.addressNamePlaceholder')} fullWidth error={!!errors.addressName} helperText={errors?.addressName?.message as any} />
					}
				/>
			</Grid>
			<Grid item xs={6}>
				<Controller
					name="name"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.name')} fullWidth error={!!errors.name} helperText={errors?.name?.message as any} />
					}
				/>
			</Grid>
			<Grid item xs={6}>
				<Controller
					name="surname"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.surname')} fullWidth error={!!errors.surname} helperText={errors?.surname?.message as any} />
					}
				/>
			</Grid>
			<Grid item xs={12}>
				<Controller
					name="companyName"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.companyName')} fullWidth error={!!errors.companyName} helperText={errors?.companyName?.message as any} />
					}
				/>
			</Grid >
			{isBillingAddress &&
				<Grid item xs={12}>
					<Controller
						name="taxId"
						control={control}
						render={({ field }) =>
							<TextField {...field} label={t('modal-form.taxId')} fullWidth error={!!errors.taxId} helperText={errors?.taxId?.message as any} />
						}
					/>
				</Grid>}
			<Grid item xs={12}>
				<Controller
					name="street"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.streetAndNumber')} fullWidth error={!!errors.street} helperText={errors?.street?.message as any} />
					}
				/>
			</Grid>
			<Grid item xs={12}>
				<Controller
					name="appartmentNumber"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.appartment')} fullWidth error={!!errors.appartmentNumber} helperText={errors?.appartmentNumber?.message as any} />
					}
				/>
			</Grid>
			<Grid item xs={6}>
				<Controller
					name="postalCode"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.postalCode')} fullWidth error={!!errors.postalCode} helperText={errors?.postalCode?.message as any} />
					}
				/>
			</Grid>
			<Grid item xs={6}>
				<Controller
					name="city"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.city')} fullWidth error={!!errors.city} helperText={errors?.city?.message as any} />
					}
				/>
			</Grid>
			<Grid item xs={12} style={{ marginBottom: "16px" }}>
				<FormControl fullWidth error={errors.country ? true : false}>
					<Controller
						render={({ field }) =>
							<>
								<InputLabel id="country-label">{t('modal-form.country')}</InputLabel>
								<Select labelId="country-label" {...field} label={t('modal-form.country')}  >

									{countryListSelect?.map((item: any) => (
										<MenuItem key={item.code} value={item.code}>
											{item.name}
										</MenuItem>
									))}
								</Select >
								<FormHelperText>{errors?.country?.message as any}</FormHelperText>
							</>
						}

						name="country"
						control={control}
					/>
				</FormControl>
			</Grid>

		</>
	)
}
