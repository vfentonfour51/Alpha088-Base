/**
 * Created with JetBrains WebStorm.
 * User: rmelanson
 * Date: 6/13/13
 * Time: 10:31 AM
 * To change this template use File | Settings | File Templates.
 */
//this file should contain common shared matchers and support functions

//ngScenario for Test Runner doesn't like nested IT blocks, so DON'T DO IT, it will fail miserably and not tell you why.

angular.scenario.dsl('scope', function() {
    return function(selector, entry) {
        return this.addFutureAction('find scope variable for \'' + selector + '\'',
            function($window, $document, done) {
                var $ = $window.$; // jQuery inside the iframe
                var elem = $(selector);
                if (!elem.length) {
                    return done('No element matched \'' + selector + '\'.');
                }
                var entries = entry.split('.');
                var prop = elem.scope();
                for (var i in entries) {
                    prop = prop[entries[i]];
                }
                done(null, prop);
            });
    };
});
angular.scenario.matcher('toEqualFuture', function(future) {
    return this.actual === future.value;
});
angular.scenario.matcher('toBeGreaterThanFuture', function(future) {
    return +this.actual > +future.value;
});
function includes(array, obj) {
    return indexOf(array, obj) != -1;
}
function indexOf(array, obj) {
    if (array.indexOf) return array.indexOf(obj);

    for ( var i = 0; i < array.length; i++) {
        if (obj === array[i]) return i;
    }
    return -1;
}
angular.scenario.matcher('toContainFuture', function(future) {
    return includes(this.actual, future.value);
});

//localization value constants
const C_currSymbol = "$"; const C_currThousandSeparator = ","; const C_currDecimalSeparator = ".";

Number.prototype.formatMoney = function(c){ //found this currency formatting function on stackoverflow, modified a little

    var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        cn = C_currSymbol,
        d = C_currDecimalSeparator,
        t = C_currThousandSeparator,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + cn + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

//navigation functions
function e2eClickHome(){
    element('#451qa_home_link').click();
}
function e2eClickOrders(){
    element('#451qa_order_link').click();
}
function e2eClickFaves(){
    element('#451qa_fave_link').click();
}
function e2eClickAccount(){
    element('#451qa_acct_link').click();
}
function e2eClickUser(){
    element('#451qa_acct_link2').click();
    element('#451qa_user_link').click();
}
function e2eClickAddresses(){
    element('#451qa_acct_link2').click();
    element('#451qa_addy_link').click();
}
function e2eClickMessages(){
    element('#451qa_acct_link2').click();
    element('#451qa_mesg_link').click();
}

function e2eClickSideNavCategory(intCatLevel,strCatName){
    var strNLevelsSelect = ""; //each level of depth is "ul li "
    var strSelector = "";
    for(var i = 0; i < intCatLevel; i++){
        strNLevelsSelect = strNLevelsSelect + "ul li "
    }

    if(strCatName != null){
        strSelector = ".451_cat_item " + strNLevelsSelect + "a:contains('" + strCatName + "'):first"
    }
    else{//if strcatname isn't specified just pick the first at the nth level
        strSelector = ".451_cat_item " + strNLevelsSelect + "a:first"
    }

    element(strSelector).click();
}
function e2eClickMainNavCategory(intNthCat,strCatName){
    var strSelector = "";

    if(strCatName != null){
        strSelector = ".451_lbl_subcatlist ul li a:contains('" + strCatName + "'):first"
    }
    else{//if strcatname isn't specified just pick the first at the nth level
        strSelector = ".451_lbl_subcatlist ul li:nth-child(" + intNthCat + ") a"
    }

    element(strSelector).click();
}
function e2eClickOpenCategory(){
    //open the category tree that's hidden by default
    sleep(3); //timing issue, sleep a few seconds
    element('#451qa_nav_hdr ul li').click();
}

//product functions
function e2eClickProductFromList(intNthProd,strProdName){
    var strSelector = "";

    if(strProdName != null){
        strSelector = "#451_lst_prod .451qa_prod_item:has(div h3:contains('" + strProdName + "')) div a";
    }
    else{//if strProdName isn't specified just pick the first at the nth level
        strSelector = "#451_lst_prod .451qa_prod_item:eq(" + intNthProd + ") div a";
    }

    element(strSelector).click();
}
function e2eViewProductFromInteropID(strProdInteropID){
    browser().navigateTo('../../app/index.html#/product/default/' + strProdInteropID);
}

function e2eClickVariantFromProductList(intNthVariant,strVariantName){
    var strSelector = "";

    if(strVariantName != null){
        strSelector = ".451_list_vars tbody tr td a:contains('" + strVariantName + "'):first";

    }
    else{//if strProdName isn't specified just pick the first at the nth level
        strSelector = ".451_list_vars tbody tr:nth-child(" + intNthVariant + ") td a"; //this may function incorrectly until the header <TR> is changed to <TH> or something else
    }

    element(strSelector).click();
}

//inside product functions (changing, checking, etc)
function e2eChangeProdQty(blnRestrictedQty,intQty){

    if(blnRestrictedQty){ //if restricted quantity we use the select box, otherwise the input box
        //keep in mind the selectbox is 0 based, conditional upon the options presented, so the 1st option is 0, 2nd option is 1, and so on, not necessarily qty 0, qty 2, qty 4, etc
        select("lineitem.Quantity").option(intQty);
    }
    else{
        input("lineitem.Quantity").enter(intQty);
    }

}

function verifyStaticSpecRow(strGroup,intRow,strLabel,strValue){
    expect(element('.451qa_sg_item:contains("' + strGroup + '") ~ li div:eq(' + intRow + ') span:first').text()).toBe(strLabel);
    expect(element('.451qa_sg_item:contains("' + strGroup + '") ~ li div:eq(' + intRow + ') span:eq(1)').text()).toBe(strValue);
}

function verifyVariantRow(intRow,strLabel,strDescription){
    expect(element('.451_list_vars tr:eq(' + intRow + ') td:first').text()).toBe(strLabel);
    expect(element('.451_list_vars tr:eq(' + intRow + ') td:nth-child(2)').text()).toBe(strDescription);

}