// JavaScript Document
//(function (jQuery) {
var form_action_url = '/code/api/api.php';
var trial_confirm_url = '/try/confirm';
var buy_confirm_url = '/buy/confirm';
var show_CTA_forms_as_overlays = false;
var windowHeight = window.innerHeight - 75;
var form_modal_options = {
    opacity : 60,
    overlayCss : {
        backgroundColor : "black"
    },
    overlayClose : true,
    maxWidth : 850,
    maxHeight : windowHeight
};

jQuery(document).ready(function() {
    if (jQuery("#form-email-signature").length != 0) {
        jQuery("#form-email-signature").submit(function(event) {
            open_form();
            event.preventDefault();
        });
    }
    if (show_CTA_forms_as_overlays) {
        //============This section checks if the CTA forms (try, contact) should be shown as menus or overlays
        //DEMO FORM
        jQuery("#cta-menu .demo .button").click(function() {
            $form = jQuery("#form-demo");
            $form.not(':has(h2)').prepend('<h2>See a Demo</h2>');
            $form.modal(form_modal_options);
        });
        //CONTACT FORM
        jQuery("#cta-menu .trial .button").click(function() {
            $form = jQuery("#form-contact");
            $form.not(':has(h2)').prepend('<h2>Contact Us</h2>');
            $form.modal(form_modal_options);
        });
    }
    //Got Contact Us page if "Contact Us" is clicked in the CTA menu.
    jQuery("#goto-contact-us").click(function() {
        window.location = 'company/contact-us';
    });

    //Process 'conversion_page' (assign to page path if not set)
    jQuery("form.ds-form").each(function() {
        $form = jQuery(this);
        $conversion_page = $form.find("input:hidden[name='conversion_page']");
        if ($conversion_page.size() > 0) {
            //set value of existing input field
            if (!$conversion_page.eq(0).val()) {
                $conversion_page.eq(0).val(location.pathname);
            }
        } else {
            //create the input field
            $form.append('<input type="hidden" name="conversion_page" value="' + location.pathname + '" />');
        }
    });

    //Remove error class on focus
    jQuery(".formrow_half input, .formrow_half select").focus(function(){
        jQuery(this).removeClass("error");
        jQuery(this).prev().removeClass("error");
    });

    //form-trigger links click handler
    jQuery("a.show-form,a.show_form").click(function() {
        $link = jQuery(this);
        var showForm = true;
        var data = jQuery(this).attr('href').split('|');
        var $form = jQuery(data[0]);

        //handle white paper link
        /*if ($link.is(".white-paper-download")) {
         var wp_url = $link.attr('rel');
         if (whitepaper_registered()) {
         showForm = false;
         location.href=wp_url;
         return;
         } else {
         $form.addClass("wp-download-form");
         $form.append('<input type="hidden" name="wp_url" value="' + wp_url + '" />');
         }
         }*/

        if ($form.size() > 0 && showForm) {
            //handle white paper links
            //convert additional data values to hidden inputs
            for ( f = 1; f < data.length; f++) {
                var prop = data[f].split("=");
                var key = prop[0];
                var value = prop[1];
                var $input_field = $form.find("input:hidden[name='" + key + "']");
                if ($input_field.size() > 0) {
                    $input_field.eq(0).val(value);
                } else {
                    //create the input field
                    $form.append('<input type="hidden" name="' + key + '" value="' + value + '" />');
                }

            }
            $form.not(':has(h2)').prepend('<h2>' + jQuery(this).attr("title") + '</h2>');
            $form.modal(form_modal_options);
        }
        return false;
    });
});
function ds_handleInkResponse(data, textStatus, xmlhttp) {
    if (data.Success === false) {
        //used on /signup/docusignink
        error_msg = "There was a problem submitting the form.";

        // if using old error pattern
        if ((data.account) && (data.account.Error) && (data.account.Error.ErrorCode)) {
            data.account.errorCode = data.account.Error.ErrorCode;
        }

        if ((data.account) &&  (data.account.errorCode)) {
            if (data.account.errorCode != "Unspecified_Error") {
                error_msg = get_friendly_errormessage(data.account.errorCode);
            }
        }
        jQuery("#form-personal-edition-signup").append("<div style='clear:both;' class='formrow_whole ajaxerror'>" + error_msg + "</div>");
        jQuery("#form-personal-edition-signup").fadeIn("normal");
        ds_request_end();
    } else {
        //success

        ds_goToThankYou($form)


        ds_request_end();
    }

}
var ds_goToThankYou = function (form){
        //in-page forms
        //$form.remove();
        var url =  jQuery(form).attr("thankyou");
         window.location.pathname = "/" + url

    }

function ds_handleResponse(data, textStatus, xmlhttp) {
    // debug - show data
    //console.log(JSON.stringify(data));

    if (data.Success === false) {
        //something went wrong
        error_msg = "There was a problem submitting the form.";
        if ((data.account) && (data.account.Error) && (data.account.Error.ErrorCode)) {
            data.account.errorCode = data.account.Error.ErrorCode;
            if (data.account.Error.Description !== undefined)
                data.account.message = data.account.Error.Description;
        }
        if ((data.account) && (data.account.errorCode)) {
            if (data.account.errorCode != "Unspecified_Error") {
                error_msg = get_friendly_errormessage(data.account.errorCode);
            } else if (data.account.message == "This social provider account is already mapped in the system.") {
                error_msg = "This social provider account is already linked to<br/> a DocuSign account, please <a href='https://www.docusign.net/'>sign in</a>.";
            } else {
                //this error comes in as "Unspecified"
                if (data.account.message == "This email address has already been offered a free trial.") {
                    error_msg = "This email address has already been offered a free trial.";
                }
            }
        }

        if (window.submittedFormMethod == "narfreetrial" || window.submittedFormMethod == "narfreedomsignup") {
            if (data.narvalidation.Success == false) {
                //NAR - failed to create free trial, probabl invalid NAR credentials
                //alert("Your NAR membership information could not be verified.  Please check the form and try again.");
                ds_request_end();
                $form.find(".form-errors").append("<div>Your NAR membership information could not be verified. Please check the form and try again.</div>");
                $form.find(".form-errors").fadeIn("normal");
            } else {
                //failed for another reason
                $form.find(".form-errors").append("<div>" + error_msg + "</div>");
                $form.find(".form-errors").fadeIn("normal");
            }

        } else {
            //generic failure message
            //console.log(JSON.stringify(xmlhttp));
            $form.find(".form-errors").append("<div>" + error_msg + "</div>");
            $form.find(".form-errors").fadeIn("normal");
        }

    } else {
        //success
        $form = window.submittedForm;
        //show thank you / confirmation message
        if ($form.is(".wp-download-form")) {
            whitepaper_set_registered();
            wp_url = $form.find("input[name='wp_url']").val();
            ds_request_end();
            jQuery('#simplemodal-overlay').click();
            alert("Thank you.  Click OK to download the white paper.");
            location.href = wp_url;
            return;
        } else if ($form.is(".hidden-form") && !$form.is(".lead-powerform")) {
            //overlay forms
            $form.after(jQuery("#confirmation-" + $form.attr("id")));
            $form.remove();
        } else if ($form.is("#form-cta-contact")) {
            $form.blur();
            $wrapper = $form.closest(".content");
            $wrapper.css({
                'min-height' : $wrapper.height(),
                'min-width' : $wrapper.width()
            });
            $confirm = jQuery("#confirmation-form-cta-contact");
            //$wrapper.html($confirm);
            //$confirm.fadeIn("normal");
            window.location = "/thankyou/contact";
        } else if ($form.is(".lead-powerform")) {
            PowerFormId = $form.find("select[name='PowerFormId'],input[name='PowerFormId']").val();
            powerform_role = $form.find("input[name='powerform_role']").val();
            username = $form.find("input[name='first_name']").val() + " " + $form.find("input[name='last_name']").val();
            email = $form.find("input[name='email']").val();
            powerform_url = "https://www.docusign.net/MEMBER/PowerFormSigning.aspx?PowerFormId=" + PowerFormId;
            powerform_url += "&" + powerform_role + "_UserName=" + username;
            powerform_url += "&" + powerform_role + "_Email=" + email;
            window.location = powerform_url;
        } else {
            ds_goToThankYou($form);
            //in-page forms
            $form.remove();
   
        }
    }
    ds_request_end();
};

function ds_handleError(data, textStatus, xmlhttp) {
    // console.log(textStatus + xmlhttp);
    ds_request_end();
};

function ds_request_start($form, method) {
    jQuery($form).append('<div id="spinner"><p id="spinnerImg"></p></div>');
    window.submittedForm = $form;
    window.submittedFormMethod = method;
    window.request_in_progress = true;
    jQuery("#spinner").show();

}

// this is called when the form request completes
function ds_request_end() {
    window.submittedForm = false;
    window.request_in_progress = false;
    jQuery("#spinner").remove();

}

function ds_validate_form(form, method) {
    var errorCount = 0;
    var normalErrors = 0;
    var emailError = false;
    var phoneError = false;
    var termsError = false;
    var passwordMatchError = false;
    var $form = jQuery(form);
    jQuery('.ajaxerror').remove();
    ds_clear_errors(form);

    //text inputs and select lists
    $form.find("textarea,input[type='text'],input[type='password'],select").each(function() {
        $input = jQuery(this);
        if (!$input.hasClass("optional")) {
            if (jQuery.trim($input.val()) == "" || $input.val() == $input.attr("default")) {
                errorCount += 1;
                normalErrors += 1;
                jQuery(".label-terms, label[for='" + $input.attr("id") + "'], input[name='" + $input.attr('name') + "']", $form).addClass("error");
            } else if ($input.attr("name") == "email") {
                if (ds_validate_email(jQuery.trim($input.val())) == false) {
                    errorCount += 1;
                    emailError = true;
                    $input.addClass("error");
                    jQuery("label[for='" + $input.attr("id") + "']", $form).addClass("error");
                }
            }
            if ($input.attr("name") == "password2") {
                if ($input.val() != jQuery('input[name="password"]').val())   {
                    errorCount += 1;
                    passwordMatchError = true;
                    $input.addClass("error");
                    jQuery('input[name="password"]').addClass("error");
                    jQuery("label[for='" + $input.attr("id") + "']", $form).addClass("error");
                }
            }

        }

    });
    //each (input)

    //terms and conditions checkbox
    $terms = $form.find("input#terms");
    if ($terms.size() > 0) {
        $terms = $terms.eq(0);
        if (!$terms.is(":checked")) {
            errorCount += 1;
            termsError = true;
            $terms.addClass("error");
        }
    }

    if (errorCount > 0) {
        if (errorCount > 1)
            plural = 's';
        else
            plural = '';
        var errorMessage = '<div>Please correct the <span class="hilite">highlighted</span> field' + plural + '<ul class="form-errors-list">';
        //validation fails
        if (normalErrors > 0) {
            errorMessage += '<li>All fields are required.</li>';
            //singular
        }
        if (emailError) {
            errorMessage += '<li>The email address you entered is invalid.</li>';
        }
        if (termsError) {
            errorMessage += '<li>You must accept the terms of use</li>';
        }
        if (passwordMatchError) {
            errorMessage += '<li>Your passwords do not match</li>';
        }
        errorMessage += '</ul></div>';
        $form.find(".form-errors").html(errorMessage);
        $form.find(".form-errors").fadeIn("normal");
        return false;
    } else {
        //validation successful
        return true;
    }
}

