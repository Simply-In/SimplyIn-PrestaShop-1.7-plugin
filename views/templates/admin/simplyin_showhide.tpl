{** 
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
*}
<div>
	<script>
	const parentElement = document.querySelector(".form-wrapper>div.form-group:nth-child(4)")
	const showHideContainer = document.querySelector(".form-wrapper>div.form-group:nth-child(6)")
	parentElement.appendChild(showHideContainer)
	showHideContainer.style.margin="auto auto"

	showHideContainer.style.setProperty("width", "auto", "important");
	const showhides = () => {
		const x = document.getElementById("SIMPLYIN_SECRET_KEY");
		const show = document.querySelector(".show-pass")
		const hide = document.querySelector(".hide-pass")

		if (x.type === "password") {
			x.type = "text";
			show.style.display="none";
			hide.style.display="";
		} else {
			show.style.display="";
			hide.style.display="none";
			x.type = "password";
		}
	}
	</script>
	<div id="showHideContainer">
			<img src="{$localPath|escape:'html':'UTF-8'}views/img/view.png" onclick="showhides()" class="show-pass eye-icon">
		<img src="{$localPath|escape:'html':'UTF-8'}views/img/hidden.png" onclick="showhides()" class="hide-pass eye-icon" style="display: none">
	</div>
</div>