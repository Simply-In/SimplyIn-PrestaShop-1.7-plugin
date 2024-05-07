
{hook h="displayDeliveryAddress"}
<form class="clearfix" id="configuration_form" data-url-update="{url entity='order' params=['ajax' => 1, 'action' => 'selectDeliveryOption']}" method="post">
   <div class="panel" id="fieldset_0">
      <div class="form-wrapper">
         <div class="form-group">
            <label for="myextrafield_id">{l s='Carrier branch additional Address or Name(option): '}</label>
							<input type="text" id="my_extrafield_1" name="my_extrafield_1" size="50" maxlength="120" value="" />
			<label for="my_extrafield_2">{l s='Carrier branch additional Address or Name(option): '}</label>
							<input type="text" id="my_extrafield_2" name="my_extrafield_2" size="50" maxlength="120" value="" />
							<input type="submit" value="Submit">
         </div>
      </div>
   </div>
</form>