function ds_clear_errors(form) {
    $form = jQuery(form);
    jQuery(".error", $form).removeClass("error");
    jQuery(".form-errors", $form).html("");
}

function ds_submit_form(form,method) {


    if ((typeof checkFormIndustries != 'undefined') && (checkFormIndustries == 1))
           whichIndustry();
    if (typeof method == 'undefined')
        var  method =jQuery("#form-multitrial #method").val();
    ds_clear_errors(form);
   var validates = true;
    if ((typeof docusign == 'undefined') ||  (docusign.validation == undefined))
       validates = ds_validate_form(form, method);
    $form = jQuery(form);
    if (validates) {
        ds_request_start($form, method);
        switch(method) {
            case 'demo':
                //Validation was successful.  Submit the data
                //but first, Eloqua!
                //then Powerform
                var PowerFormIdName = jQuery(".dev-center-demo-selected input").attr('id');
                var PowerFormId = jQuery("#"+PowerFormIdName).val();
                var first_name = jQuery.trim($form.find("input[name='first_name']").val());
                var last_name = jQuery.trim($form.find("input[name='last_name']").val());
                var company = jQuery.trim($form.find("input[name='company']").val());
                var title = jQuery.trim($form.find("input[name='title']").val());
                var FullName = first_name + " " + last_name;

                var Email = jQuery.trim($form.find("input[name='email']").val());
                var form_url = "https://www.docusign.net/MEMBER/PowerFormSigning.aspx?PowerFormId=" + PowerFormId;
                form_url += "&Signer_UserName=" + encodeURIComponent(FullName);
                form_url += "&Demo_UserName=" + encodeURIComponent(FullName);
                form_url += "&Signer_Email=" + encodeURIComponent(Email);
                form_url += "&Demo_Email=" + encodeURIComponent(Email);
                form_url += "&Phone=" + jQuery('#phone').val();
                form_url += "&FirstName=" + encodeURIComponent(first_name);
                form_url += "&LastName=" + encodeURIComponent(last_name);
                form_url += "&Company=" + encodeURIComponent(company);
                form_url += "&Title=" + encodeURIComponent(title);
                var demo_form = jQuery('input[name="doctype"]:checked').attr('id');
                form_data = jQuery(form).serialize() + "&method=newlead&demo_form=" + demo_form;
                jQuery.ajax({
                    type : 'POST',
                    url : "/code/api/api.php",
                    data : form_data,
                    complete : function() {
                        location.href = form_url;
                    },
                    dataType : "json"
                });

                return false;
                break;
            //demo
            case 'newlead':
                server_url = form_action_url;
                form_data = jQuery(form).serialize() + "&method=" + method;
                jQuery.ajax({
                    type : 'POST',
                    url : form_action_url,
                    data : form_data,
                    success : ds_handleResponse,
                    dataType : "json"
                });
                return false;
                break;
            case 'contact':
                form_data = jQuery(form).serialize() + "&method=" + method;
                support_or_sales = jQuery('#contact_category').val();
                src = "/support-request?" + form_data;
                if (support_or_sales == "support") {
                    jQuery.modal('<iframe src="' + src + '" height="430" width="830" style="border:0" scrolling="no">', {
                        closeHTML : '<a class="modalCloseImg simplemodal-close" title="Close"></a>',
                        containerCss : {
                            backgroundColor : "#fff",
                            borderColor : "#fff",
                            height : 500,
                            padding : 0,
                            width : 830
                        },
                        overlayClose : true
                    });
                    ds_request_end();
                    jQuery("#cta-menu").hide();

                } else {
                    //do the usual newlead submit

                    jQuery.ajax({
                        type : 'POST',
                        url : form_action_url,
                        data : form_data,
                        success : ds_handleResponse,
                        dataType : "json"
                    });
                }

                return false;
                break;
            // create new lead and then fire up demo
            case 'demo-lead':
                server_url = form_action_url;
                form_data = jQuery(form).serialize();
                // first add lead to sf
                jQuery.ajax({
                    type : 'POST',
                    url : form_action_url,
                    data : form_data,
                    success : ds_handleResponse,
                    dataType : "json"
                });
                return false;
                break;
            // free account signup form, not personal account
            case 'freeaccount':
                server_url = form_action_url;
                username = jQuery("#" + jQuery(form).attr("id") + " input[name=first_name]").val() + ' ' + jQuery("#" + jQuery(form).attr("id") + " input[name=last_name]").val();
                form_data = jQuery(form).serialize() + "&username=" + username + "&method=" + method;
                jQuery.ajax({
                    type : 'POST',
                    url : server_url,
                    data : form_data,
                    success : ds_handleResponse,
                    error : ds_handleError,
                    dataType : "json"
                });
                return false;
                break;
            //Ink Free
            case 'inkfreeaccount':
                server_url = form_action_url;
                first_name = jQuery("#" + jQuery(form).attr("id") + " input[name=first_name]").val();
                last_name = jQuery("#" + jQuery(form).attr("id") + " input[name=last_name]").val();
                username = first_name + " " + last_name;
                company = jQuery("#" + jQuery(form).attr("id") + " input[name=company]").val();
                if( (company==undefined) ||(company=="")) {
                    company = username;
                }
                form_data = jQuery(form).serialize() + "&username=" + username + "&method=" + method + "&company=" + company + "" + "&first_name=" + first_name + "&last_name=" + last_name;
                jQuery.ajax({
                    type : 'POST',
                    url : server_url,
                    data : form_data,
                    success : ds_handleInkResponse,
                    error : ds_handleError,
                    dataType : "json"
                });
                return false;
                break;
            case 'narfreetrial':

                server_url = form_action_url;
                username = jQuery("#" + jQuery(form).attr("id") + " input[name=first_name]").val() + ' ' + jQuery("#" + jQuery(form).attr("id") + " input[name=last_name]").val();
                form_data = jQuery(form).serialize() + "&username=" + username + "&method=" + method;
                jQuery.ajax({
                    type : 'POST',
                    url : server_url,
                    data : form_data,
                    success : ds_handleResponse,
                    error : ds_handleError,
                    dataType : "json"
                });
                return false;
                break;
            case 'form-personal-edition-social-signup':

                server_url = form_action_url;
                username = jQuery("#" + jQuery(form).attr("id") + " input[name=first_name]").val() + ' ' + jQuery("#" + jQuery(form).attr("id") + " input[name=last_name]").val();
                form_data = jQuery(form).serialize() + "&username=" + username + "&method=" + method;
                jQuery.ajax({
                    type : 'POST',
                    url : server_url,
                    data : form_data,
                    success : ds_handleResponse,
                    error : ds_handleError,
                    dataType : "json"
                });
                return false;
                break;
            case 'multitrial':
                server_url = form_action_url;
                username = jQuery("#" + jQuery(form).attr("id") + " input[name=first_name]").val() + ' ' + jQuery("#" + jQuery(form).attr("id") + " input[name=last_name]").val();
                form_data = jQuery(form).serialize() + "&username=" + username + "&method=" + method;
                jQuery('.ajax-progress .throbber, .ajax-progress').show();
                jQuery.ajax({
                    type : 'POST',
                    url : server_url,
                    data : form_data,
                    success : ds_handleResponse,
                    error : ds_handleError,
                    dataType : "json",
                    complete : function() {
                        // request is complete, regardless of error or success, so hide image
                        $('.ajax-progress .throbber, .ajax-progress').hide();
                    }
                });
                return false;
                break;
            case 'freetrial-inpage':
                server_url = form_action_url;
                username = jQuery("#" + jQuery(form).attr("id") + " input[name=first_name]").val() + ' ' + jQuery("#" + jQuery(form).attr("id") + " input[name=last_name]").val();
                jQuery("#" + jQuery(form).attr("id") + " input[name=username]").val(username);
                form_data = jQuery(form).serialize() + "&username=" + username + "&method=" + method;
                jQuery.ajax({
                    type : 'POST',
                    url : server_url,
                    data : form_data,
                    success : ds_handleResponse,
                    error : ds_handleError,
                    dataType : "json"
                });
                return false;
                break;
            default:
                server_url = form_action_url;
                form_data = jQuery(form).serialize();
                // used for freetrial accounts
                username = jQuery("#" + jQuery(form).attr("id") + " input[name=first_name]").val() + ' ' + jQuery("#" + jQuery(form).attr("id") + " input[name=last_name]").val();
                form_data = form_data + '&username=' + username;
                // only used on request_whitepapers - concatenates the requested whitepapers into a single string value
                papers = document.getElementsByName('paper');
                requested_papers = [];
                for (var i = 0; i < papers.length; i++) {
                    if (papers[i].checked) {
                        requested_papers.push(papers[i].value);
                    }
                }
                requested_papers = requested_papers.join('|');
                form_data = form_data + '&requested_papers=' + requested_papers;

                post_data = {
                    method : method,
                    data : form_data
                };

                jQuery.ajax({
                    type : 'POST',
                    url : server_url,
                    data : post_data,
                    success : ds_handleResponse,
                    error : ds_handleError,
                    dataType : "json"
                });
                return false;
            //default

        }//switch
    } else {
        return false;
    }//if validates
};

