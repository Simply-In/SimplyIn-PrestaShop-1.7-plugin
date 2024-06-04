/**
 * 2007-2024 PrestaShop
 * NOTICE OF LICENSE
 * This source file is subject to the Academic Free License (AFL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/afl-3.0.php
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 * DISCLAIMER
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to http://www.prestashop.com for more information.
 *  @author    PrestaShop SA <contact@prestashop.com>
 *  @copyright 2007-2024 PrestaShop SA
 *  @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
 *  International Registered Trademark & Property of PrestaShop SA
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const isUserLoggedIn = customer?.logged === true && customer?.is_guest !== "1";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const userEmail = isUserLoggedIn ? customer?.email : "";

const middlewareApiTwo = async ({ endpoint, method, requestBody, token }) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const extensionVersion = extension_version || "";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const prestashopVersion = prestashop_version || "";

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

const getLangBrowser = () => {
  if (navigator.languages !== undefined) return navigator.languages[0];
  else return navigator.language;
};
$(document).ready(async function () {
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

  const phoneNumber = loadDataFromSessionStorageTwo({ key: "phoneNumber" });
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
      shopUserEmail: userEmail || undefined,
    };

    middlewareApiTwo({
      endpoint: "checkout/createOrderAndAccount",
      method: "POST",
      requestBody: newAccountSendData,
    }).then((res) => {});
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
      shopUserEmail: userEmail || undefined,
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
      sessionStorage.removeItem("CustomChanges");
      sessionStorage.removeItem("inpost-delivery-point");
      sessionStorage.removeItem("isBillingSelected");
      sessionStorage.removeItem("isDeliverySelected");
    });
  }
});
