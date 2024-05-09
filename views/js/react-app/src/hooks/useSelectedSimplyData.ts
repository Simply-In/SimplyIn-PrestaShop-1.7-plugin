import { useState } from 'react';
import { loadDataFromSessionStorage } from '../services/sessionStorageApi';

export const useSelectedSimplyData = () => {






	const [selectedBillingIndex, setSelectedBillingIndex] = useState(loadDataFromSessionStorage({ key: "BillingIndex" }) ?? 0);
	const [selectedShippingIndex, setSelectedShippingIndex] = useState<number | null>(loadDataFromSessionStorage({ key: "ShippingIndex" }) ?? null);
	const [selectedDeliveryPointIndex, setSelectedDeliveryPointIndex] = useState<number | null>(loadDataFromSessionStorage({ key: 'ParcelIndex' }) ?? null)
	const [sameDeliveryAddress, setSameDeliveryAddress] = useState<boolean>((loadDataFromSessionStorage({ key: "sameDeliveryAddress" })) ? true : false);
	const [pickupPointDelivery, setPickupPointDelivery] = useState<boolean>(false);

	return {
		selectedBillingIndex,
		setSelectedBillingIndex,
		selectedShippingIndex,
		setSelectedShippingIndex,
		sameDeliveryAddress,
		setSameDeliveryAddress,
		selectedDeliveryPointIndex,
		setSelectedDeliveryPointIndex,
		pickupPointDelivery,
		setPickupPointDelivery
	};
} 