function ds_validate_email(address) {
    var reg = /^([A-Za-z0-9_\+\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    return reg.test(address);
};

function ds_tracking_pixel(pixelnames) {//pixelnames = array
    for ( p = 0; p < pixelnames.length; p++) {
        imgSrc = eval('tracking_pixels.' + jQuery.trim(pixelnames[p]));
        if (imgSrc) {
            jQuery('<img src="' + imgSrc + '" width="1" height="1" />').appendTo("body");
        }
    }
}

function ds_ga_async(trackers) {//urlnames = array
    //alert(0);
    for ( g = 0; g < trackers.length; g++) {
        item = eval('ga_trackers.' + jQuery.trim(trackers[g]));
        if (item) {
            _gaq.push(item);
        }
    }
}

//})(jQuery);

/*=============== WHITE PAPERS COOKIE HANDLING ================*/
function whitepaper_registered() {
    //TODO:check cookie if they already registered for the whitepaper
    return (getCookie('white_paper_registered') == 'yes');
    return false;
}

function whitepaper_set_registered() {
    setCookie('white_paper_registered', 'yes', 365);
    return true;
}

//=================== HOME PAGE CAROUSEL FORM ==================
function init_home_page() {
    jQuery('#form-home-getstarted .text-input').focus(function() {
        if (jQuery(this).val() == jQuery(this).attr("default")) {
            jQuery(this).val('');
        }
    }).blur(function() {
            if (jQuery.trim(jQuery(this).val()) == '') {
                jQuery(this).val(jQuery(this).attr("default"));
            }
        });
}


jQuery(document).ready(function() {
    if (jQuery('#form-home-getstarted').length > 0) {
        init_home_page();
    }
    if (jQuery('#panel-buy-options').size() > 0) {
        init_buy_page();
    }
});

//=================== BUY PAGE==================
function init_buy_page() {
    $panel = jQuery('#panel-buy-options');
    $panel.find('td.edition-cell :radio').click(function() {
        $radio = jQuery(this);
        $cell = $radio.parents('td:first');
        if (! $cell.is('.selected')) {
            $panel.find('td.selected').removeClass('selected');
            $cell.removeClass('hovered');
            $cell.addClass('selected');
            buy_update_ui($radio.attr('value'));
        }
        return true;
    });
    //click
    $panel.find('td.edition-cell').click(function() {
        $cell = jQuery(this);
        if (! $cell.is('.selected')) {
            $cell.find(':radio').click();
        }
    });
    //click
    $panel.find('td.edition-cell').hover(function() {
        $cell = jQuery(this);
        if (! $cell.is('.selected')) {
            $cell.addClass('hovered');
        }
    }, function() {
        jQuery(this).removeClass('hovered');
    });
    buy_update_ui(jQuery('.radio-wrapper input:radio:checked').val());
}

function buy_update_ui(edition) {

    // get the visible form
    var $current_form_frame = jQuery("#buy-forms>div:visible");
    // get the new form frame
    var $new_form_frame = jQuery("#buy-form-" + edition);

    // if the two frames are different then we will fadeOut the old and fadeIn the new
    if (($current_form_frame.length) && ($current_form_frame.length > 0) && ($current_form_frame.attr('id') !== $new_form_frame.attr('id'))) {
        $current_form_frame.fadeOut("fast", function() {
            $new_form_frame.fadeIn("fast");
        });
    } else {
        // both frames are the same. If the new frame isn't visible, show it. If it is visible, leave it alone
        if ($new_form_frame.is(':hidden')) {
            $new_form_frame.fadeIn("fast");
        }
    }
    // load the iframe if present and unloaded
    var $div_i_frame = jQuery("div.iframe-form", $new_form_frame);
    var $i_frame = jQuery("iframe", $div_i_frame);
    if ($i_frame && $i_frame.length && $i_frame.length > 0 && $i_frame.attr('src') == "") {
        var iframUriWithCountry = $div_i_frame.data('src') + '&country=' + (Drupal.settings.country || 'US');
        $div_i_frame.showLoading();
        $i_frame.attr('src', iframUriWithCountry);
        $i_frame.load(function() {
            $div_i_frame.hideLoading();
        });
    }

}

function update_ui_data(data, clear_other_data_values) {
    if (clear_other_data_values) {
        //cleaer any element whose id starts with 'data-';
        jQuery("[id^='data-']").html('');
    }
    for (var key in data) {
        var value = data[key];
        //alert("#data-" + key + "=" + value);
        jQuery("#data-" + key + ",.data-" + key).html(value);
    }
}

function buy_confirmation(data) {
    if (data.product_name) {
        $postForm = jQuery('<form method="post"></form>');
        $postForm.attr("action", buy_confirm_url);
        $postForm.submit(function() {
            jQuery("#buy-choices-wrapper").showLoading();
        });
        var fields = '';
        for (var key in data) {
            var value = data[key];
            fields += '<input type="hidden" name="' + key + '" value="' + value + '" />';
        }
        $postForm.html(fields).submit();
    }
}

//=================== TRY PAGE==================
//this function posts the form data to the confirmation page
function trial_confirmation($form) {
    $postForm = jQuery('<form method="post"></form>');
    $postForm.attr("action", trial_confirm_url);
    $postForm.submit(function() {
        jQuery("#panel-try-form").showLoading();
    });
    var fields = '<input name="form_submitted" value="1" />';
    $form.find("input,select").each(function() {
        $field = jQuery(this);
        if ($field.attr("name") > "") {
            fields += '<input type="hidden" name="' + $field.attr("name") + '" value="' + $field.val() + '" />';
        }
    });
    $postForm.html(fields).submit();
}

//====== COOKIE HELPERS======
function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {
    var i, x, y, ARRcookies = document.cookie.split(";");
    for ( i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) {
            return unescape(y);
        }
    }
}

function checking_update() {
    window.location = "http://wwww.docusign.com";
}


function get_friendly_errormessage(errorCode) {
    retval = "There was a problem submitting the form.";
    switch(errorCode) {
        case 'Member_Email_And_User_Name_Awaiting_Activation':
        case 'USER_AWAITING_ACTIVATION':
            retval = 'There was already an account created for this username and email address. We have resent the account activation email. Please check your inbox for instructions on activating your account.';
            break;
        case 'Member_Email_And_User_Name_Already_Exists':
        case 'Member_Email_And_User_Name_Already_Exists_For_This_Account':
        case 'USER_ALREADY_EXISTS_IN_ACCOUNT':
        case 'Member_Email_Not_Allowed':
        case 'BILLING_PLAN_ERROR':
            retval = 'This email address already has a DocuSign account. <a href="https://www.docusign.net">Click here to login.</a>';
            break;
        case 'EMAIL_IS_RESERVED':

            retval = 'The specified email(s) are reserved.';
            break;

    }
    return retval;
}



;
﻿/*
 * jQuery showLoading plugin v1.0
 * 
 * Copyright (c) 2009 Jim Keller
 * Context - http://www.contextllc.com
 * 
 * Dual licensed under the MIT and GPL licenses.
 *
 */
jQuery.fn.showLoading=function(options){var indicatorID;var settings={'addClass':'','beforeShow':'','afterShow':'','hPos':'center','vPos':'center','indicatorZIndex':5001,'overlayZIndex':5000,'parent':'','marginTop':0,'marginLeft':0,'overlayWidth':null,'overlayHeight':null};jQuery.extend(settings,options);var loadingDiv=jQuery('<div></div>');var overlayDiv=jQuery('<div></div>');if(settings.indicatorID){indicatorID=settings.indicatorID;}
else{indicatorID=jQuery(this).attr('id');}
jQuery(loadingDiv).attr('id','loading-indicator-'+indicatorID);jQuery(loadingDiv).addClass('loading-indicator');if(settings.addClass){jQuery(loadingDiv).addClass(settings.addClass);}
jQuery(overlayDiv).css('display','none');jQuery(document.body).append(overlayDiv);jQuery(overlayDiv).attr('id','loading-indicator-'+indicatorID+'-overlay');jQuery(overlayDiv).addClass('loading-indicator-overlay');if(settings.addClass){jQuery(overlayDiv).addClass(settings.addClass+'-overlay');}
var overlay_width;var overlay_height;var border_top_width=jQuery(this).css('border-top-width');var border_left_width=jQuery(this).css('border-left-width');border_top_width=isNaN(parseInt(border_top_width))?0:border_top_width;border_left_width=isNaN(parseInt(border_left_width))?0:border_left_width;var overlay_left_pos=jQuery(this).offset().left+parseInt(border_left_width);var overlay_top_pos=jQuery(this).offset().top+parseInt(border_top_width);if(settings.overlayWidth!==null){overlay_width=settings.overlayWidth;}
else{overlay_width=parseInt(jQuery(this).width())+parseInt(jQuery(this).css('padding-right'))+parseInt(jQuery(this).css('padding-left'));}
if(settings.overlayHeight!==null){overlay_height=settings.overlayWidth;}
else{overlay_height=parseInt(jQuery(this).height())+parseInt(jQuery(this).css('padding-top'))+parseInt(jQuery(this).css('padding-bottom'));}
jQuery(overlayDiv).css('width',overlay_width.toString()+'px');jQuery(overlayDiv).css('height',overlay_height.toString()+'px');jQuery(overlayDiv).css('left',overlay_left_pos.toString()+'px');jQuery(overlayDiv).css('position','absolute');jQuery(overlayDiv).css('top',overlay_top_pos.toString()+'px');jQuery(overlayDiv).css('z-index',settings.overlayZIndex);if(settings.overlayCSS){jQuery(overlayDiv).css(settings.overlayCSS);}
jQuery(loadingDiv).css('display','none');jQuery(document.body).append(loadingDiv);jQuery(loadingDiv).css('position','absolute');jQuery(loadingDiv).css('z-index',settings.indicatorZIndex);var indicatorTop=overlay_top_pos;if(settings.marginTop){indicatorTop+=parseInt(settings.marginTop);}
var indicatorLeft=overlay_left_pos;if(settings.marginLeft){indicatorLeft+=parseInt(settings.marginTop);}
if(settings.hPos.toString().toLowerCase()=='center'){jQuery(loadingDiv).css('left',(indicatorLeft+((jQuery(overlayDiv).width()-parseInt(jQuery(loadingDiv).width()))/2)).toString()+'px');}
else if(settings.hPos.toString().toLowerCase()=='left'){jQuery(loadingDiv).css('left',(indicatorLeft+parseInt(jQuery(overlayDiv).css('margin-left'))).toString()+'px');}
else if(settings.hPos.toString().toLowerCase()=='right'){jQuery(loadingDiv).css('left',(indicatorLeft+(jQuery(overlayDiv).width()-parseInt(jQuery(loadingDiv).width()))).toString()+'px');}
else{jQuery(loadingDiv).css('left',(indicatorLeft+parseInt(settings.hPos)).toString()+'px');}
if(settings.vPos.toString().toLowerCase()=='center'){jQuery(loadingDiv).css('top',(indicatorTop+((jQuery(overlayDiv).height()-parseInt(jQuery(loadingDiv).height()))/2)).toString()+'px');}
else if(settings.vPos.toString().toLowerCase()=='top'){jQuery(loadingDiv).css('top',indicatorTop.toString()+'px');}
else if(settings.vPos.toString().toLowerCase()=='bottom'){jQuery(loadingDiv).css('top',(indicatorTop+(jQuery(overlayDiv).height()-parseInt(jQuery(loadingDiv).height()))).toString()+'px');}
else{jQuery(loadingDiv).css('top',(indicatorTop+parseInt(settings.vPos)).toString()+'px');}
if(settings.css){jQuery(loadingDiv).css(settings.css);}
var callback_options={'overlay':overlayDiv,'indicator':loadingDiv,'element':this};if(typeof(settings.beforeShow)=='function'){settings.beforeShow(callback_options);}
jQuery(overlayDiv).show();jQuery(loadingDiv).show();if(typeof(settings.afterShow)=='function'){settings.afterShow(callback_options);}
return this;};jQuery.fn.hideLoading=function(options){var settings={};jQuery.extend(settings,options);if(settings.indicatorID){indicatorID=settings.indicatorID;}
else{indicatorID=jQuery(this).attr('id');}
jQuery(document.body).find('#loading-indicator-'+indicatorID).remove();jQuery(document.body).find('#loading-indicator-'+indicatorID+'-overlay').remove();return this;};
;
/*
 * SimpleModal 1.4.1 - jQuery Plugin
 * http://www.ericmmartin.com/projects/simplemodal/
 * Copyright (c) 2010 Eric Martin (http://twitter.com/ericmmartin)
 * Dual licensed under the MIT and GPL licenses
 * Revision: $Id: jquery.simplemodal.js 261 2010-11-05 21:16:20Z emartin24 $
 */
(function(d){var k=d.browser.msie&&parseInt(d.browser.version)===6&&typeof window.XMLHttpRequest!=="object",m=d.browser.msie&&parseInt(d.browser.version)===7,l=null,f=[];d.modal=function(a,b){return d.modal.impl.init(a,b)};d.modal.close=function(){d.modal.impl.close()};d.modal.focus=function(a){d.modal.impl.focus(a)};d.modal.setContainerDimensions=function(){d.modal.impl.setContainerDimensions()};d.modal.setPosition=function(){d.modal.impl.setPosition()};d.modal.update=function(a,b){d.modal.impl.update(a,
b)};d.fn.modal=function(a){return d.modal.impl.init(this,a)};d.modal.defaults={appendTo:"body",focus:true,opacity:50,overlayId:"simplemodal-overlay",overlayCss:{},containerId:"simplemodal-container",containerCss:{},dataId:"simplemodal-data",dataCss:{},minHeight:null,minWidth:null,maxHeight:null,maxWidth:null,autoResize:false,autoPosition:true,zIndex:1E3,close:true,closeHTML:'<a class="modalCloseImg" title="Close"></a>',closeClass:"simplemodal-close",escClose:true,overlayClose:false,position:null,
persist:false,modal:true,onOpen:null,onShow:null,onClose:null};d.modal.impl={d:{},init:function(a,b){var c=this;if(c.d.data)return false;l=d.browser.msie&&!d.boxModel;c.o=d.extend({},d.modal.defaults,b);c.zIndex=c.o.zIndex;c.occb=false;if(typeof a==="object"){a=a instanceof jQuery?a:d(a);c.d.placeholder=false;if(a.parent().parent().size()>0){a.before(d("<span></span>").attr("id","simplemodal-placeholder").css({display:"none"}));c.d.placeholder=true;c.display=a.css("display");if(!c.o.persist)c.d.orig=
a.clone(true)}}else if(typeof a==="string"||typeof a==="number")a=d("<div></div>").html(a);else{alert("SimpleModal Error: Unsupported data type: "+typeof a);return c}c.create(a);c.open();d.isFunction(c.o.onShow)&&c.o.onShow.apply(c,[c.d]);return c},create:function(a){var b=this;f=b.getDimensions();if(b.o.modal&&k)b.d.iframe=d('<iframe src="javascript:false;"></iframe>').css(d.extend(b.o.iframeCss,{display:"none",opacity:0,position:"fixed",height:f[0],width:f[1],zIndex:b.o.zIndex,top:0,left:0})).appendTo(b.o.appendTo);
b.d.overlay=d("<div></div>").attr("id",b.o.overlayId).addClass("simplemodal-overlay").css(d.extend(b.o.overlayCss,{display:"none",opacity:b.o.opacity/100,height:b.o.modal?f[0]:0,width:b.o.modal?f[1]:0,position:"fixed",left:0,top:0,zIndex:b.o.zIndex+1})).appendTo(b.o.appendTo);b.d.container=d("<div></div>").attr("id",b.o.containerId).addClass("simplemodal-container").css(d.extend(b.o.containerCss,{display:"none",position:"fixed",zIndex:b.o.zIndex+2})).append(b.o.close&&b.o.closeHTML?d(b.o.closeHTML).addClass(b.o.closeClass):
"").appendTo(b.o.appendTo);b.d.wrap=d("<div></div>").attr("tabIndex",-1).addClass("simplemodal-wrap").css({height:"100%",outline:0,width:"100%"}).appendTo(b.d.container);b.d.data=a.attr("id",a.attr("id")||b.o.dataId).addClass("simplemodal-data").css(d.extend(b.o.dataCss,{display:"none"})).appendTo("body");b.setContainerDimensions();b.d.data.appendTo(b.d.wrap);if(k||l)b.fixIE()},bindEvents:function(){var a=this;d("."+a.o.closeClass).bind("click.simplemodal",function(b){b.preventDefault();a.close()});
a.o.modal&&a.o.close&&a.o.overlayClose&&a.d.overlay.bind("click.simplemodal",function(b){b.preventDefault();a.close()});d(document).bind("keydown.simplemodal",function(b){if(a.o.modal&&b.keyCode===9)a.watchTab(b);else if(a.o.close&&a.o.escClose&&b.keyCode===27){b.preventDefault();a.close()}});d(window).bind("resize.simplemodal",function(){f=a.getDimensions();a.o.autoResize?a.setContainerDimensions():a.o.autoPosition&&a.setPosition();if(k||l)a.fixIE();else if(a.o.modal){a.d.iframe&&a.d.iframe.css({height:f[0],
width:f[1]});a.d.overlay.css({height:f[0],width:f[1]})}})},unbindEvents:function(){d("."+this.o.closeClass).unbind("click.simplemodal");d(document).unbind("keydown.simplemodal");d(window).unbind("resize.simplemodal");this.d.overlay.unbind("click.simplemodal")},fixIE:function(){var a=this,b=a.o.position;d.each([a.d.iframe||null,!a.o.modal?null:a.d.overlay,a.d.container],function(c,h){if(h){var g=h[0].style;g.position="absolute";if(c<2){g.removeExpression("height");g.removeExpression("width");g.setExpression("height",
'document.body.scrollHeight > document.body.clientHeight ? document.body.scrollHeight : document.body.clientHeight + "px"');g.setExpression("width",'document.body.scrollWidth > document.body.clientWidth ? document.body.scrollWidth : document.body.clientWidth + "px"')}else{var e;if(b&&b.constructor===Array){c=b[0]?typeof b[0]==="number"?b[0].toString():b[0].replace(/px/,""):h.css("top").replace(/px/,"");c=c.indexOf("%")===-1?c+' + (t = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"':
parseInt(c.replace(/%/,""))+' * ((document.documentElement.clientHeight || document.body.clientHeight) / 100) + (t = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"';if(b[1]){e=typeof b[1]==="number"?b[1].toString():b[1].replace(/px/,"");e=e.indexOf("%")===-1?e+' + (t = document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft) + "px"':parseInt(e.replace(/%/,""))+' * ((document.documentElement.clientWidth || document.body.clientWidth) / 100) + (t = document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft) + "px"'}}else{c=
'(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (t = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"';e='(document.documentElement.clientWidth || document.body.clientWidth) / 2 - (this.offsetWidth / 2) + (t = document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft) + "px"'}g.removeExpression("top");g.removeExpression("left");g.setExpression("top",
c);g.setExpression("left",e)}}})},focus:function(a){var b=this;a=a&&d.inArray(a,["first","last"])!==-1?a:"first";var c=d(":input:enabled:visible:"+a,b.d.wrap);setTimeout(function(){c.length>0?c.focus():b.d.wrap.focus()},10)},getDimensions:function(){var a=d(window);return[d.browser.opera&&d.browser.version>"9.5"&&d.fn.jquery<"1.3"||d.browser.opera&&d.browser.version<"9.5"&&d.fn.jquery>"1.2.6"?a[0].innerHeight:a.height(),a.width()]},getVal:function(a,b){return a?typeof a==="number"?a:a==="auto"?0:
a.indexOf("%")>0?parseInt(a.replace(/%/,""))/100*(b==="h"?f[0]:f[1]):parseInt(a.replace(/px/,"")):null},update:function(a,b){var c=this;if(!c.d.data)return false;c.d.origHeight=c.getVal(a,"h");c.d.origWidth=c.getVal(b,"w");c.d.data.hide();a&&c.d.container.css("height",a);b&&c.d.container.css("width",b);c.setContainerDimensions();c.d.data.show();c.o.focus&&c.focus();c.unbindEvents();c.bindEvents()},setContainerDimensions:function(){var a=this,b=k||m,c=a.d.origHeight?a.d.origHeight:d.browser.opera?
a.d.container.height():a.getVal(b?a.d.container[0].currentStyle.height:a.d.container.css("height"),"h");b=a.d.origWidth?a.d.origWidth:d.browser.opera?a.d.container.width():a.getVal(b?a.d.container[0].currentStyle.width:a.d.container.css("width"),"w");var h=a.d.data.outerHeight(true),g=a.d.data.outerWidth(true);a.d.origHeight=a.d.origHeight||c;a.d.origWidth=a.d.origWidth||b;var e=a.o.maxHeight?a.getVal(a.o.maxHeight,"h"):null,i=a.o.maxWidth?a.getVal(a.o.maxWidth,"w"):null;e=e&&e<f[0]?e:f[0];i=i&&i<
f[1]?i:f[1];var j=a.o.minHeight?a.getVal(a.o.minHeight,"h"):"auto";c=c?a.o.autoResize&&c>e?e:c<j?j:c:h?h>e?e:a.o.minHeight&&j!=="auto"&&h<j?j:h:j;e=a.o.minWidth?a.getVal(a.o.minWidth,"w"):"auto";b=b?a.o.autoResize&&b>i?i:b<e?e:b:g?g>i?i:a.o.minWidth&&e!=="auto"&&g<e?e:g:e;a.d.container.css({height:c,width:b});a.d.wrap.css({overflow:h>c||g>b?"auto":"visible"});a.o.autoPosition&&a.setPosition()},setPosition:function(){var a=this,b,c;b=f[0]/2-a.d.container.outerHeight(true)/2;c=f[1]/2-a.d.container.outerWidth(true)/
2;if(a.o.position&&Object.prototype.toString.call(a.o.position)==="[object Array]"){b=a.o.position[0]||b;c=a.o.position[1]||c}else{b=b;c=c}a.d.container.css({left:c,top:b})},watchTab:function(a){var b=this;if(d(a.target).parents(".simplemodal-container").length>0){b.inputs=d(":input:enabled:visible:first, :input:enabled:visible:last",b.d.data[0]);if(!a.shiftKey&&a.target===b.inputs[b.inputs.length-1]||a.shiftKey&&a.target===b.inputs[0]||b.inputs.length===0){a.preventDefault();b.focus(a.shiftKey?"last":
"first")}}else{a.preventDefault();b.focus()}},open:function(){var a=this;a.d.iframe&&a.d.iframe.show();if(d.isFunction(a.o.onOpen))a.o.onOpen.apply(a,[a.d]);else{a.d.overlay.show();a.d.container.show();a.d.data.show()}a.o.focus&&a.focus();a.bindEvents()},close:function(){var a=this;if(!a.d.data)return false;a.unbindEvents();if(d.isFunction(a.o.onClose)&&!a.occb){a.occb=true;a.o.onClose.apply(a,[a.d])}else{if(a.d.placeholder){var b=d("#simplemodal-placeholder");if(a.o.persist)b.replaceWith(a.d.data.removeClass("simplemodal-data").css("display",
a.display));else{a.d.data.hide().remove();b.replaceWith(a.d.orig)}}else a.d.data.hide().remove();a.d.container.hide().remove();a.d.overlay.hide();a.d.iframe&&a.d.iframe.hide().remove();setTimeout(function(){a.d.overlay.remove();a.d={}},10)}}}})(jQuery);
;
/*
 * jQuery StickyForms Plugin
 * Authors: Ryan Schwartz & Joshua Giese (JQByte.com)
 * Examples and documentation at: http://www.jqbyte.com/StickyForms/documentation.php
 * Copyright (c) 2011 JQByte
 * Version: 1.0 (1-APR-2011)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */

(function($){
	
	// Set methods
	var methods = {
		
		// Initialize
		init : function(options){
			return this.each(function() {
				
				// Set defaults
				var settings = {
					'debug': 'false', // [true/false] Enable debugging
					'elementTypes'	: 'all', // [text,password,checkbox,radio,textarea,select-one,select-multipe,all] separate element types with comma separated values (default is all)
					'cookieLifetime': '60', // [integer] number of days of cookie lifetime
					'disableOnSubmit': 'true', // [true/false] disable submitting the form while the form is processing
					'excludeElementIDs': '', // [ID1,ID2] exclude element IDs with comma separated values
					'scope'			: 'global', // [single/global] should the values be sticky only on this form (single) or across all forms on site (default is global)
					'disableIfGetSet' : '' // [$_GET var] set to the $_GET var.  If this $_GET var is present, it will automatically disable the plugin.
				};

				// Check for options
				if(options){ 
					$.extend(settings,options);
				}
				
				// Save settings
				$(this).data('SFSettings', settings);
				
				// Check if we should disable the plugin
				if(settings.disableIfGetSet != ""){
					var getVal = SFGet(settings.disableIfGetSet);
					if(getVal != ''){
						return this;
					}
				}

				// Bind form elements for process
				$(this).bind('submit', function() {
					$(this).StickyForm('process');
				});
				
				// Autofill data
				$(this).StickyForm('autoload');
				
				// Return this for chainability
				return this;
				
				// Get function
				function SFGet(q,s) {
				    s = (s) ? s : window.location.search;
				    var re = new RegExp('&amp;'+q+'=([^&amp;]*)','i');
				    return (s=s.replace(/^\?/,'&amp;').match(re)) ?s=s[1] :s='';
				}
				
			});
		},
		
		// Process form
		process : function(){
			return this.each(function(){				
				
				// Get settings
				var settings = $(this).data('SFSettings');
				
				// Disable the form if disableOnSubmit is enabled
				if(settings.disableOnSubmit == "true"){
					$('#'+this.id+' input[type=submit]').attr("disabled","disabled");
				}

				// Set cookie expiration
				var lifetime = settings.cookieLifetime;
				var today = new Date();
				var exp   = new Date(today.getTime()+lifetime*24*60*60*1000);
				
				// Alert if debugging
				if(settings.debug == "true"){
					alert("Cookie expiration: " + exp);
				}
				
				// Save data
				var n = this.length;
				for(var i = 0; i < n; i++){
				
					// Skip exclusions
					if(settings.excludeElementIDs.indexOf(this[i].id) != -1){
						continue;
					}

					// Skip the field types we do not need to save
					if(settings.elementTypes.indexOf(this[i].type) == -1 && settings.elementTypes != "all"){
						continue;
					}
					
					// Always skip buttons, hiddens, and submits
					if(this[i].type == "button" || this[i].type == "submit" || this[i].type == "hidden"){
						continue;
					}
					
					// Determine value
					if(this[i].type == "text" || this[i].type == "select-one" || this[i].type == "textarea" || this[i].type == "password" || this[i].type == "select-multiple"){
						var setVal = $(this[i]).val();
					}else if(this[i].type == "checkbox" || this[i].type == "radio"){
						var setVal = this[i].checked;
					}
					
					// Alert if debugging
					if(settings.debug == "true"){
						alert("Saving value: " + "(" + this[i].type + ") " + "[" + settings.scope + "] " + this[i].id + ": " + setVal);
					}
					
					// Save the cookie of current form value
					SFSetCookie("StickyForm_" + this[i].name, this.id + "||" + settings.scope + "||" + this[i].type + "||" + this[i].id + "||" + setVal, exp);
				}
				
				
				// Reenable the form if disableOnSubmit is enabled
				if(settings.disableOnSubmit == "true"){
					$('#'+this.id+' input[type=submit]').attr("disabled",false);
				}
				
				// Return this for chainability
				return this;
				
				// Set cookie
				function SFSetCookie(name, value, expires) {
					document.cookie = name + "=" + escape(value) + "; path=/" + ((expires == null) ? "" : "; expires=" + expires.toGMTString());
				}
			});
		},
		
		// Autoload form
		autoload : function(){
			return this.each(function() {
				
				// Loop through form elements and load cookies (if found)
				var n = this.length;
				for(var i = 0; i < n; i++){
				
					// Get cookie
					var c = SFGetCookie("StickyForm_" + this[i].name);
					if(c != null){

						var split = c.split("||");
						var form = split[0];
						var scope = split[1];
						var type = split[2];
						var elementID = split[3];
						var val = split[4];
						
						// Validate scope
						if(scope != "global" && this.id != form){
							continue;
						}

						// Load text, select-one, password, and textarea values
						if(this[i].type == "text" || this[i].type == "select-one" || this[i].type == "select-multiple" || this[i].type == "textarea" || this[i].type == "password"){
							this[i].value = val;
						}
						
						// Load select-multiple
						if((this[i].type == "select-multiple") && val != "null"){
						    var val_list = val.split(",");
						    var sm_id = "#" + $(this[i]).attr("id");
						    $(val_list).each(function(){
						        $(sm_id + " option[value="+this+"]").attr('selected','selected');
						    });

						}
						
						// Load checkboxes and radios
						if((this[i].type == "checkbox" || this[i].type == "radio") && val == "true"){
							this[i].checked = 'true';
						}
					}
				}
				
				// Return this for chainability
				return this;
				
				// Get the cookie
				function SFGetCookie(name){
					var cname = name + "=";               
					var dc = document.cookie;             
					    if (dc.length > 0) {              
					    begin = dc.indexOf(cname);       
					        if (begin != -1) {           
					        begin += cname.length;       
					        end = dc.indexOf(";", begin);
					            if (end == -1) end = dc.length;
					            return unescape(dc.substring(begin, end));
					        } 
					    }
					return null;
				}
				
			});
		}
	};
	
	// Declare plugin
	$.fn.StickyForm = function(method){  
		
		if (methods[method]) {
			return methods[method].apply(this,Array.prototype.slice.call(arguments,1));
		}else if(typeof method === 'object' || ! method) {
			return methods.init.apply(this,arguments);
		}else{
			$.error('Method ' + method + ' does not exist on jQuery.StickyForm');
		}

	};
})(jQuery);

;
/**
 * @author Craig Tockman - this controls various asspects of the navigation
 */
jQuery(document).ready(function(jQuery) {


    /*jQuery('#nav .expanded').hover(

    function() {
        jQuery(this).addClass('navbarHover');
    }, function() {
        jQuery(this).removeClass('navbarHover');
    });


    jQuery('.nav-bar .flyout:eq(0)').addClass('drop-1');
    jQuery('.nav-bar .flyout:eq(1)').addClass('drop-2');
    jQuery('.nav-bar .flyout:eq(2)').addClass('drop-3');
    jQuery('.nav-bar .flyout:eq(3)').addClass('drop-4');
    jQuery('.nav-bar .flyout:eq(4)').addClass('drop-5');
    jQuery('.nav-bar .flyout:eq(5)').addClass('drop-6');*/

    function makeShow() {
        jQuery(".header-menu-sl", this).stop(true, true).show();
        jQuery(this).addClass('hover');
    }

    function makeHide() {
        jQuery(".header-menu-sl", this).hide();
        jQuery(this).removeClass('hover');
    }

    // call only if hoverIntent exist
    var menu_parent = jQuery(".header-menu-parent", this);
    if (typeof menu_parent.hoverIntent !== 'undefined') {
        menu_parent.hoverIntent({
            over: makeShow,
            timeout: 300,
            out: makeHide
        });
    }

});;
// JavaScript Document
var windowHeight = window.innerHeight - 75;
var modalOptions = {
    opacity: 60,
    overlayCss: {
        backgroundColor: "black"
    },
    overlayClose: true,
    maxWidth: 850 - 56,
    maxHeight: windowHeight - 47
};

(function($) {
    $(document).ready(function() {

        $('#lang-dropdown li').hide(); /*reoder dropdown*/
        if ($('body').hasClass('i18n-en-gb')) {
            jQuery("#euro").show();
            jQuery("#na").insertAfter('#euro');
            jQuery("#aust").insertAfter('#euro');
        }
        if ($('body').hasClass('i18n-en-AU')) {
            jQuery("#aust").show();
            jQuery("#na").insertAfter('#aust');
            jQuery("#euro").insertAfter('#na');
        } else {
            jQuery("#na").show();
            jQuery("#euro").insertAfter('#na');
            jQuery("#aust").insertAfter('#euro');
        }

        /*hide show on hover*/
        jQuery("#lang-dropdown").hover(function() {
            jQuery("#euro, #na, #aust").show();
        }, function() {

            if ($('body').hasClass('i18n-en-gb')) {
                jQuery("#euro").show();
                jQuery("#na, #aust").hide();
            }
            if ($('body').hasClass('i18n-en-AU')) {
                jQuery("#aust").show();
                jQuery("#na, #euro").hide();
            } else {
                jQuery("#euro, #aust").hide();
                jQuery("#na").show();
            }
        });

        jQuery("#lang-dropdown li").hover(
        function() {
            jQuery(this).addClass('foot-hover');
        }, function() {
            jQuery(this).removeClass('foot-hover');
        });

        //solr result removal
        $(".solr-delete-index").click(function() {
            $(this).hide();
            apacheurl = decodeURI($(this).attr("apacheurl"));
            index_id = $(this).attr("id");
            label = $(this).attr("label");
            url = $(this).attr("url");

            var post_url = location.hostname;
            if (location.protocol == 'https:') post_url = 'https://' + post_url;
            else post_url = 'http://' + post_url;

            post_url = post_url + '/docusign-solr-index.php';

            $.post(post_url, {
                action: 'delete',
                apacheurl: apacheurl,
                id: index_id,
                label: label,
                url: url
            }, function(data) {
                //do nothing
            });
            $(this).parent().parent().attr("style", "background-color: rgba(255,0,0,.1)");
        });

        //ajax lightbox links
        $("a.lightbox,a.overlay").click(function() {
            imgRegEx = /^.+\.(jpg|png|gif|jpeg)$/i;
            $loader = $('<div class="modal-content"></div>');
            $loader.css({
                width: $(window).width(),
                height: $(window).height(),
                padding: '20px 0 0 0',
                position: 'absolute',
                top: 0,
                left: 0
            });
            $loader.prependTo("body");
            $loader.showLoading();
            if (imgRegEx.test($(this).attr("href"))) {
                $loader.html('<img src="' + $(this).attr("href") + '"/>');
                $loader.find('img').load(function() {
                    if ($loader.find('img').width() > 600) {
                        $loader.find('img').width(600);
                    }
                    $loader.hideLoading();
                    $loader.hide();
                    $loader.width("auto").height("auto").css("position", "relative");
                    $('#simplemodal-container .modal-content').show();
                    $loader.modal(modalOptions);
                });
            } else {
                $loader.load($(this).attr("href") + " #content .node.view-mode-full", {}, function() {
                    $loader.hideLoading();
                    $loader.hide();
                    $loader.width("auto").height("auto").css("position", "relative");
                    brightcove.createExperiences();
                    $('#simplemodal-container .modal-content').show();
                    $loader.modal(modalOptions);
                });
            }
            return false;
        });

        //add hover class to nav items and CTA buttons
        $('#navigation ul.nice-menu li, #cta-menu .button').hover(function() {
            $(this).addClass('hover');
        }, function() {
            $(this).removeClass('hover');
        });


        //GA code for Europe in CTA dropdown
        setupGALangLinks('.language-link');

        //modal trigger
        $('.modal-trigger').click(function() {
            $('#' + $(this).attr('rel')).modal(modalOptions);

        });

        //MediaElement Video player
        $('video,audio').mediaelementplayer();

        //international pages switcher
        $('#select-international-languages').change(switchLanguage);


        //init resources drawers
        var resourcesNodes = $('.node-resources');
        if (resourcesNodes.length > 1) {
            initDrawer(resourcesNodes);
        }

        //chat now form
        $('#form-chat .checkval').focus(function() {
            if ($(this).val() == $(this).attr("default")) $(this).val('');
        }).blur(function() {
            //alert($(this).val());
            if (jQuery.trim($(this).val()) == '') $(this).val($(this).attr("default"));
        });
        $('#form-chat').submit(function(e) {
            ds_clear_errors("#form-chat");
            var chat_errors = 0;
            $('.checkval', $(this)).each(function() {
                if ($(this).val() == $(this).attr("default") || $(this).val() == "") {
                    $(this).addClass("error");
                    chat_errors++;
                }
            });
            if (chat_errors == 0) {
                var chatWindow = window.open('about:blank', 'dsChatWindow', 'status=1,toolbar=0,location=0,menubar=0,directories=0,resizable=1,scrollbars=1,width=700,height=400');
                $(this).attr("target", "dsChatWindow");
                chatWindow.focus();
                return true;
            } else {
                e.preventDefault();
                return false;
            }
        });

        //Fade out messages
        jQuery(document).ready(function() {
            jQuery('.ds-1col .watch-the-video').each(

            function() {
                var link = jQuery(this).find('a').attr('href');
                var classes = jQuery(this).find('a').attr('class');
                jQuery(this).prepend('<a href="' + link + '" class="videoWatch ' + classes + '"></a>');
            });
            jQuery('.ds-1col .watch-the-video').each(

            function() {
                jQuery(this).parent().hover(function() {
                    jQuery(this).parent().find('.videoWatch').show();
                    jQuery(this).parent().find('.testimonial:first').css('background-color', '#ccc');
                }, function() {
                    jQuery('.videoWatch').hide();
                    jQuery(this).parent().find('.testimonial:first').css('background-color', '#fff');
                })
            });
            jQuery('.ds-1col .watch-the-video').mouseenter().mouseleave();

            jQuery("#main").before('<a href="/customers" id="hoverState"></a>');

            jQuery(".view-customers-trust-homepage").hover(

            function() {
                jQuery("#hoverState").css("display", "block");
            }

            );

            jQuery("#hoverState").mouseout(

            function() {
                jQuery("#hoverState").hide();
            });
            setTimeout(function() {
                jQuery("div.messages").fadeOut("slow", function() {
                    jQuery("div.messages").remove();
                });
            }, 5000);
            //5 seconds
        });

        //Facebook Authentication stuff for Marketplace Reviews
        if ($("#fb-root").size() > 0) {
            window.fbAsyncInit = function() {
                FB.init({
                    appId: '173566362705765',
                    status: true,
                    cookie: true,
                    xfbml: true
                });
                $("#fb-review-trigger").click(function(ev) {
                    ev.preventDefault();
                    FB.getLoginStatus(function(response) {
                        if (response.session) {
                            // logged in and connected user, someone you know
                            //alert('connected to FB');
                            showCommentForm(FB, response);
                        } else {
                            // no user session available, someone you dont know
                            //alert('not connected to FB');
                            FB.login(function(response) {
                                if (response.session) {
                                    alert('logged in, yo');
                                    showCommentForm(FB, response);
                                } else {
                                    // user cancelled login
                                }
                            });
                        }
                    });
                });
                $("#fb-logout").click(function() {
                    FB.logout(function(response) {
                        // user is now logged out
                        //alert('user logged out');
                    });
                });
            };
            (function() {
                var e = document.createElement('script');
                e.async = true;
                e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
                document.getElementById('fb-root').appendChild(e);
            }());

        }

        function showCommentForm(FB, response) {
            //alert(FB);
            $('#comment-form-wrapper').modal();
            FB.api('/me', function(response) {
                //alert(response);
                //$('#fb-name').html(response.name);
                //$('#fb-user').html(JSON.stringify(response));
                $('#edit-field-reviewer-name input').val(response.name);
                $('form#comment-form').attr("action", $('form#comment-form').attr("rel"));

            });
        };
        // End FB authentication stuff
    });
    //End document.ready

    function switchLanguage() {
        location.href = $(this).val();
        return true;
    };

    function initDrawer(nodes) {
        nodes.each(function() {
            var speed = 300;
            var btn = $('.node-title a', this);
            var content = $('.content', this);
            var expHeight = content.children('div').outerHeight(true);
            btn.click(function(event) {
                event.preventDefault();
                if (content.height() < 1) {
                    content.animate({
                        'height': expHeight
                    }, {
                        duration: speed
                    });
                } else {
                    content.animate({
                        'height': 0
                    }, {
                        duration: speed
                    });
                }
            });
        });
    };

    function initDrawerView(nodes) {
        nodes.each(function() {
            var speed = 300,
                btn = $('.views-field-title a', this),
                content = $('.views-field-body', this);

            btn.click(function(event) {
                event.preventDefault();
                if (content.is(':visible')) {
                    content.slideUp();
                } else {
                    content.slideDown();
                }
            });
        });
    };

})(jQuery);

/* Facebook Auth stuff */

//Eloqua
var _elqQ = _elqQ || [];
_elqQ.push(['elqSetSiteId', '566810826']);
_elqQ.push(['elqTrackPageView']);
(function() {
    function async_load() {
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = '/elqNow/elqCfg.min.js';
        var x = document.getElementsByTagName('script')[0];
        x.parentNode.insertBefore(s, x);
    }

    if (window.addEventListener) window.addEventListener('DOMContentLoaded', async_load, false);
    else if (window.attachEvent) window.attachEvent('onload', async_load);
})();

//Stickforms for Eloqua
jQuery(function() {
    if (jQuery('#form-cta-contact').length) {
        jQuery('#form-cta-contact').StickyForm({
            'excludeElementIDs': 'contact_category'
        });
    }

    if (jQuery('#form-cta-demo').length) {
        jQuery('#form-cta-demo').StickyForm();
    }
});

jQuery(function() {
    if (jQuery('#whitepaper-registrationform').length > 0) {
        jQuery('#whitepaper-registrationform').StickyForm();
    }
});
//stickyforms firstname+lastname for demo dropdown
jQuery(function() {

    if (document.cookie.indexOf("StickyForm_first_name") != "-1") {
        var nameEQ = "StickyForm_first_name" + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ')
            c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) {
                var thecookie = c.substring(nameEQ.length, c.length);
            }
        }

        var piece = thecookie.split("%7C%7C");
        //||
        var fname = piece[4];
    }
    if (document.cookie.indexOf("StickyForm_last_name") != "-1") {
        var nameEQ = "StickyForm_last_name" + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ')
            c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) {
                var thecookie = c.substring(nameEQ.length, c.length);
            }
        }

        var piece = thecookie.split("%7C%7C");
        //||
        var lname = piece[4];
    }

    if (document.cookie.indexOf("StickyForm_fullname") != "-1") {
        var nameEQ = "StickyForm_fullname" + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ')
            c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) {
                var thecookie = c.substring(nameEQ.length, c.length);
            }
        }

        var piece = thecookie.split("%7C%7C");
        //||
        var fullname = piece[4];
        fullname = fullname.replace('%20', ' ');
        splitName(fullname);
    }

    if ((fname != undefined) && (lname != undefined)) {
        jQuery('#fullname').val(fname + " " + lname);
        jQuery('#form-cta-demo input[name="FirstName"]').val(fname);
        jQuery('#form-cta-demo input[name="LastName"]').val(lname);
    }

    jQuery('#form-cta-demo input[name="fullname"]').keyup(function(e) {
        splitName(jQuery(this).val());
    });

    jQuery('#form-cta-demo input[name="fullname"]').blur(function(e) {
        splitName(jQuery(this).val());
    });

    jQuery('#form-cta-contact input[name="first_name"]').keyup(function(e) {
        stickyforms_contact2demo();
    });
    jQuery('#form-cta-contact input[name="last_name"]').keyup(function(e) {
        stickyforms_contact2demo();
    });
    jQuery('#form-cta-contact input[name="email"]').keyup(function(e) {
        stickyforms_contact2demo();
    });

    function splitName(fullName) {
        var firstName;
        var lastName = '';

        fullName = fullName.split(' ');
        firstName = fullName[0];

        for (var i = 1; i < fullName.length; i++) {
            if (fullName[i] !== '' && fullName[i] !== 'undefined') {
                lastName += fullName[i];
                if (typeof fullName[i + 1] !== 'undefined') {
                    lastName += ' ';
                }
            }
        }

        jQuery('#form-cta-demo input[name="FirstName"], #form-cta-contact input[name="first_name"]').val(firstName);
        jQuery('#form-cta-demo input[name="LastName"], #form-cta-contact input[name="last_name"]').val(lastName);
    }

    function stickyforms_contact2demo() {
        var firstName = jQuery('#form-cta-contact input[name="first_name"]').val(),
            lastName = jQuery('#form-cta-contact input[name="last_name"]').val(),
            email = jQuery('#form-cta-contact input[name="email"]').val();
        jQuery('#form-cta-demo input[name="FirstName"]').val(firstName);
        jQuery('#form-cta-demo input[name="LastName"]').val(lastName);
        jQuery('#form-cta-demo input[name="fullname"]').val(firstName + ' ' + lastName);
        jQuery('#form-cta-demo input[name="email"]').val(email);
    }


    jQuery("#contact_category").change(function() {
        if (jQuery("#contact_category").val() == "sales") {
            jQuery("#sales_form").show();
            jQuery("#support_form").hide();
        } else if (jQuery("#contact_category").val() == "support") {
            if (!jQuery.support.opacity) {
                location.href = "http://community.docusign.com";
            }
            jQuery("#support_form").show();
            jQuery("#sales_form").hide();
            if (!jQuery("#lia-ac-ask-expert-supportzone-container").length) {
                location.href = "http://community.docusign.com";
            }
        } else if (jQuery("#contact_category").val() == "partner") {
            jQuery("#support_form").hide();
            jQuery("#sales_form").hide();
            location.href = "http://www.docusign.com/partners/become-partner";
        } else if (jQuery("#contact_category").val() == "press") {
            jQuery("#support_form").hide();
            jQuery("#sales_form").hide();
            location.href = "http://www.docusign.com/company/press_room";
        }
    });

});


