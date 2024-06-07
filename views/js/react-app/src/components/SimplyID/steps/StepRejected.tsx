import { useTranslation } from 'react-i18next';
import { RejectImage } from '../../../assets/RejectImage'

export const StepRejected = () => {

	const { t } = useTranslation();
	return (
		<div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#E52424", fontSize: "18px", fontWeight: "600", marginBottom: "32px" }}>
			<RejectImage />
			{t('modal-step-rejected.loginRejected')}
		</div>
	)
}
