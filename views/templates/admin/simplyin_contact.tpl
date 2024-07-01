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


<style>
	.bootstrap .prestashop-switch input:first-of-type:checked~.slide-button {
		background: #DCEBFF;
	}
	.bootstrap .prestashop-switch input:first-of-type:checked~.slide-button::after {
		background: #3167B9;
	}
	.eye-icon {
		position: absolute;
		padding: 0px 8px;
		z-index: 100;
	
	}
	#eye-container{
		position:absolute;
		width:100%;
		height:100%;
		display:flex;
		flex-direction:row;
		justify-content: flex-end;
		align-items: center;
		top:0;
		right:0;
	}

	#showHideContainer{
		position: absolute;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		align-items: center;
		top: 0;
		right: 2px;
	}
</style>

	<div style="display: flex; flex-direction: row; justify-content: space-between; align-items:center; ">
		<div id="SimplySaveCheckboxContainer">
		<h2 style="color:black; font-weight: bold; font-size:18px;">User registration during checkout</h2>
		<p>The "Save your details <a href="https://www.simply.in" target="_blank">Simply.IN</a>" checkbox is selected by default for users who do not have an account at <a href="https://www.simply.in" target="_blank">Simply.IN</a></p>
		</div>
	</div>
	<h2 style="color:black; font-weight: bold; font-size:18px;">Help</h2>
	<div>If you have any questions or issues rellated to the plugin, please contact us via email: <a href="mailto:support@simply.in">support@simply.in</a></div>
	<div style="margin-top:8px;">For more information about our services, visit <a href="https://www.simply.in">Simply.IN website</a></div>

<script>
	const container = document.getElementById("SimplySaveCheckboxContainer").parentNode.parentNode
	container.style.width="100%"
	
document.addEventListener('DOMContentLoaded', async () => {
	const simplySwitch = document.getElementById("SIMPLY_SAVE_CHECKBOX_on").parentNode
	const simplySwitchOn = document.getElementById("SIMPLY_SAVE_CHECKBOX_on")
	const simplySwitchOff = document.getElementById("SIMPLY_SAVE_CHECKBOX_off")
	const SimplySaveCheckboxContainer=document.getElementById("SimplySaveCheckboxContainer").parentNode

	simplySwitch.remove()
	SimplySaveCheckboxContainer.append(simplySwitch)
	simplySwitch.style.display="flex"
	simplySwitch.style.flexDirection="row-reverse"
	
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

	const inputParent = document.getElementById("SIMPLYIN_SECRET_KEY").parentNode
		
	const showHideContainer = document.getElementById("showHideContainer")
	showHideContainer.remove

	inputParent.appendChild(showHideContainer)

inputParent.style.position="relative"

	document.getElementById("showEye").addEventListener("click", () => {
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
	})


	document.getElementById("hideEye").addEventListener("click", () => {
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
	})
})


</script>