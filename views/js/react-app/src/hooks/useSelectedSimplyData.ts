import { useState } from 'react';
import { loadDataFromSessionStorage } from '../services/sessionStorageApi';
import { TabType } from '../components/SimplyID/steps/Step2';

export type DeliveryType = "address" | "machine"

export const isNumber = (str: any) => {
	return !isNaN(str) && !isNaN(parseFloat(str));
}

export const useSelectedSimplyData = () => {
	const BillingIndex = (loadDataFromSessionStorage({ key: "BillingIndex" }) || 0) as number
	const ShippingIndex = loadDataFromSessionStorage({ key: "ShippingIndex" }) as number | null

	const ParcelIndex = loadDataFromSessionStorage({ key: "ParcelIndex" }) as number | null
	// const SelectedTab = loadDataFromSessionStorage({ key: "SelectedTab" }) as TabType
	const SelectedTab = sessionStorage.getItem("SelectedTab") as TabType


	const [selectedBillingIndex, setSelectedBillingIndex] = useState(BillingIndex || 0);

	const [selectedShippingIndex, setSelectedShippingIndex] = useState<number | null>(ShippingIndex || null);
	const [selectedDeliveryPointIndex, setSelectedDeliveryPointIndex] = useState<number | null>(loadDataFromSessionStorage({ key: 'ParcelIndex' }) ?? null)
	const [sameDeliveryAddress, setSameDeliveryAddress] = useState<boolean>((loadDataFromSessionStorage({ key: "sameDeliveryAddress" })) ? true : false);
	const [pickupPointDelivery, setPickupPointDelivery] = useState<boolean>(false);
	const [selectedTab, setSelectedTab] = useState<TabType>(SelectedTab ?? "parcel_machine");

	const [deliveryType, setDeliveryType] = useState<DeliveryType>(isNumber(ParcelIndex) ? "machine" : "address");


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
		setPickupPointDelivery,
		selectedTab,
		setSelectedTab,
		deliveryType,
		setDeliveryType
	};
} 