/*search*/
jQuery(document).ready(function() {
    //html5 placeholders for forms
    jQuery('#search-api-page-search-form-support-search #edit-keys-12').attr('placeholder', 'Ask your question');
    jQuery('#search-api-page-search-form-primary-search .form-text, #edit-keys-11, #edit-keys-11--2').attr('placeholder', 'Search');
    jQuery('.page-search #search-api-page-search-form-primary-search .form-text').attr('placeholder', 'Enter search terms');
    jQuery('#fourofour #search-api-page-search-form-primary-search #edit-keys-11').attr('placeholder', 'Search for the page you were looking for...');
    jQuery('#search-api-page-search-form-blog-search #edit-keys-14').attr('placeholder', 'Search Blog');

    //expand search field onfocus
    jQuery("#nav-wrapper #search-api-page-search-form-primary-search input.form-text, #nav-wrapper #search-api-page-search-form-primary-search--2 input.form-text").focus(function() {
        jQuery(this).animate({
            width: 200
        }, 500, function() {
            // Animation complete.
        });
        jQuery(this).css('border-radius', '7px 7px 0 0');
    });

    jQuery("#nav-wrapper #search-api-page-search-form-primary-search input.form-text, #nav-wrapper #search-api-page-search-form-primary-search--2 input.form-text").blur(function() {
        jQuery(this).animate({
            width: 69
        }, 500, function() {
            // Animation complete.
        });
        jQuery(this).css('border-radius', '7px');
    });


    //fade out alert message
    jQuery("#alert-message-x").click(function() {
        jQuery('#alert-message').hide();
        jQuery('#header').css({
            'background-position': '0 0',
            'height': '72px'
        })

    });

    //make pricing home page white-box clickable
    jQuery('#individualUs, #home-p-1').click(function() {
        document.location.href = '/signup';
    });

    jQuery('#professionalUs, #home-p-2').click(function() {
        document.location.href = '/signup';
    });

    jQuery('#realtorsUs').click(function() {
        document.location.href = '/products-and-pricing/real-estate-editions';
    });

    jQuery('#businessUs, #home-p-3').click(function() {
        document.location.href = '/products-and-pricing/business';
    });
    jQuery('#freeUk').click(function() {
        document.location.href = '/products-and-pricing/free';
    });

    jQuery('#professionalUk').click(function() {
        document.location.href = '/signup';
    });
    jQuery('#individualUk').click(function() {
        document.location.href = '/signup';
    });

    jQuery('#businessUk').click(function() {
        document.location.href = '/products-and-pricing/business';
    });


    //when the Login button is clicked, track it in Analytics
    jQuery("#btn-login").click(function() {
        _gaq.push(['_trackEvent', 'TopNav', 'Click', 'Login']);
    });
    if (location.href.match("co.uk")) {
        jQuery("#block-logo a").attr("href", "/europe");
    }
    //open PDFs in a new tab
    jQuery('.field-name-field-pdf a').attr('target', '_blank');
    jQuery(function($) {
        $('a[href$=".pdf"]').attr('target', '_blank');
    });
});


