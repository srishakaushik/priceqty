/**************************************************************
 * jQuery for cart                                            *
 * includs adding flavours, quantity integration              *
 * and provides respective totals                             *
 *                                                            *
 * written by Srisha Kaushik V                                *
 **************************************************************
 */
$(function() {

	/*********************************************************************************************/

	//PRODUCT DEFINITIONS
	//USE payBill for an item that allows for an adjustable price.
			var products = {
						
						"Product1":{"name":"flavors1",
									"description":"flavors1 Description",
									"price":10},
						"Product2":{"name":"flavors2",
									"description":"flavors2 Description",
									"price":20},
						"Product3":{"name":"flavors3",
									"description":"flavors3 Description",
									"price":30},
						"Product4":{"name":"flavors4",
									"description":"flavors4 Description",
									"price":40}
						};
						
						
			var logo_url = '';
			
	/*********************************************************************************************/
	
	//function to sum up all the line totals into total_price
	function sum_total() {
		var total_price = 0;
		var line_total;
		$('td.line_total').each(function(index) {
			line_total = parseFloat($(this).text().replace('$',''));
			total_price += line_total;
		});
	return total_price;
	}
	
	function update_cookie() {
		var cookie_contents, item, quant;
	
		//set empty contents
		cookie_contents = '';
		
		$('table#fresh_cart tr').each(function(index) {
			//fetch rows that are not the header
			if (index != 0) {
				item = $(this).find('td').eq(0).text();
				quant = $(this).find('td').eq(3).find('input').val();
				cookie_contents += item + '=' + quant + '&';		
			}
		});
		
		//trim the last '&' off
		cookie_contents = cookie_contents.substring(0, cookie_contents.length - 1);
		
		
		$.cookie('jquery-fresh-cart', cookie_contents, { expires: 1 });
	}
						
	//create a checkbox and label for each product
	$.each(products, function(key, value) {
		
		//image_link is the link to the product image if it exists, otherwise it's nothing.
		var image_link = (products[key].hasOwnProperty('image')) ? '<a class="product_image" href="'+products[key]['image']+'">[view image]</a>' : '';
		
		//add the checkbox and label
		$('#fresh_cart_product_selectors').append('<input type="checkbox" id="'+key+'"/> <label for="'+key+'">'+value.name+'</label> '+image_link+'<br />');
	});
	
	//for each product image link remove it's native linking action and open a popup window instead.
	$('a.product_image').each(function() {
		$(this).click(function(event) {
			var url = $(this).attr('href');
			event.preventDefault();
			window.open( url, "productImage", "status = 1, height = 300, width = 300, resizable = 0" );
		});
	});
	
	//start an object of all selected products with quantities
	var selected_products = {};

	//when a checkbox is checked/unchecked...
	$('#fresh_cart_product_selectors input').click(function() {
		
		//get this products id which corresponds with the products object keys
		var this_product = $(this).attr('id');
		
		//get product info
		var product_name = products[this_product]['name'];
		var product_desc = products[this_product]['description'];
		var product_price = products[this_product]['price'].toFixed(2);	
		
		//if this product is being checked
		if($(this).is(':checked')){
			
			//add the item to the selected_products object
			selected_products[this_product] = 1;
			
			//if this isn't a payBill item use normal row html
			if(this_product != 'payBill') {	
				var new_row = 
					'<tr id="'+this_product+'_row"><td class="product_name">'+product_name+'</td><td class="product_desc">'+product_desc+'</td><td>$'+product_price+'</td><td><input type="text" style="width:20px;" id="eyesystem_qty" class="required number" value="1" /></td><td class="line_total">$'+product_price+'</td></tr>';
			}
			else if(this_product == 'payBill') {
				var new_row =
					'<tr id="'+this_product+'_row"><td class="product_name">'+product_name+'</td><td class="product_desc">'+product_desc+'</td><td>$<input type="text" style="width:30px;" id="eyesystem_billamt" class="required number" value="1" /></td><td><input type="text" style="width:20px;" id="eyesystem_qty" class="required number" value="1" disabled="disabled"/></td><td class="line_total">$'+product_price+'</td></tr>';
			}
			
			//add the new row
			$('table#fresh_cart tbody').append(new_row);
			
			//quantity updater
			//because this just looks for 'input' changes this also works for the payBill item where the user
			//can add a specific total as long as the payBill price is 1
			$('tr#'+this_product+'_row input').change(function() {
				//get new quantity
				var new_qty = parseFloat($(this).val());
				$('tr#'+this_product+'_row td').eq(4).text('$' + (product_price * new_qty).toFixed(2));
				$('table#order_summary #eyesystem_order_total').text('$' + (sum_total()).toFixed(2));
				$('input[name="Amount"]').val(sum_total().toFixed(2));
				
				//update the cookie
				update_cookie();
				
				//update the qty in the selected_products object
				selected_products[this_product] = new_qty;
			});
			
			//populate the overall total
			$('table#order_summary #eyesystem_order_total').text('$' + (sum_total()).toFixed(2));
			
			//update the amount field in the payment form too
			$('input[name="Amount"]').val(sum_total().toFixed(2));
		}
		
		//if it's being unchecked
		if(!$(this).is(':checked')){
		
			//remove the item from the selected_products object
			delete selected_products[this_product];
			
			//remove the row
			$('tr#'+this_product+'_row').remove();
			
			//populate the overall total
			$('table#order_summary #eyesystem_order_total').text('$' + (sum_total()).toFixed(2));
			
			//update the amount field in the payment form too
			$('input[name="Amount"]').val(sum_total().toFixed(2));
		}
		
		//if there are no selected products hide the payment form
		if ($('table#fresh_cart tbody tr').length == 1) {
			$('div#eyesystem_payment_form').hide();
		}
		
		//update the cookie
		update_cookie();
	});
});