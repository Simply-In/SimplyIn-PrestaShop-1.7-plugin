/**
 * Copyright 2024-2027 Simply.IN Sp. z o.o.
 *
 * NOTICE OF LICENSE
 *
 * Licensed under the EUPL-1.2 or later.
 * You may not use this work except in compliance with the Licence.
 *
 * Copy of the Licence is available at:
 * https://joinup.ec.europa.eu/software/page/eupl
 * It is bundled with this package in the file LICENSE.txt
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the Licence is distributed on an as is basis,
 * without warranties or conditions of any kind, either express or implied.
 * Check the Licence for the specific language governing permissions
 * and limitations under the License.
 *
 * @author   Simply.IN Sp. z o.o.
 * @copyright 2024-2027 Simply.IN Sp. z o.o.
 * @license   https://joinup.ec.europa.eu/software/page/eupl
 */



$(document).ready(async function () {
  const middlewareApiTwo = async ({ endpoint, method, requestBody, token }) => {
    const baseUrl = base_url || ".";

    const url = `${baseUrl}./modules/simplyin/api/submitData.php`;
    const headers = {
      "Content-Type": "application/json",
    };

    const body = JSON.stringify({
      endpoint,
      method,
      requestBody,
      ...(token ? { token } : {}),
    });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error(error);
    }
  };

  //   const isUserLoggedIn2 =
  // 	customer?.logged === true && customer?.is_guest !== "1";

  const userEmail2 =
    customer?.logged === true && customer?.is_guest !== "1"
      ? customer?.email
      : "";

  const loadDataFromSessionStorageTwo = ({ key }) => {
    try {
      const serializedData = sessionStorage.getItem(key);

      if (serializedData === null) {
        return undefined;
      }

      return JSON.parse(serializedData);
    } catch (error) {
      console.error("Error loading data", error);
      return undefined;
    }
  };

  let extensionVersion = extension_version || "";

  let prestashopVersion = prestashop_version || "";

  let getLangBrowser = () => {
    if (navigator.languages !== undefined) return navigator.languages[0];
    else return navigator.language;
  };

  let shortLang = (lang) => lang.substring(0, 2).toUpperCase();

  const BillingIndex = loadDataFromSessionStorageTwo({
    key: "BillingIndex",
  });
  const ShippingIndex = loadDataFromSessionStorageTwo({
    key: "ShippingIndex",
  });
  const UserData = loadDataFromSessionStorageTwo({
    key: "UserData",
  });

  const phoneNumber = loadDataFromSessionStorageTwo({ key: "phoneNumber" });

  const billingAddresses = {
    _id: UserData?.billingAddresses[BillingIndex]?._id,
    icon: "🏡",
    addressName: "",
    street: (billing_address.address1 || "").trim(),
    appartmentNumber: (billing_address.address2 || "").trim() || "",
    city: (billing_address.city || "").trim(),
    postalCode: (billing_address.postcode || "").trim(),
    country: (billing_country.iso_code || "").trim(),
    companyName: (billing_address.company || "").trim(),
    name: (billing_address.firstname || "").trim(),
    surname: (billing_address.lastname || "").trim(),
    taxId: (billing_address.vat_number || "").trim() || "",
    state: (billing_State?.iso_code || "").trim() || "",
  };

  const shippingAddresses = {
    _id: ShippingIndex
      ? UserData?.shippingAddresses[ShippingIndex]?._id || undefined
      : undefined,
    icon: "🏡",
    addressName: "",
    street: (delivery_address.address1 || "").trim(),
    appartmentNumber: (delivery_address.address2 || "").trim() || "",
    city: (delivery_address.city || "").trim(),
    postalCode: (delivery_address.postcode || "").trim(),
    country: (delivery_country.iso_code || "").trim(),
    companyName: (delivery_address.company || "").trim(),
    name: (delivery_address.firstname || "").trim(),
    surname: (delivery_address.lastname || "").trim(),
    state: (delivery_State?.iso_code || "").trim() || "",
  };

  const orderShippingParcelInfoNewAccount = deliveryPoint
    ? {
        parcelLockerMinimalInfo: {
          providerName: "inpost",
          lockerId: deliveryPoint,
        },
      }
    : { shippingData: shippingAddresses };

  //new account or existing account
  const createAccount = loadDataFromSessionStorageTwo({
    key: "createSimplyAccount",
  });

  const simplyinToken = sessionStorage.getItem("simplyinToken");

  if (createAccount && !simplyinToken) {
    const newAccountSendData = {
      newAccountData: {
        name: (delivery_address.firstname || "").trim(),
        surname: (delivery_address.lastname || "").trim(),
        phoneNumber: (phoneNumber || "").trim(),
        email: (customer.email || "").trim().toLowerCase(),
        language: shortLang(language_code) ?? shortLang(getLangBrowser()),
        marketingConsent: false,
      },
      newOrderData: {
        shopOrderNumber: order_number || "",
        price: Number(totalPaid),
        currency: currency,
        items: customer_data.products,
        placedDuringAccountCreation: true,
        billingData: billingAddresses,
        shopName: shopName || "",
        ...orderShippingParcelInfoNewAccount,
      },
      plugin_version: extensionVersion,
      shopVersion: prestashopVersion,
      shopUserEmail: userEmail2 || undefined,
    };

    middlewareApiTwo({
      endpoint: "checkout/createOrderAndAccount",
      method: "POST",
      requestBody: newAccountSendData,
    }).then((res) => {
      sessionStorage.removeItem("phoneNumber");
      sessionStorage.removeItem("isSimplyDataSelected");
      sessionStorage.removeItem("createSimplyAccount");
      sessionStorage.removeItem("CustomChanges");
    });
  }

  if (simplyinToken) {
    const existingAccountSendData = {
      newOrderData: {
        shopOrderNumber: order_number || "",
        price: Number(totalPaid),
        currency: currency,
        items: customer_data.products,
        placedDuringAccountCreation: false,
        billingData: billingAddresses,
        ...orderShippingParcelInfoNewAccount,
        shopName: shopName || "",
      },
      plugin_version: extensionVersion,
      shopVersion: prestashopVersion,
      shopUserEmail: userEmail2 || undefined,
    };

    middlewareApiTwo({
      endpoint: "checkout/createOrderWithoutAccount",
      method: "POST",
      requestBody: existingAccountSendData,
      token: simplyinToken,
    }).then((res) => {
      sessionStorage.removeItem("isSimplyDataSelected");
      sessionStorage.removeItem("UserData");
      sessionStorage.removeItem("BillingIndex");
      sessionStorage.removeItem("ShippingIndex");
      sessionStorage.removeItem("ParcelIndex");
      sessionStorage.removeItem("phoneNumber");
      sessionStorage.removeItem("simplyinToken");
      sessionStorage.removeItem("selectedShippingMethod");
      sessionStorage.removeItem("customChanges");
      sessionStorage.removeItem("inpost-delivery-point");
      sessionStorage.removeItem("isBillingSelected");
      sessionStorage.removeItem("isDeliverySelected");
      sessionStorage.removeItem("SelectedTab");
      sessionStorage.removeItem("createSimplyAccount");
    });
  }
});