setupGALangLinks = function(id) {
    var links = jQuery(id);
    links.unbind('click');
    links.click(triggerGALangLink);

}

triggerGALangLink = function(event) {
    event.preventDefault();
    var href = jQuery(this).attr('href');
    //   _gaq.push(['_link',  href ]); 
    var body = jQuery('body');
    body.append('<form method="POST" id="langform" action="' + href + '" />');
    var langform = jQuery('#langform');
    var data = jQuery('<input type="hidden" name="cookieGA"/>');
    data.val(document.cookie);
    langform.append(data);
    langform.submit();

};
/* Modernizr 2.6.2 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-fontface-backgroundsize-borderimage-borderradius-boxshadow-flexbox-flexboxlegacy-hsla-multiplebgs-opacity-rgba-textshadow-cssanimations-csscolumns-generatedcontent-cssgradients-cssreflections-csstransforms-csstransforms3d-csstransitions-applicationcache-canvas-canvastext-draganddrop-hashchange-history-audio-video-indexeddb-input-inputtypes-localstorage-postmessage-sessionstorage-websockets-websqldatabase-webworkers-geolocation-inlinesvg-smil-svg-svgclippaths-touch-webgl-shiv-cssclasses-addtest-prefixed-teststyles-testprop-testallprops-hasevent-prefixes-domprefixes-css_boxsizing-svg_filters-load
 */
;window.Modernizr=function(a,b,c){function C(a){j.cssText=a}function D(a,b){return C(n.join(a+";")+(b||""))}function E(a,b){return typeof a===b}function F(a,b){return!!~(""+a).indexOf(b)}function G(a,b){for(var d in a){var e=a[d];if(!F(e,"-")&&j[e]!==c)return b=="pfx"?e:!0}return!1}function H(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:E(f,"function")?f.bind(d||b):f}return!1}function I(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+p.join(d+" ")+d).split(" ");return E(b,"string")||E(b,"undefined")?G(e,b):(e=(a+" "+q.join(d+" ")+d).split(" "),H(e,b,c))}function J(){e.input=function(c){for(var d=0,e=c.length;d<e;d++)u[c[d]]=c[d]in k;return u.list&&(u.list=!!b.createElement("datalist")&&!!a.HTMLDataListElement),u}("autocomplete autofocus list placeholder max min multiple pattern required step".split(" ")),e.inputtypes=function(a){for(var d=0,e,f,h,i=a.length;d<i;d++)k.setAttribute("type",f=a[d]),e=k.type!=="text",e&&(k.value=l,k.style.cssText="position:absolute;visibility:hidden;",/^range$/.test(f)&&k.style.WebkitAppearance!==c?(g.appendChild(k),h=b.defaultView,e=h.getComputedStyle&&h.getComputedStyle(k,null).WebkitAppearance!=="textfield"&&k.offsetHeight!==0,g.removeChild(k)):/^(search|tel)$/.test(f)||(/^(url|email)$/.test(f)?e=k.checkValidity&&k.checkValidity()===!1:e=k.value!=l)),t[a[d]]=!!e;return t}("search tel url email datetime date month week time datetime-local number range color".split(" "))}var d="2.6.2",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k=b.createElement("input"),l=":)",m={}.toString,n=" -webkit- -moz- -o- -ms- ".split(" "),o="Webkit Moz O ms",p=o.split(" "),q=o.toLowerCase().split(" "),r={svg:"http://www.w3.org/2000/svg"},s={},t={},u={},v=[],w=v.slice,x,y=function(a,c,d,e){var f,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),l.appendChild(j);return f=["&#173;",'<style id="s',h,'">',a,"</style>"].join(""),l.id=h,(m?l:n).innerHTML+=f,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=g.style.overflow,g.style.overflow="hidden",g.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),g.style.overflow=k),!!i},z=function(){function d(d,e){e=e||b.createElement(a[d]||"div"),d="on"+d;var f=d in e;return f||(e.setAttribute||(e=b.createElement("div")),e.setAttribute&&e.removeAttribute&&(e.setAttribute(d,""),f=E(e[d],"function"),E(e[d],"undefined")||(e[d]=c),e.removeAttribute(d))),e=null,f}var a={select:"input",change:"input",submit:"form",reset:"form",error:"img",load:"img",abort:"img"};return d}(),A={}.hasOwnProperty,B;!E(A,"undefined")&&!E(A.call,"undefined")?B=function(a,b){return A.call(a,b)}:B=function(a,b){return b in a&&E(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=w.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(w.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(w.call(arguments)))};return e}),s.flexbox=function(){return I("flexWrap")},s.flexboxlegacy=function(){return I("boxDirection")},s.canvas=function(){var a=b.createElement("canvas");return!!a.getContext&&!!a.getContext("2d")},s.canvastext=function(){return!!e.canvas&&!!E(b.createElement("canvas").getContext("2d").fillText,"function")},s.webgl=function(){return!!a.WebGLRenderingContext},s.touch=function(){var c;return"ontouchstart"in a||a.DocumentTouch&&b instanceof DocumentTouch?c=!0:y(["@media (",n.join("touch-enabled),("),h,")","{#modernizr{top:9px;position:absolute}}"].join(""),function(a){c=a.offsetTop===9}),c},s.geolocation=function(){return"geolocation"in navigator},s.postmessage=function(){return!!a.postMessage},s.websqldatabase=function(){return!!a.openDatabase},s.indexedDB=function(){return!!I("indexedDB",a)},s.hashchange=function(){return z("hashchange",a)&&(b.documentMode===c||b.documentMode>7)},s.history=function(){return!!a.history&&!!history.pushState},s.draganddrop=function(){var a=b.createElement("div");return"draggable"in a||"ondragstart"in a&&"ondrop"in a},s.websockets=function(){return"WebSocket"in a||"MozWebSocket"in a},s.rgba=function(){return C("background-color:rgba(150,255,150,.5)"),F(j.backgroundColor,"rgba")},s.hsla=function(){return C("background-color:hsla(120,40%,100%,.5)"),F(j.backgroundColor,"rgba")||F(j.backgroundColor,"hsla")},s.multiplebgs=function(){return C("background:url(https://),url(https://),red url(https://)"),/(url\s*\(.*?){3}/.test(j.background)},s.backgroundsize=function(){return I("backgroundSize")},s.borderimage=function(){return I("borderImage")},s.borderradius=function(){return I("borderRadius")},s.boxshadow=function(){return I("boxShadow")},s.textshadow=function(){return b.createElement("div").style.textShadow===""},s.opacity=function(){return D("opacity:.55"),/^0.55$/.test(j.opacity)},s.cssanimations=function(){return I("animationName")},s.csscolumns=function(){return I("columnCount")},s.cssgradients=function(){var a="background-image:",b="gradient(linear,left top,right bottom,from(#9f9),to(white));",c="linear-gradient(left top,#9f9, white);";return C((a+"-webkit- ".split(" ").join(b+a)+n.join(c+a)).slice(0,-a.length)),F(j.backgroundImage,"gradient")},s.cssreflections=function(){return I("boxReflect")},s.csstransforms=function(){return!!I("transform")},s.csstransforms3d=function(){var a=!!I("perspective");return a&&"webkitPerspective"in g.style&&y("@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}",function(b,c){a=b.offsetLeft===9&&b.offsetHeight===3}),a},s.csstransitions=function(){return I("transition")},s.fontface=function(){var a;return y('@font-face {font-family:"font";src:url("https://")}',function(c,d){var e=b.getElementById("smodernizr"),f=e.sheet||e.styleSheet,g=f?f.cssRules&&f.cssRules[0]?f.cssRules[0].cssText:f.cssText||"":"";a=/src/i.test(g)&&g.indexOf(d.split(" ")[0])===0}),a},s.generatedcontent=function(){var a;return y(["#",h,"{font:0/0 a}#",h,':after{content:"',l,'";visibility:hidden;font:3px/1 a}'].join(""),function(b){a=b.offsetHeight>=3}),a},s.video=function(){var a=b.createElement("video"),c=!1;try{if(c=!!a.canPlayType)c=new Boolean(c),c.ogg=a.canPlayType('video/ogg; codecs="theora"').replace(/^no$/,""),c.h264=a.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/,""),c.webm=a.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,"")}catch(d){}return c},s.audio=function(){var a=b.createElement("audio"),c=!1;try{if(c=!!a.canPlayType)c=new Boolean(c),c.ogg=a.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),c.mp3=a.canPlayType("audio/mpeg;").replace(/^no$/,""),c.wav=a.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),c.m4a=(a.canPlayType("audio/x-m4a;")||a.canPlayType("audio/aac;")).replace(/^no$/,"")}catch(d){}return c},s.localstorage=function(){try{return localStorage.setItem(h,h),localStorage.removeItem(h),!0}catch(a){return!1}},s.sessionstorage=function(){try{return sessionStorage.setItem(h,h),sessionStorage.removeItem(h),!0}catch(a){return!1}},s.webworkers=function(){return!!a.Worker},s.applicationcache=function(){return!!a.applicationCache},s.svg=function(){return!!b.createElementNS&&!!b.createElementNS(r.svg,"svg").createSVGRect},s.inlinesvg=function(){var a=b.createElement("div");return a.innerHTML="<svg/>",(a.firstChild&&a.firstChild.namespaceURI)==r.svg},s.smil=function(){return!!b.createElementNS&&/SVGAnimate/.test(m.call(b.createElementNS(r.svg,"animate")))},s.svgclippaths=function(){return!!b.createElementNS&&/SVGClipPath/.test(m.call(b.createElementNS(r.svg,"clipPath")))};for(var K in s)B(s,K)&&(x=K.toLowerCase(),e[x]=s[K](),v.push((e[x]?"":"no-")+x));return e.input||J(),e.addTest=function(a,b){if(typeof a=="object")for(var d in a)B(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof f!="undefined"&&f&&(g.className+=" "+(b?"":"no-")+a),e[a]=b}return e},C(""),i=k=null,function(a,b){function k(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function l(){var a=r.elements;return typeof a=="string"?a.split(" "):a}function m(a){var b=i[a[g]];return b||(b={},h++,a[g]=h,i[h]=b),b}function n(a,c,f){c||(c=b);if(j)return c.createElement(a);f||(f=m(c));var g;return f.cache[a]?g=f.cache[a].cloneNode():e.test(a)?g=(f.cache[a]=f.createElem(a)).cloneNode():g=f.createElem(a),g.canHaveChildren&&!d.test(a)?f.frag.appendChild(g):g}function o(a,c){a||(a=b);if(j)return a.createDocumentFragment();c=c||m(a);var d=c.frag.cloneNode(),e=0,f=l(),g=f.length;for(;e<g;e++)d.createElement(f[e]);return d}function p(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return r.shivMethods?n(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+l().join().replace(/\w+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(r,b.frag)}function q(a){a||(a=b);var c=m(a);return r.shivCSS&&!f&&!c.hasCSS&&(c.hasCSS=!!k(a,"article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}mark{background:#FF0;color:#000}")),j||p(a,c),a}var c=a.html5||{},d=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,e=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,f,g="_html5shiv",h=0,i={},j;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",f="hidden"in a,j=a.childNodes.length==1||function(){b.createElement("a");var a=b.createDocumentFragment();return typeof a.cloneNode=="undefined"||typeof a.createDocumentFragment=="undefined"||typeof a.createElement=="undefined"}()}catch(c){f=!0,j=!0}})();var r={elements:c.elements||"abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",shivCSS:c.shivCSS!==!1,supportsUnknownElements:j,shivMethods:c.shivMethods!==!1,type:"default",shivDocument:q,createElement:n,createDocumentFragment:o};a.html5=r,q(b)}(this,b),e._version=d,e._prefixes=n,e._domPrefixes=q,e._cssomPrefixes=p,e.hasEvent=z,e.testProp=function(a){return G([a])},e.testAllProps=I,e.testStyles=y,e.prefixed=function(a,b,c){return b?I(a,b,c):I(a,"pfx")},g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+v.join(" "):""),e}(this,this.document),function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))},Modernizr.addTest("boxsizing",function(){return Modernizr.testAllProps("boxSizing")&&(document.documentMode===undefined||document.documentMode>7)}),Modernizr.addTest("svgfilters",function(){var a=!1;try{a=typeof SVGFEColorMatrixElement!==undefined&&SVGFEColorMatrixElement.SVG_FECOLORMATRIX_TYPE_SATURATE==2}catch(b){}return a});;
(function () {

  var kExtraParams = "ExtraParams"; 
  var trackerCookieName = "_EXT_TRACKER_COOKIE_";

  var trackerPixelServer = "http://pixel.captora.com/img/pix.gif";
  var trackerPixelServerHttps = "https://pixel.captora.com/img/pix.gif";

  var _user_cookie = "";
  var _domain_ = "";
  var _referrer_ = "";
  var _ref_query_ = "";

  var _user_state ="";

  // New functions

  var _global_page_type_ = "Non Captora";

  window.cpPixelLogUserState = function(state) {
    _user_state = state;
    pixelLog();
  }

  function getReferrerDomain() {
    if (document.referrer) {
      url = document.referrer;
      var ref = url.match(/:\/\/(.[^/]+)/)[1];
      if (ref.indexOf("google") != -1 && url.indexOf("aclk") != -1) {
        return "PPC";
      }
      return ref;
    }
    return "";
  }

  function getPageType() {
    if (_global_page_type_ == "cpage") {
      return "Captora";
    }
    if (document.URL.indexOf("/cp/") != -1) {
      return "Captora";
    }
    if (document.URL.indexOf("/cpages/") != -1) {
      return "Captora";
    }
    if (document.URL.indexOf("-topics/") != -1) {
      return "Captora";
    }
    return "Non Captora";
  }

  function getQuery() {
    var extractedParams = {}
    extractedParams = extractUrlParams(document.referrer);
    var query = "";
    if (extractedParams.q != null) {
      query = extractedParams.q;
    } else {
      if (extractedParams.query != null) {
        query = extractedParams.query;
      }
    }
    return unescape(query);
  }

  function setFreshCookie() {
    var trackerCookie = getDomainCookie(trackerCookieName).replace(/:$/g,"");
    var present = false;
    if (trackerCookie && trackerCookie.length > 0) {
      _user_cookie_ = trackerCookie;
      present = true;
    }
    // new format does not have uid=, its ckid=
    if (trackerCookie.indexOf("uid") != -1) {
      present = false;
    }

    if (!present) {
      // console.log("Cookie not found. Setting it now:");
      var randUid = Math.round(Math.random()*100000000000);
      trackerCookieValue = "ckid=" + randUid;
      referrerDomain = getReferrerDomain();
      pageType = getPageType();
      query = getQuery();
      setDomainCookie(trackerCookieValue, referrerDomain + "," + pageType + "," + query + "__SEP__", _domain_);
      // console.log("  Setting cookie:" + referrerDomain + "," + pageType + "," + query + "__SEP__");
      _user_cookie_ = getDomainCookie(trackerCookieName);
    }
    /* else {
      // console.log("Cookie found:");
      currentUrl = document.URL;
      pageType = getPageType();
      if (pageType == "Captora") {
        pixelParams['firstentry'] = "Captora";
        var cookieVal = getDomainCookie(kExtraParams);
        // console.log("  found cookie:" + cookieVal);
        var parts = cookieVal.split(",");
        var newVal = cookieVal;
        if (parts.length == 3) { 
          newVal = parts[0] + ",Captora," + parts[2] + "__SEP__";
        }
        var baseCookieVal = getDomainCookie(trackerCookieName);
        // console.log("  Setting cookie:" + newVal);
        setDomainCookie(baseCookieVal, newVal, _domain_);
      }
    }*/
  }

  function setDomainCookie(cookieValue, extraValues, domain) {
    var expiryDate = new Date();
    // console.log("Setting:" + extraValues);
    expiryDate.setDate(expiryDate.getDate() + 365*100);
    var cookie = trackerCookieName + "=" + escape(cookieValue) +
                 "__SEP__" +  kExtraParams + "=" + extraValues +
                 "; expires=" + expiryDate.toGMTString() + "; path=/";
    if (domain) {
      cookie = cookie + "; domain="+domain
    }

    document.cookie = cookie;
  }

  function getDomainCookie(cookieName) {
    if (document.cookie && (document.cookie.length > 0)) {
      var cookieIndex = document.cookie.indexOf(cookieName + "=");
      if (cookieIndex != -1) {
        cookieIndex = cookieIndex + cookieName.length + 1;
        var cookieEndIndex = document.cookie.indexOf("__SEP__",cookieIndex);
        if (cookieEndIndex == null || cookieEndIndex == -1) {
          cookieEndIndex = document.cookie.length
        }
        return unescape(document.cookie.substring(cookieIndex, cookieEndIndex));
      }
    }
    return "";
  }

  function setMAHiddenFields() {
    if (typeof(jQuery) != 'undefined') {
      jQuery(document).ready(function() {
  // console.log("DEBUG_CP: hidden fields");
  jQuery("form").each(function() {
      var cookieVal = getDomainCookie(kExtraParams);
      var parts = cookieVal.split(",");
      var newVal = cookieVal;
      if (parts.length == 3) { 
        var origRef = parts[0];
        var firstEntry = parts[1];
        var searchTerm = parts[2];
      }
  });
      });
    }
  } 


  

  // New functions end

  var pixelParams = new Object();

  window.genericTrackerPixLogFunc = function(key, val) {
    pixelParams[key] = val;
    pixelLog();
  }

  function attachHandler(goalstr, namestr, attrstr, valstr) {
    if (typeof(jQuery) != 'undefined') {
      jQuery(document).ready(function() {
        if (goalstr != "TRACKURL") {
    jQuery("[" + attrstr + "='" + valstr + "']").change(
      function() {
        var val = jQuery(this).val();
        if (val == null || val.length < 1) {
    val = "EVENT";
        }
        genericTrackerPixLogFunc("GOAL_" + goalstr + "_" + namestr, val);
      }
    );
    jQuery("[" + attrstr + "='" + valstr + "']").click(
      function() {
        genericTrackerPixLogFunc("GOAL_" + goalstr + "_" + namestr, "CLICK");
      }
    );
  } else {
          if (document.URL.indexOf(valstr) != -1) {
            genericTrackerPixLogFunc("GOAL_" + goalstr + "_" + namestr, "TRACK");
    }
        }
      });
    }
  }

  function extractUrlParams(url) {
    var extractedParams = {};
    var questionIndex = url.indexOf("?");
    if (questionIndex >= 0 && questionIndex + 1 < url.length) {
      var paramStr = url.substring(questionIndex + 1);
      var paramVars = paramStr.split("&");
      for (var i = 0; i < paramVars.length; i++) {
        var pair = paramVars[i].split("=");
        if (pair.length == 2) {
          extractedParams[pair[0]] = pair[1];
        }
      }
    }
    return extractedParams;
  }

  function initialize(domain) {
    _referrer_ = document.referrer;
    _domain_ = domain;
    setFreshCookie();
    refParams = extractUrlParams(_referrer_);
    if (refParams.q != null) {
      _ref_query_ = refParams.q;
    }
  }

  function extractDomain(host) {
    var parts = host.split(".");
    var n = parts.length;
    if (n <= 2) {
      return host
    }
    if (parts[n-1].length <= 2 && parts[n-2].length<=3) {
      return parts[n-3]+"."+parts[n-2]+"."+parts[n-1]
    } else {
      return parts[n-2]+"."+parts[n-1]
    }
  }

  function truncateUrl(url, max) {
    if (url == null || !url) {
      return "";
    }
    return url.length > max ? url.substring(0, max) + "..." : url;
  }

  function constructReqParameter(key, value) {
    return key + "=" + encodeURIComponent(value);
  }

  function isEmpty(str) {
    return (!str || 0 === str.length);
  }

  function constructRequestString() {
    var reqParameters = [];

    reqParameters.push(constructReqParameter("userid", _user_cookie_));
    reqParameters.push(constructReqParameter("domain", _domain_));
    if (document.referrer != null && document.referrer.length > 0) {
      reqParameters.push(constructReqParameter("referrer", truncateUrl(document.referrer, 10000)));
    }
    reqParameters.push(constructReqParameter("rand", Math.random()));
    reqParameters.push(constructReqParameter("url", truncateUrl(location.href, 10000)));
    for (var k in pixelParams) {
      reqParameters.push(constructReqParameter(k, pixelParams[k]));
    }
    if(!isEmpty(_user_state)) reqParameters.push(constructReqParameter("user_state",_user_state));
    return reqParameters.join("&");
  }

  function pixelLog() {
    var pixelRequestString = constructRequestString();
    var img = new Image();
    if (pixelRequestString.length > 8500) {
      pixelRequestString = pixelRequestString.substr(0, 8500);
    }
    var baseUrl = ("https:" == document.location.protocol) ? trackerPixelServerHttps : trackerPixelServer;
    img.src = baseUrl + "?" + pixelRequestString;
  }

  function clearCookie(cookieName) {
    var cookieDomain = extractDomain(document.domain);
    setDomainCookie(cookieName, "", cookieDomain)
  }

  function inputFunc() {
    var namestr = jQuery(this).attr('name');
    var valstr = jQuery(this).val();
    genericTrackerPixLogFunc("GOAL_FormField_" + namestr, valstr);
  }

  function TrackJS(domain) {
    if (typeof(jQuery) != 'undefined') {
      jQuery(document).ready(function() {
        jQuery("input").blur(inputFunc);
      });
    };

    initialize(domain);
    setMAHiddenFields();
    pixelLog();
  }

  var localVar;
  window.ExtTrackerPix = {
    getTracker: function (domain) {
      if (!localVar) {
        localVar = new TrackJS(domain)
      }
      return localVar;
    }
  }
}());

var pix = ExtTrackerPix.getTracker("docusign.com");;
